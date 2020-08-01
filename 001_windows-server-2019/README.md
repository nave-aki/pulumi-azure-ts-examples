# Deploy a Windows Server 2019

Windows Server 2019のVMを作成する。

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
     Type                                                       Name                         Plan
 +   pulumi:pulumi:Stack                                        001_windows-server-2019-dev  create
 +   ├─ azure:core:ResourceGroup                                rg-001                       create
 +   ├─ azure:network:PublicIp                                  publicip-001                 create
 +   ├─ azure:network:VirtualNetwork                            vnet-001                     create
 +   ├─ azure:network:NetworkSecurityGroup                      nsg-001                      create
 +   ├─ azure:network:NetworkInterface                          nic-001                      create
 +   ├─ azure:network:NetworkInterfaceSecurityGroupAssociation  nsgassoc-001                 create
 +   └─ azure:compute:WindowsVirtualMachine                     vm-001                       create

Resources:
    + 8 to create
```

## Deploy

```
pulumi up
```

## Delete

```
pulumi destroy
```
