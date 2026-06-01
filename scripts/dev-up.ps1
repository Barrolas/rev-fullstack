#Requires -Version 5.1

<#

.SYNOPSIS

  Levanta el entorno de desarrollo REV (Docker + backend + frontend).



.DESCRIPTION

  Modo por defecto: Docker (BD + Keycloak) + backend Maven en ventanas locales + Vite.

  Con -DockerApps: backend Spring en contenedores (perfil compose apps) + Vite local.



.PARAMETER SkipInstall

  No ejecuta npm install aunque falte node_modules.



.PARAMETER SkipDocker

  No levanta docker compose (solo Maven/Vite si aplica).



.PARAMETER SkipFrontend

  No levanta el dashboard React.



.PARAMETER SkipBackend

  Solo infra Docker (+ frontend si no SkipFrontend).



.PARAMETER DockerApps

  Levanta microservicios Spring en Docker (perfil apps). Compila JARs si faltan.



.PARAMETER SkipFreeDevPorts

  No libera puertos 8761,8080-8083,8085,8088,8099,5173 antes de Maven/Vite.



.PARAMETER Build

  Ejecuta mvn package/install antes de arrancar el backend.

#>

param(

  [switch]$SkipInstall,

  [switch]$SkipDocker,

  [switch]$SkipFrontend,

  [switch]$SkipBackend,

  [switch]$DockerApps,

  [switch]$SkipFreeDevPorts,

  [switch]$Build

)



$ErrorActionPreference = 'Stop'



. (Join-Path $PSScriptRoot 'dev-ports-common.ps1')



function Assert-Command($cmd) {

  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {

    throw "No se encontro el comando '$cmd'. Instalelo y vuelva a intentar."

  }

}



$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$ComposeFile = Join-Path $RepoRoot 'docker-compose.yml'



Write-Host "Repo: $RepoRoot" -ForegroundColor Cyan

Write-Host 'Iniciando entorno dev REV...' -ForegroundColor Cyan



Import-DotEnv (Join-Path $RepoRoot '.env')
Initialize-RevDevPortMap



if (-not $SkipDocker) {

  Assert-Command 'docker'

  if (-not (Test-Path $ComposeFile)) {

    throw "No se encontro docker-compose en: $ComposeFile"

  }

}



if (-not $SkipFrontend) { Assert-Command 'npm' }



$MavenLauncher = $null

$needsMaven = (-not $SkipBackend) -or ($DockerApps -and -not $SkipBackend)

if ($needsMaven) {

  $MavenLauncher = Get-RevMavenLauncher -RepoRoot $RepoRoot

  if (-not $MavenLauncher) {

    throw 'No se encontro mvnw.cmd ni mvn en PATH. Instale Maven o use el wrapper del repo.'

  }

}



if ($DockerApps -and -not $SkipBackend) {

  Write-Host 'Modo DockerApps: backend Spring en contenedores (perfil apps).' -ForegroundColor Cyan

  $jarsReady = Test-RevAppJarsReady -RepoRoot $RepoRoot

  if ($Build -or -not $jarsReady) {

    if (-not $jarsReady) {

      Write-Host 'JARs no encontrados en target/; compilando monorepo...' -ForegroundColor Yellow

    } else {

      Write-Host 'Compilando monorepo (skip tests)...' -ForegroundColor Cyan

    }

    Invoke-RevMavenPackage -RepoRoot $RepoRoot -MavenLauncher $MavenLauncher

  }

}



if (-not $SkipDocker) {

  if ($DockerApps -and -not $SkipBackend) {

    Write-Host 'Levantando Docker compose (infra + microservicios)...' -ForegroundColor Cyan

  } else {

    Write-Host 'Levantando Docker compose (BD + Keycloak)...' -ForegroundColor Cyan

  }

  Assert-DockerEngineReady

  Push-Location $RepoRoot

  try {

    Write-Host 'Limpiando redes del proyecto rev (sin tocar otros proyectos)...' -ForegroundColor Cyan

    Remove-RevProjectNetworksIfUnused

    $composeProfiles = @()
    if ($DockerApps -and -not $SkipBackend) {
      $composeProfiles = @('apps')
    }
    $composeExit = Invoke-RevCompose -ComposeFile $ComposeFile -Arguments @(
      'up', '-d', '--remove-orphans'
    ) -Profiles $composeProfiles

    if ($composeExit -ne 0) {

      throw "docker compose fallo (codigo $composeExit). Revise Docker Desktop."

    }

  } finally {

    Pop-Location

  }

  Wait-RevInfraReady

  if ($DockerApps -and -not $SkipBackend) {
    Write-Host 'Reiniciando keycloak-adapter (Keycloak ya configurado)...' -ForegroundColor Cyan
    $null = Invoke-RevCompose -ComposeFile $ComposeFile -Profiles @('apps') -Arguments @(
      'restart', 'keycloak-adapter'
    )
    Wait-TcpPort -Port $script:RevPortMap.KeycloakAdapter -TimeoutSec 120 -Label "Keycloak adapter ($($script:RevPortMap.KeycloakAdapter))" | Out-Null

    Write-Host 'Esperando microservicios en contenedores...' -ForegroundColor Cyan

    Wait-RevAppsReady

  }

} else {

  Write-Host 'SkipDocker: no se levanto docker compose.' -ForegroundColor DarkGray

}



