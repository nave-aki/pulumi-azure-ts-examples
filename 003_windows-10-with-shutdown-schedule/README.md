# Deploy a Windows 10 Pro with Shutdown Schedule

Windows 10 ProのVMを作成し、自動シャットダウンのスケジュールを設定する。

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
     Type                                                       Name                                       Plan
 +   pulumi:pulumi:Stack                                        003_windows-10-with-shutdown-schedule-dev  create
 +   ├─ azure:core:ResourceGroup                                rg-003                                     create
 +   ├─ azure:network:VirtualNetwork                            vnet-003                                   create
 +   ├─ azure:network:PublicIp                                  publicip-003                               create
 +   ├─ azure:network:NetworkSecurityGroup                      nsg-003                                    create
 +   ├─ azure:network:NetworkInterface                          nic-003                                    create
 +   ├─ azure:compute:WindowsVirtualMachine                     vm-003                                     create
 +   ├─ azure:network:NetworkInterfaceSecurityGroupAssociation  nsgassoc-003                               create
 +   └─ azure:devtest:GlobalVMShutdownSchedule                  sdsch-003                                  create

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
