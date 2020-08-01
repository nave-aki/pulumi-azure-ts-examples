# Deploy a Windows Server 2016 with BGInfo extension

Windows Server 2016のVMを作成し、BGInfo拡張機能を追加する。

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
     Type                                                       Name                                               Plan
 +   pulumi:pulumi:Stack                                        002_windows-server-2016-with-bginfo-extension-dev  create
 +   ├─ azure:core:ResourceGroup                                rg-002                                             create
 +   ├─ azure:network:NetworkSecurityGroup                      nsg-002                                            create
 +   ├─ azure:network:VirtualNetwork                            vnet-002                                           create
 +   ├─ azure:network:PublicIp                                  publicip-002                                       create
 +   ├─ azure:network:NetworkInterface                          nic-002                                            create
 +   ├─ azure:network:NetworkInterfaceSecurityGroupAssociation  nsgassoc-002                                       create
 +   ├─ azure:compute:WindowsVirtualMachine                     vm-002                                             create
 +   └─ azure:compute:Extension                                 vmext-002                                          create

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
