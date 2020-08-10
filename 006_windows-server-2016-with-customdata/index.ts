import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";

const exampleId = "006";

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
    ],
    tags,
});

// ネットワークセキュリティグループの作成
const nsg = new azure.network.NetworkSecurityGroup(`nsg-${exampleId}`, {
    resourceGroupName,
    securityRules: [
        {
            name: "allow-rdp",
            access: "Allow",
            direction: "Inbound",
            protocol: "Tcp",
            priority: 100,
            destinationAddressPrefix: "*",
            destinationPortRange: "3389",
            sourceAddressPrefix: "*",
            sourcePortRange: "*",
            description: "Allow RDP",
        },
        {
            name: "allow-winrm-https",
            access: "Allow",
            direction: "Inbound",
            protocol: "Tcp",
            priority: 101,
            destinationAddressPrefix: "*",
            destinationPortRange: "5986",
            sourceAddressPrefix: "*",
            sourcePortRange: "*",
            description: "Allow WinRM(HTTPS)",
        }
    ],
    tags,
});

// VM用パブリックIPアドレスの作成
const publicIp = new azure.network.PublicIp(`publicip-${exampleId}`, {
    resourceGroupName,
    allocationMethod: "Dynamic",
    tags,
});

// VM用ネットワークインターフェースの作成
const nic = new azure.network.NetworkInterface(`nic-${exampleId}`, {
    resourceGroupName,
    ipConfigurations: [
        {
            name: "ipcfg",
            subnetId: vnet.subnets[0].id,
            privateIpAddressAllocation: "Dynamic",
            publicIpAddressId: publicIp.id,
        }
    ],
    tags,
});

// VM用ネットワークインターフェースとネットワークセキュリティグループの関連付け
const nsgassoc = new azure.network.NetworkInterfaceSecurityGroupAssociation(`nsgassoc-${exampleId}`, {
    networkInterfaceId: nic.id,
    networkSecurityGroupId: nsg.id,
});

// AnsibleでWindowsを操作するための設定を行うPowerShellスクリプト
const provisioningScript = `
$url = "https://raw.githubusercontent.com/ansible/ansible/devel/examples/scripts/ConfigureRemotingForAnsible.ps1"
Invoke-WebRequest -UseBasicParsing $url | Invoke-Expression
`;
// PowerShellスクリプトの文字列をBase64エンコードする
const encodedScript = Buffer.from(provisioningScript).toString("base64");

// VMの作成
const vm = new azure.compute.WindowsVirtualMachine(`vm-${exampleId}`, {
    resourceGroupName,
    networkInterfaceIds: [
        nic.id,
    ],
    adminUsername: username,
    adminPassword: password,
    size: "Standard_B2s",
    computerName: `ws2016`,
    timezone: "Tokyo Standard Time",
    osDisk: {
        storageAccountType: "Standard_LRS",
        caching: "ReadWrite",
    },
    sourceImageReference: {
        publisher: "MicrosoftWindowsServer",
        offer: "WindowsServer",
        sku: "2016-Datacenter",
        version: "latest",
    },
    // CustomDataは %SystemDrive%\AzureData\CustomData.bin ファイルとして配置される
    customData: encodedScript,
    tags,
});

// カスタムスクリプト拡張機能
const ext = new azure.compute.Extension(`csext-${exampleId}`, {
    publisher: "Microsoft.Compute",
    type: "CustomScriptExtension",
    typeHandlerVersion: "1.10",
    virtualMachineId: vm.id,
    protectedSettings: JSON.stringify({
        CommandToExecute: 'rename %SystemDrive%\\AzureData\\CustomData.bin script.ps1 && ' +
          'powershell -NoProfile -ExecutionPolicy Unrestricted -File "%SystemDrive%\\AzureData\\script.ps1" ' +
          '> %SystemDrive%\\AzureData\\out.log 2>&1',
    }),
    tags,
});

// Azureリソースのデプロイ完了を待ち合わせ
const done = pulumi.all([
    vm,
]);

// VMのパブリックIPアドレスをエクスポート
export const ipAddresses = done.apply(data => data.map(vm => vm.publicIpAddress));
