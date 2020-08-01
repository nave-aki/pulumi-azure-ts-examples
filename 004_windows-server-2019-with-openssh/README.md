# Deploy a Windows Server 2019 and Enable OpenSSH Server

Windows Server 2019のVMを作成し、カスタムスクリプト拡張機能を利用してOpenSSH Server機能を有効にする。

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
     Type                                                       Name                                      Plan
 +   pulumi:pulumi:Stack                                        004_windows-server-2019-with-openssh-dev  create
 +   ├─ azure:core:ResourceGroup                                rg-004                                    create
 +   ├─ azure:network:PublicIp                                  publicip-004                              create
 +   ├─ azure:network:VirtualNetwork                            vnet-004                                  create
 +   ├─ azure:network:NetworkSecurityGroup                      nsg-004                                   create
 +   ├─ azure:network:NetworkInterface                          nic-004                                   create
 +   ├─ azure:network:NetworkInterfaceSecurityGroupAssociation  nsgassoc-004                              create
 +   ├─ azure:compute:WindowsVirtualMachine                     vm-004                                    create
 +   └─ azure:compute:Extension                                 csext-004                                 create

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
