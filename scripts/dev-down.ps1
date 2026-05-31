#Requires -Version 5.1
<#
.SYNOPSIS
  Apaga el entorno de desarrollo REV: contenedores Docker y, opcionalmente, puertos locales.

.PARAMETER SkipDocker
  No ejecuta docker compose down.

.PARAMETER StopDevPorts
  Cierra procesos en puertos 8761,8080-8083,8085,8088,8099,5173 (Maven/Vite). No mata Docker Desktop.

.PARAMETER RemoveVolumes
  Pasa -v a compose down (elimina datos Postgres/Keycloak locales).
#>
param(
  [switch]$SkipDocker,
  [switch]$StopDevPorts,
  [switch]$RemoveVolumes
)

$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'dev-ports-common.ps1')

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ComposeFile = Join-Path $RepoRoot 'docker-compose.yml'

if (-not $SkipDocker) {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Warning 'Docker no esta en PATH; se omite compose down.'
  } elseif (-not (Test-Path $ComposeFile)) {
    Write-Warning "No se encontro $ComposeFile ; se omite compose down."
  } else {
    Write-Host 'Bajando contenedores REV (infra y perfil apps si estaba activo)...' -ForegroundColor Cyan
    Push-Location $RepoRoot
    try {
      $downArgs = @('down', '--remove-orphans')
      if ($RemoveVolumes) {
        $downArgs += '-v'
        Write-Host '  (con -v: se eliminan volumenes locales de Postgres)' -ForegroundColor DarkYellow
      }
      $exitCode = Invoke-RevCompose -ComposeFile $ComposeFile -Arguments $downArgs
      if ($exitCode -ne 0) {
        Write-Warning "compose down codigo $exitCode"
      }
      Write-Host 'Limpiando redes del proyecto rev...' -ForegroundColor Cyan
      Remove-RevProjectNetworksIfUnused
    } finally {
      Pop-Location
    }
  }
} else {
  Write-Host 'SkipDocker: no se ejecuto docker compose down.' -ForegroundColor DarkGray
}

if ($StopDevPorts) {
  Write-Host 'StopDevPorts: liberando puertos de desarrollo...' -ForegroundColor Cyan
  Stop-ProcessOnLocalPort -Ports $script:RevDevPorts
}

Write-Host ''
Write-Host 'Listo.' -ForegroundColor Green
if (-not $StopDevPorts) {
  Write-Host 'Si Maven o Vite siguen en ventanas abiertas, cierrelas (Ctrl+C) o ejecute:' -ForegroundColor DarkGray
  Write-Host '  .\scripts\dev-down.ps1 -StopDevPorts' -ForegroundColor DarkGray
}
