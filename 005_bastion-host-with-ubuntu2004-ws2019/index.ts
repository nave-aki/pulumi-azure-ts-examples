import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";

const exampleId = "005";

// configの取得
const config = new pulumi.Config();

// configから管理者ユーザ名とパスワードの取得
const username = config.require("username");
const password = config.requireSecret("password");

const projectName = pulumi.getProject();
const stackName = pulumi.getStack();
// Azureリソースに付けるタグ
const tags = {
    env: `${projectName}/${stackName}`,
    example_id: exampleId,
};


// ここからAzureリソースの作成

// リソースグループの作成
const resourceGroupName = new azure.core.ResourceGroup(`rg-${exampleId}`, {
    tags,
}).name;

// 仮想ネットワークの作成
const vnet = new azure.network.VirtualNetwork(`vnet-${exampleId}`, {
    resourceGroupName,
    addressSpaces: [
        "10.0.0.0/16",
    ],
    subnets: [
        {
            name: "default",
            addressPrefix: "10.0.1.0/24",
        },
        // Bastion Host用に AzureBastionSubnet という名前のサブネットが必要
        {
            name: "AzureBastionSubnet",
            addressPrefix: "10.0.2.0/24",
        },
    ],
    tags,
});

// ネットワークセキュリティグループの作成
const nsg = new azure.network.NetworkSecurityGroup(`nsg-${exampleId}`, {
    resourceGroupName,
    securityRules: [
        {
            name: "allow-ssh-rdp-vnet",
            access: "Allow",
            direction: "Inbound",
            protocol: "Tcp",
            priority: 100,
            destinationAddressPrefix: "VirtualNetwork",
            destinationPortRanges: [
                "22",
                "3389",
            ],
            sourceAddressPrefix: "VirtualNetwork",
            sourcePortRange: "*",
            description: "Allow SSH and RDP",
        },
    ],
    tags,
});

// 仮想ネットワークから指定した名前のsubnetを取得する補助関数
function findSubnetByName(vnet: azure.network.VirtualNetwork, name: string) {
    return vnet.subnets.apply(subnets => {
        const subnet = subnets.find(subnet => subnet.name === name);
        if (subnet === undefined) {
            throw new Error(`Subnet "${name}" not found.`);
        }
        return subnet;
    });
}

// Bastion Host用のパブリックIPアドレスの作成
const publicIp = new azure.network.PublicIp(`publicip-${exampleId}`, {
    resourceGroupName,
    // Static を指定する必要がある
    allocationMethod: "Static",
    // Standard を指定する必要がある
    sku: "Standard",
});

// Bastion Hostの作成
const bastion = new azure.compute.BastionHost(`bastion-${exampleId}`, {
    resourceGroupName,
    ipConfiguration: {
        name: "bastion-publicip",
        // AzureBastionSubnet という名前のサブネットのIDを指定する必要がある
        subnetId: findSubnetByName(vnet, "AzureBastionSubnet").id,
        publicIpAddressId: publicIp.id,
    },
    tags,
});

// 作成するVM用のパラメータ
const vmparams = [
    {
        osType: "linux",
        name: "ubuntu2004",
        args: {
            disablePasswordAuthentication: false,
            sourceImageReference: {
                publisher: "Canonical",
                offer: "0001-com-ubuntu-server-focal",
                sku: "20_04-lts",
                version: "latest",
            },
        }
    },
    {
        osType: "windows",
        name: "ws2019",
        args: {
            timezone: "Tokyo Standard Time",
            sourceImageReference: {
                publisher: "MicrosoftWindowsServer",
                offer: "WindowsServer",
                sku: "2019-Datacenter",
                version: "latest",
            },
        },
    },
];

const vms = vmparams.map((vmparam) => {
    const name = vmparam.name;

    // VM用ネットワークインターフェースの作成
    const nic = new azure.network.NetworkInterface(`nic-${name}-${exampleId}`, {
        resourceGroupName: resourceGroupName,
        ipConfigurations: [
            {
                name: "ipcfg",
                subnetId: findSubnetByName(vnet, "default").id,
                privateIpAddressAllocation: "Dynamic",
            }
        ],
        tags,
    });

    // VM用ネットワークインターフェースとネットワークセキュリティグループ関連付けの設定
    const linuxVmSga = new azure.network.NetworkInterfaceSecurityGroupAssociation(`nsgassoc-${name}-${exampleId}`, {
        networkInterfaceId: nic.id,
        networkSecurityGroupId: nsg.id,
    });

    // Linux VMとWindows VMで共通のパラメータ
    const commonVmArgs = {
        resourceGroupName,
        networkInterfaceIds: [
            nic.id,
        ],
        adminUsername: username,
        adminPassword: password,
        size: "Standard_B2s",
        computerName: `${name}-${exampleId}`,
        osDisk: {
            storageAccountType: "Standard_LRS",
            caching: "ReadWrite",
        },
        tags,
    };

    if (vmparam.osType === "linux") {
        // Linux VMの作成
        const vm = new azure.compute.LinuxVirtualMachine(`${name}-${exampleId}`, {
            ...commonVmArgs,
            ...vmparam.args,
        });
        return vm;
    } else {
        const vm = new azure.compute.WindowsVirtualMachine(`${name}-${exampleId}`, {
            ...commonVmArgs,
            ...vmparam.args,
        });
        return vm;
    }
});


// Azureリソースのデプロイ完了を待ち合わせ
const done = pulumi.all(vms);

// VMの名前とプライベートIPアドレスの値をエクスポート
export const ipAddresses = done.apply(data => {
    return data.map(vm => ({
        name: vm.name,
        privateIpAddress: vm.privateIpAddress,
    }));
});
