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
    Wait-TcpPort -Port 8088 -TimeoutSec 120 -Label 'Keycloak adapter (8088)' | Out-Null

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

  Start-MavenTerminalJob 'eureka-server (:8761)' $RepoRoot 'infraestructuredomain/eureka-server' $MavenLauncher

  Wait-TcpPort -Port 8761 -TimeoutSec 120 -Label 'Eureka (8761)' | Out-Null



  Start-MavenTerminalJob 'spring-boot-admin (:8099)' $RepoRoot 'infraestructuredomain/spring-boot-admin' $MavenLauncher

  Start-MavenTerminalJob 'ms-incidentes (:8081)' $RepoRoot 'businessdomain/ms-incidentes' $MavenLauncher

  Start-MavenTerminalJob 'ms-zonas-riesgo (:8082)' $RepoRoot 'businessdomain/ms-zonas-riesgo' $MavenLauncher

  Start-MavenTerminalJob 'ms-recursos (:8083)' $RepoRoot 'businessdomain/ms-recursos' $MavenLauncher



  Write-Host 'Esperando microservicios de negocio...' -ForegroundColor DarkGray

  Start-Sleep -Seconds 15

  Wait-TcpPort -Port 8081 -TimeoutSec 120 -Label 'MS Incidentes (8081)' | Out-Null

  Wait-TcpPort -Port 8082 -TimeoutSec 120 -Label 'MS Zonas (8082)' | Out-Null

  Wait-TcpPort -Port 8083 -TimeoutSec 120 -Label 'MS Recursos (8083)' | Out-Null



  Start-MavenTerminalJob 'bff-rev (:8085)' $RepoRoot 'infraestructuredomain/bff-rev' $MavenLauncher

  Start-MavenTerminalJob 'keycloak-adapter (:8088)' $RepoRoot 'infraestructuredomain/keycloak-adapter' $MavenLauncher

  Start-Sleep -Seconds 10



  Start-MavenTerminalJob 'api-gateway (:8080)' $RepoRoot 'infraestructuredomain/api-gateway' $MavenLauncher

  Wait-RevGatewayReachable

} elseif ($SkipBackend) {

  Write-Host 'SkipBackend: no se levanto el backend Spring.' -ForegroundColor DarkGray

}



if (-not $SkipFrontend) {

  if (-not $SkipFreeDevPorts) {

    Stop-ProcessOnLocalPort -Ports @(5173)

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

  Start-TerminalJob 'frontend (vite :5173)' $frontendDir 'npm run dev'

} else {

  Write-Host 'SkipFrontend: no se levanto el frontend.' -ForegroundColor DarkGray

}



Write-Host ''

Write-Host 'Listo. URLs tipicas:' -ForegroundColor Green

Write-Host '- Frontend:  http://localhost:5173'

Write-Host '- Gateway:   http://localhost:8080'

Write-Host '- Eureka:    http://localhost:8761'

Write-Host '- Keycloak:  http://localhost:8090  (master: admin / admin)'

Write-Host '- Consola realm rev: http://localhost:8090/admin/rev/console  (usuario admin / rev123)'

Write-Host '- Login app: despachador | brigadista | admin  /  rev123'

Write-Host ''

if ($DockerApps -and -not $SkipBackend) {

  Write-Host 'Backend en Docker (perfil apps). Logs: docker compose -p rev logs -f api-gateway' -ForegroundColor DarkGray

}

Write-Host 'Para bajar Docker: .\scripts\dev-down.ps1' -ForegroundColor DarkGray

Write-Host 'Para liberar puertos Maven/Vite: .\scripts\dev-down.ps1 -StopDevPorts' -ForegroundColor DarkGray

