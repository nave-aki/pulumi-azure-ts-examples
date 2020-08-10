# Deploy a Windows Server 2016 with Custom Data

Windows Server 2016のVMを作成しカスタムデータとしてPowerShellスクリプトを渡し、カスタムスクリプト拡張機能を利用してそのスクリプトを実行する。

## Configure

```
pulumi config set username <username>
pulumi config set password --secret <password>
```

## Preview

```
pulumi preview
```

```
Previewing update (dev):
     Type                                                       Name                                         Plan
 +   pulumi:pulumi:Stack                                        006_windows-server-2016-with-customdata-dev  create
 +   ├─ azure:core:ResourceGroup                                rg-006                                       create
 +   ├─ azure:network:VirtualNetwork                            vnet-006                                     create
 +   ├─ azure:network:NetworkSecurityGroup                      nsg-006                                      create
 +   ├─ azure:network:PublicIp                                  publicip-006                                 create
 +   ├─ azure:network:NetworkInterface                          nic-006                                      create
 +   ├─ azure:network:NetworkInterfaceSecurityGroupAssociation  nsgassoc-006                                 create
 +   ├─ azure:compute:WindowsVirtualMachine                     vm-006                                       create
 +   └─ azure:compute:Extension                                 csext-006                                    create

Resources:
    + 9 to create
```

## Deploy

```
pulumi up
```

## Delete

```
pulumi destroy
```
