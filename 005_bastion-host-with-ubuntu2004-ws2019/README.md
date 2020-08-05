# Deploy Bastion Host with Ubuntu Server 20.04 LTS and Windows Server 2019

仮想ネットワーク上にBastion Hostを作成し、パブリックIPを持たないUbuntu Server 20.04 LTS, Windows Server 2019のVMを作成する。

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
 +   pulumi:pulumi:Stack                                        005_bastion-host-with-ubuntu2004-ws2019-dev  create
 +   ├─ azure:core:ResourceGroup                                rg-005                                       create
 +   ├─ azure:network:PublicIp                                  publicip-005                                 create
 +   ├─ azure:network:NetworkSecurityGroup                      nsg-005                                      create
 +   ├─ azure:network:VirtualNetwork                            vnet-005                                     create
 +   ├─ azure:network:NetworkInterface                          nic-ws2019-005                               create
 +   ├─ azure:compute:BastionHost                               bastion-005                                  create
 +   ├─ azure:network:NetworkInterface                          nic-ubuntu2004-005                           create
 +   ├─ azure:network:NetworkInterfaceSecurityGroupAssociation  nsgassoc-ubuntu2004-005                      create
 +   ├─ azure:compute:WindowsVirtualMachine                     ws2019-005                                   create
 +   ├─ azure:network:NetworkInterfaceSecurityGroupAssociation  nsgassoc-ws2019-005                          create
 +   └─ azure:compute:LinuxVirtualMachine                       ubuntu2004-005                               create

Resources:
    + 12 to create
```

## Deploy

```
pulumi up
```

## Delete

```
pulumi destroy
```