if (-not $SkipBackend -and -not $DockerApps) {

  if ($Build) {

    Write-Host 'Compilando monorepo (skip tests)...' -ForegroundColor Cyan

    Invoke-RevMavenPackage -RepoRoot $RepoRoot -MavenLauncher $MavenLauncher

  }



  if (-not $SkipFreeDevPorts) {

    Write-Host 'Liberando puertos de sesiones Maven/Vite anteriores...' -ForegroundColor Cyan

    Stop-ProcessOnLocalPort -Ports $script:RevDevPorts

    Start-Sleep -Seconds 1

    Write-WarningIfPortsStillListen -Ports $script:RevDevPorts

  }



  Write-Host 'Abriendo backend en ventanas separadas (Maven local)...' -ForegroundColor Cyan

  Start-MavenTerminalJob "eureka-server (:$($script:RevPortMap.Eureka))" $RepoRoot 'infraestructuredomain/eureka-server' $MavenLauncher

  Wait-TcpPort -Port $script:RevPortMap.Eureka -TimeoutSec 120 -Label "Eureka ($($script:RevPortMap.Eureka))" | Out-Null



  Start-MavenTerminalJob "spring-boot-admin (:$($script:RevPortMap.Sba))" $RepoRoot 'infraestructuredomain/spring-boot-admin' $MavenLauncher

  Start-MavenTerminalJob "ms-incidentes (:$($script:RevPortMap.MsIncidentes))" $RepoRoot 'businessdomain/ms-incidentes' $MavenLauncher

  Start-MavenTerminalJob "ms-zonas-riesgo (:$($script:RevPortMap.MsZonas))" $RepoRoot 'businessdomain/ms-zonas-riesgo' $MavenLauncher

  Start-MavenTerminalJob "ms-recursos (:$($script:RevPortMap.MsRecursos))" $RepoRoot 'businessdomain/ms-recursos' $MavenLauncher



  Write-Host 'Esperando microservicios de negocio...' -ForegroundColor DarkGray

  Start-Sleep -Seconds 15

  Wait-TcpPort -Port $script:RevPortMap.MsIncidentes -TimeoutSec 120 -Label "MS Incidentes ($($script:RevPortMap.MsIncidentes))" | Out-Null

  Wait-TcpPort -Port $script:RevPortMap.MsZonas -TimeoutSec 120 -Label "MS Zonas ($($script:RevPortMap.MsZonas))" | Out-Null

  Wait-TcpPort -Port $script:RevPortMap.MsRecursos -TimeoutSec 120 -Label "MS Recursos ($($script:RevPortMap.MsRecursos))" | Out-Null



  Start-MavenTerminalJob "bff-rev (:$($script:RevPortMap.Bff))" $RepoRoot 'infraestructuredomain/bff-rev' $MavenLauncher

  Start-MavenTerminalJob "keycloak-adapter (:$($script:RevPortMap.KeycloakAdapter))" $RepoRoot 'infraestructuredomain/keycloak-adapter' $MavenLauncher

  Start-Sleep -Seconds 10



  Start-MavenTerminalJob "api-gateway (:$($script:RevPortMap.Gateway))" $RepoRoot 'infraestructuredomain/api-gateway' $MavenLauncher

  Wait-RevGatewayReachable

} elseif ($SkipBackend) {

  Write-Host 'SkipBackend: no se levanto el backend Spring.' -ForegroundColor DarkGray

}



if (-not $SkipFrontend) {

  if (-not $SkipFreeDevPorts) {

    Stop-ProcessOnLocalPort -Ports @($script:RevPortMap.Frontend)

  }

  $frontendDir = Join-Path $RepoRoot 'frontend\rev-dashboard'

  if (-not $SkipInstall) {

    if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {

      Write-Host 'Instalando dependencias frontend (npm install)...' -ForegroundColor Cyan

      Push-Location $frontendDir

      try { npm install } finally { Pop-Location }

    } else {

      Write-Host 'node_modules ya existe; saltando npm install.' -ForegroundColor DarkGray

    }

  }

  $fePort = $script:RevPortMap.Frontend
  Start-TerminalJob "frontend (vite :$fePort)" $frontendDir "npm run dev -- --port $fePort"

} else {

  Write-Host 'SkipFrontend: no se levanto el frontend.' -ForegroundColor DarkGray

}



Write-Host ''

Write-Host 'Listo. URLs tipicas:' -ForegroundColor Green

Write-Host "- Frontend:  http://localhost:$($script:RevPortMap.Frontend)"
Write-Host "- Gateway:   http://localhost:$($script:RevPortMap.Gateway)"
Write-Host "- Eureka:    http://localhost:$($script:RevPortMap.Eureka)"
Write-Host "- Keycloak:  http://localhost:$($script:RevPortMap.Keycloak)  (master: admin / admin)"
Write-Host "- Consola realm rev: http://localhost:$($script:RevPortMap.Keycloak)/admin/rev/console  (usuario admin / rev123)"

Write-Host '- Login app: despachador | brigadista | admin  /  rev123'

Write-Host ''

if ($DockerApps -and -not $SkipBackend) {

  Write-Host 'Backend en Docker (perfil apps). Logs: docker compose -p rev logs -f api-gateway' -ForegroundColor DarkGray

}

Write-Host 'Para bajar Docker: .\scripts\dev-down.ps1' -ForegroundColor DarkGray

Write-Host 'Para liberar puertos Maven/Vite: .\scripts\dev-down.ps1 -StopDevPorts' -ForegroundColor DarkGray

