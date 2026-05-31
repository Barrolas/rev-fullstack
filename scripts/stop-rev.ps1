# Alias de compatibilidad -> dev-down.ps1 -StopDevPorts
param(
  [switch]$KeepDocker,
  [switch]$RemoveVolumes
)

$argsList = @('-StopDevPorts')
if ($KeepDocker) { $argsList += '-SkipDocker' }
if ($RemoveVolumes) { $argsList += '-RemoveVolumes' }
& "$PSScriptRoot\dev-down.ps1" @argsList
