# Funciones compartidas para dev-up.ps1 / dev-down.ps1 (REV):
# - Puertos locales (Maven/Vite) sin tumbar Docker Desktop
# - Docker Compose acotado al proyecto rev (nunca rm/prune global)

$script:RevComposeProject = 'rev'
$script:RevPortMap = @{}
$script:RevDevPorts = @()
$script:RevLegacyDevPorts = @()

function Get-RevEnvInt {
  param(
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][int]$Default
  )
  $raw = [Environment]::GetEnvironmentVariable($Name)
  if ($raw -and $raw -match '^\d+$') {
    return [int]$raw
  }
  return $Default
}

function Initialize-RevDevPortMap {
  $script:RevPortMap = @{
    Frontend        = (Get-RevEnvInt 'REV_FRONTEND_PORT' 15173)
    Gateway         = (Get-RevEnvInt 'REV_GATEWAY_PORT' 18080)
    Eureka          = (Get-RevEnvInt 'REV_EUREKA_PORT' 18761)
    MsIncidentes    = (Get-RevEnvInt 'REV_MS_INCIDENTES_PORT' 18081)
    MsZonas         = (Get-RevEnvInt 'REV_MS_ZONAS_PORT' 18082)
    MsRecursos      = (Get-RevEnvInt 'REV_MS_RECURSOS_PORT' 18083)
    Bff             = (Get-RevEnvInt 'REV_BFF_PORT' 18085)
    KeycloakAdapter = (Get-RevEnvInt 'REV_KEYCLOAK_ADAPTER_PORT' 18088)
    Keycloak        = (Get-RevEnvInt 'REV_KEYCLOAK_PORT' 18090)
    Sba             = (Get-RevEnvInt 'REV_SBA_PORT' 18099)
    PgIncidentes    = (Get-RevEnvInt 'REV_PG_INCIDENTES_PORT' 15432)
    PgZonas         = (Get-RevEnvInt 'REV_PG_ZONAS_PORT' 15433)
    PgRecursos      = (Get-RevEnvInt 'REV_PG_RECURSOS_PORT' 15434)
  }
  $script:RevDevPorts = @(
    $script:RevPortMap.Eureka,
    $script:RevPortMap.Gateway,
    $script:RevPortMap.MsIncidentes,
    $script:RevPortMap.MsZonas,
    $script:RevPortMap.MsRecursos,
    $script:RevPortMap.Bff,
    $script:RevPortMap.KeycloakAdapter,
    $script:RevPortMap.Sba,
    $script:RevPortMap.Frontend
  )
  # Puertos historicos REV (pre 18xxx) — Maven/Vite/containers viejos tras migracion
  $script:RevLegacyDevPorts = @(8761, 8080, 8081, 8082, 8083, 8085, 8088, 8099, 8090, 5173)
}

function Get-RevKeycloakBaseUrl {
  if ($env:KEYCLOAK_URL) { return $env:KEYCLOAK_URL.TrimEnd('/') }
  return "http://localhost:$($script:RevPortMap.Keycloak)"
}

function Invoke-DockerQuiet {
  param([Parameter(Mandatory)][string[]]$Arguments)
  $prevEa = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  try {
    $null = & docker @Arguments 2>&1
    return [int]$LASTEXITCODE
  } finally {
    $ErrorActionPreference = $prevEa
  }
}

function Get-ProcessSkipKillReason {
  param([System.Diagnostics.Process]$Process)
  if (-not $Process) { return $null }
  $n = $Process.ProcessName
  if ($n -match '^com\.docker\.') { return "proceso interno Docker ($n)" }
  if ($n -match '^Docker Desktop') { return "Docker Desktop ($n)" }
  if ($n -match '^docker-proxy') { return "proxy de puerto Docker ($n)" }
  if ($n -match '^(vpnkit|wslrelay|vmmemWSL)') { return "red/WSL usada por Docker ($n)" }
  try {
    $path = $Process.MainModule.FileName
    if ($path -and ($path -match '[\\/]Docker[\\/]Docker Desktop')) { return "binario en instalacion Docker" }
  } catch { }
  return $null
}

function Stop-ProcessOnLocalPort {
  param([int[]]$Ports)
  foreach ($port in $Ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      $owningPid = $c.OwningProcess
      if ($owningPid -and $owningPid -gt 0) {
        try {
          $p = Get-Process -Id $owningPid -ErrorAction SilentlyContinue
          $name = if ($p) { $p.ProcessName } else { "?" }
          $skip = if ($p) { Get-ProcessSkipKillReason -Process $p } else { $null }
          if ($skip) {
            Write-Host "  Puerto $port : omitiendo PID $owningPid ($name) - $skip" -ForegroundColor DarkYellow
            continue
          }
          Write-Host "  Puerto $port : cerrando $name (PID $owningPid)" -ForegroundColor Yellow
          Stop-Process -Id $owningPid -Force -ErrorAction SilentlyContinue
        } catch { }
      }
    }
  }
}

function Write-WarningIfPortsStillListen {
  param([int[]]$Ports)
  foreach ($port in $Ports) {
    $listen = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $listen) { continue }
    $ownerPid = $listen.OwningProcess
    $p = Get-Process -Id $ownerPid -ErrorAction SilentlyContinue
    $name = if ($p) { $p.ProcessName } else { "?" }
    $skip = if ($p) { Get-ProcessSkipKillReason -Process $p } else { $null }
    if ($skip) {
      Write-Host ""
      Write-Host "Puerto $port sigue ocupado ($name, PID $ownerPid): $skip" -ForegroundColor Yellow
      Write-Host "  Use .\scripts\dev-down.ps1 o reinicie el contenedor REV en Docker Desktop." -ForegroundColor Yellow
    }
  }
}

function Stop-RevProjectContainers {
  $names = Get-DockerLines -Arguments @(
    'ps', '-a', '--filter', 'label=com.docker.compose.project=rev', '--format', '{{.Names}}'
  )
  if (-not $names -or $names.Count -eq 0) {
    return
  }
  Write-Host 'Contenedores REV aun activos; forzando stop/rm...' -ForegroundColor Yellow
  foreach ($name in $names) {
    if (-not $name) { continue }
    Write-Host "  $name" -ForegroundColor DarkYellow
    $null = Invoke-DockerQuiet -Arguments @('stop', $name)
    $null = Invoke-DockerQuiet -Arguments @('rm', '-f', $name)
  }
}

function Get-RevDevPortsForCleanup {
  param([switch]$IncludeLegacy)
  $ports = @($script:RevDevPorts)
  if ($IncludeLegacy) {
    $ports += $script:RevLegacyDevPorts
  }
  return @($ports | Sort-Object -Unique)
}

function Assert-DockerNotGlobalDestructive {
  param([Parameter(Mandatory)][string[]]$DockerArguments)
  $joined = ($DockerArguments -join ' ').ToLowerInvariant()
  $forbidden = @(
    @{ Pattern = '\brm\b.*-a'; Message = 'docker rm -a elimina contenedores de TODOS los proyectos' }
    @{ Pattern = 'ps\s+-aq'; Message = 'docker ps -aq afecta todo el motor Docker' }
    @{ Pattern = 'network\s+prune'; Message = 'docker network prune borra redes de otros proyectos' }
    @{ Pattern = 'volume\s+prune'; Message = 'docker volume prune borra volumenes de otros proyectos' }
    @{ Pattern = 'system\s+prune'; Message = 'docker system prune es global' }
    @{ Pattern = 'container\s+prune'; Message = 'docker container prune es global' }
  )
  foreach ($rule in $forbidden) {
    if ($joined -match $rule.Pattern) {
      throw "Comando Docker prohibido en scripts REV: $($rule.Message). Use Invoke-RevCompose."
    }
  }
}

function Invoke-RevCompose {
  param(
    [Parameter(Mandatory)][string]$ComposeFile,
    [Parameter(Mandatory)][string[]]$Arguments,
    [string[]]$Profiles = @()
  )
  Assert-DockerNotGlobalDestructive -DockerArguments $Arguments
  $prevEa = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $base = @('compose', '-p', $script:RevComposeProject, '-f', $ComposeFile)
    foreach ($profile in $Profiles) {
      if ($profile) {
        $base += @('--profile', $profile)
      }
    }
    $base += $Arguments
    & docker @base
    return [int]$LASTEXITCODE
  } finally {
    $ErrorActionPreference = $prevEa
  }
}

function Get-DockerLines {
  param([Parameter(Mandatory)][string[]]$Arguments)
  $prevEa = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  try {
    $out = & docker @Arguments 2>$null
    if (-not $out) { return @() }
    if ($out -is [array]) {
      return @($out | ForEach-Object { "$_".Trim() } | Where-Object { $_ })
    }
    return @("$out".Trim() -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
  } finally {
    $ErrorActionPreference = $prevEa
  }
}

function Remove-RevProjectNetworksIfUnused {
  param([string[]]$LegacyProjectNames = @('rev-fullstack'))
  $projects = @($script:RevComposeProject) + $LegacyProjectNames | Select-Object -Unique
  foreach ($proj in $projects) {
    $ids = Get-DockerLines -Arguments @(
      'network', 'ls', '--filter', "label=com.docker.compose.project=$proj", '-q'
    )
    foreach ($netId in $ids) {
      if (-not $netId) { continue }
      $null = Invoke-DockerQuiet -Arguments @('network', 'rm', $netId)
    }
  }
}

function Assert-DockerEngineReady {
  $prevEa = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  try {
    $null = docker info 2>&1
    $exit = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $prevEa
  }
  if ($exit -ne 0) {
    Write-Host ""
    Write-Host "Docker no responde (codigo $exit)." -ForegroundColor Yellow
    Write-Host "Abra Docker Desktop y espere a que el motor este en ejecucion." -ForegroundColor Yellow
    throw "Docker no disponible. Arranque Docker Desktop y reintente."
  }
}

function Wait-TcpPort {
  param(
    [int]$Port,
    [int]$TimeoutSec = 120,
    [string]$Label = "puerto $Port"
  )
  Write-Host "Esperando $Label..." -ForegroundColor DarkGray
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    $open = Test-NetConnection -ComputerName localhost -Port $Port `
      -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($open) {
      Write-Host "  OK: $Label" -ForegroundColor Green
      return $true
    }
    Start-Sleep -Seconds 2
  }
  Write-Host "  AVISO: timeout en $Label" -ForegroundColor Yellow
  return $false
}

function Wait-KeycloakAdminReady {
  param(
    [string]$KeycloakBase = (Get-RevKeycloakBaseUrl),
    [int]$TimeoutSec = 120
  )
  Write-Host 'Esperando API admin de Keycloak...' -ForegroundColor DarkGray
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    $tokenResponse = curl.exe -s -X POST "$KeycloakBase/realms/master/protocol/openid-connect/token" `
      -d 'client_id=admin-cli&username=admin&password=admin&grant_type=password'
    if ($tokenResponse -match 'access_token') {
      try {
        $tokenJson = $tokenResponse | ConvertFrom-Json
        if ($tokenJson.access_token) {
          Write-Host '  OK: Keycloak admin API' -ForegroundColor Green
          return $true
        }
      } catch { }
    }
    Start-Sleep -Seconds 3
  }
  Write-Host '  AVISO: timeout esperando Keycloak admin API' -ForegroundColor Yellow
  return $false
}

function Wait-RevInfraReady {
  Wait-TcpPort -Port $script:RevPortMap.PgIncidentes -TimeoutSec 90 -Label "PostgreSQL incidentes ($($script:RevPortMap.PgIncidentes))" | Out-Null
  Wait-TcpPort -Port $script:RevPortMap.PgZonas -TimeoutSec 90 -Label "PostgreSQL zonas PostGIS ($($script:RevPortMap.PgZonas))" | Out-Null
  Wait-TcpPort -Port $script:RevPortMap.PgRecursos -TimeoutSec 90 -Label "PostgreSQL recursos ($($script:RevPortMap.PgRecursos))" | Out-Null
  Wait-TcpPort -Port $script:RevPortMap.Keycloak -TimeoutSec 120 -Label "Keycloak ($($script:RevPortMap.Keycloak))" | Out-Null
  if (Wait-KeycloakAdminReady) {
    Initialize-RevKeycloakDevUsers
  }
}

function Initialize-RevKeycloakDevUsers {
  param([string]$KeycloakBase = (Get-RevKeycloakBaseUrl))
  $devUsers = @(
    @{ Username = 'despachador'; Password = 'rev123'; Email = 'despachador@valle.local'; FirstName = 'Ana'; LastName = 'Despacho'; RealmRoles = @('Despachador') },
    @{ Username = 'brigadista'; Password = 'rev123'; Email = 'brigadista@valle.local'; FirstName = 'Luis'; LastName = 'Brigada'; RealmRoles = @('Brigadista') },
    @{ Username = 'admin'; Password = 'rev123'; Email = 'admin@valle.local'; FirstName = 'Carlos'; LastName = 'Admin'; RealmRoles = @('Admin'); ClientRoles = @{ 'realm-management' = @('realm-admin') } }
  )
  foreach ($u in $devUsers) {
    Initialize-RevKeycloakDevUser @u -KeycloakBase $KeycloakBase
  }
}

function Initialize-RevKeycloakDevUser {
  param(
    [string]$KeycloakBase = (Get-RevKeycloakBaseUrl),
    [string]$Username = 'despachador',
    [string]$Password = 'rev123',
    [string]$Email = 'despachador@valle.local',
    [string]$FirstName = 'Ana',
    [string]$LastName = 'Despacho',
    [string[]]$RealmRoles = @('Despachador'),
    [hashtable]$ClientRoles = @{}
  )
  Write-Host "Asegurando usuario dev '$Username' en Keycloak..." -ForegroundColor DarkGray
  try {
    $tokenResponse = curl.exe -s -X POST "$KeycloakBase/realms/master/protocol/openid-connect/token" `
      -d 'client_id=admin-cli&username=admin&password=admin&grant_type=password'
    $tokenJson = $tokenResponse | ConvertFrom-Json
    if (-not $tokenJson.access_token) {
      Write-Host '  AVISO: no se pudo obtener token admin de Keycloak.' -ForegroundColor Yellow
      return
    }
    $adminToken = $tokenJson.access_token
    $usersJson = curl.exe -s "$KeycloakBase/admin/realms/rev/users?username=$Username" `
      -H "Authorization: Bearer $adminToken"
    $users = $usersJson | ConvertFrom-Json
    $userId = $null
    if (-not $users -or $users.Count -eq 0) {
      $createBody = @{
        username = $Username
        email = $Email
        emailVerified = $true
        enabled = $true
        firstName = $FirstName
        lastName = $LastName
        requiredActions = @()
      } | ConvertTo-Json -Compress
      $createFile = Join-Path $env:TEMP "rev-kc-create-$Username.json"
      Set-Content -Path $createFile -Value $createBody -Encoding UTF8
      $createResponse = curl.exe -s -w "%{http_code}" -o NUL -X POST "$KeycloakBase/admin/realms/rev/users" `
        -H "Authorization: Bearer $adminToken" `
        -H 'Content-Type: application/json' `
        --data-binary "@$createFile"
      Remove-Item $createFile -Force -ErrorAction SilentlyContinue
      if ($createResponse -notmatch '201|409') {
        Write-Host "  AVISO: no se pudo crear usuario '$Username' (HTTP $createResponse)." -ForegroundColor Yellow
        return
      }
      $usersJson = curl.exe -s "$KeycloakBase/admin/realms/rev/users?username=$Username" `
        -H "Authorization: Bearer $adminToken"
      $users = $usersJson | ConvertFrom-Json
    }
    if (-not $users -or $users.Count -eq 0) {
      Write-Host "  AVISO: usuario '$Username' no encontrado en realm rev." -ForegroundColor Yellow
      return
    }
    $userId = $users[0].id
    $userBody = @{
      username = $Username
      email = $Email
      emailVerified = $true
      enabled = $true
      firstName = $FirstName
      lastName = $LastName
      requiredActions = @()
    } | ConvertTo-Json -Compress
    $userFile = Join-Path $env:TEMP "rev-kc-user-$userId.json"
    Set-Content -Path $userFile -Value $userBody -Encoding UTF8
    $null = curl.exe -s -X PUT "$KeycloakBase/admin/realms/rev/users/$userId" `
      -H "Authorization: Bearer $adminToken" `
      -H 'Content-Type: application/json' `
      --data-binary "@$userFile"
    Remove-Item $userFile -Force -ErrorAction SilentlyContinue
    $pwdBody = '{"type":"password","value":"' + $Password + '","temporary":false}'
    $pwdFile = Join-Path $env:TEMP "rev-kc-pwd-$userId.json"
    Set-Content -Path $pwdFile -Value $pwdBody -Encoding UTF8
    $null = curl.exe -s -X PUT "$KeycloakBase/admin/realms/rev/users/$userId/reset-password" `
      -H "Authorization: Bearer $adminToken" `
      -H 'Content-Type: application/json' `
      --data-binary "@$pwdFile"
    Remove-Item $pwdFile -Force -ErrorAction SilentlyContinue
    foreach ($roleName in $RealmRoles) {
      $roleJson = curl.exe -s "$KeycloakBase/admin/realms/rev/roles/$roleName" `
        -H "Authorization: Bearer $adminToken"
      if ($roleJson) {
        $roleFile = Join-Path $env:TEMP "rev-kc-role-$userId-$roleName.json"
        Set-Content -Path $roleFile -Value "[$roleJson]" -Encoding UTF8
        $null = curl.exe -s -X POST "$KeycloakBase/admin/realms/rev/users/$userId/role-mappings/realm" `
          -H "Authorization: Bearer $adminToken" `
          -H 'Content-Type: application/json' `
          --data-binary "@$roleFile"
        Remove-Item $roleFile -Force -ErrorAction SilentlyContinue
      }
    }
    foreach ($clientId in $ClientRoles.Keys) {
      $clientJson = curl.exe -s "$KeycloakBase/admin/realms/rev/clients?clientId=$clientId" `
        -H "Authorization: Bearer $adminToken"
      $clients = $clientJson | ConvertFrom-Json
      if ($clients -and $clients.Count -gt 0) {
        $clientUuid = $clients[0].id
        $rolePayload = @()
        foreach ($clientRole in $ClientRoles[$clientId]) {
          $crJson = curl.exe -s "$KeycloakBase/admin/realms/rev/clients/$clientUuid/roles/$clientRole" `
            -H "Authorization: Bearer $adminToken"
          if ($crJson) { $rolePayload += ($crJson | ConvertFrom-Json) }
        }
        if ($rolePayload.Count -gt 0) {
          $crFile = Join-Path $env:TEMP "rev-kc-cr-$userId.json"
          $rolePayload | ConvertTo-Json -Compress | Set-Content -Path $crFile -Encoding UTF8
          $null = curl.exe -s -X POST "$KeycloakBase/admin/realms/rev/users/$userId/role-mappings/clients/$clientUuid" `
            -H "Authorization: Bearer $adminToken" `
            -H 'Content-Type: application/json' `
            --data-binary "@$crFile"
          Remove-Item $crFile -Force -ErrorAction SilentlyContinue
        }
      }
    }
    Write-Host "  OK: usuario dev '$Username' listo en Keycloak." -ForegroundColor Green
  } catch {
    Write-Host "  AVISO: no se pudo preparar usuario Keycloak ($($_.Exception.Message))." -ForegroundColor Yellow
  }
}

function Wait-RevServiceInEureka {
  param(
    [string]$ServiceName,
    [int]$TimeoutSec = 120
  )
  $eurekaPort = $script:RevPortMap.Eureka
  Write-Host "Esperando $ServiceName en Eureka (:$eurekaPort)..." -ForegroundColor Cyan
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $xml = curl.exe -s "http://127.0.0.1:$eurekaPort/eureka/apps/$ServiceName" 2>$null
      if ($xml -and $xml -match '<status>UP</status>') {
        Write-Host "  OK: $ServiceName registrado en Eureka." -ForegroundColor Green
        return $true
      }
    } catch {
      /* reintento */
    }
    Start-Sleep -Seconds 2
  }
  Write-Warning "$ServiceName no aparece UP en Eureka dentro de ${TimeoutSec}s."
  return $false
}

function Wait-RevAuthRouteReady {
  param(
    [int]$TimeoutSec = 90,
    [string]$Username = 'admin',
    [string]$Password = 'rev123'
  )
  $gatewayPort = $script:RevPortMap.Gateway
  Write-Host "Esperando /auth/login en gateway (:$gatewayPort, max. ${TimeoutSec}s)..." -ForegroundColor Cyan
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    $code = curl.exe -s -o NUL -w '%{http_code}' -X POST "http://127.0.0.1:$gatewayPort/auth/login" `
      -H 'Content-Type: application/x-www-form-urlencoded' `
      -d "username=$Username&password=$Password" 2>$null
    if ($code -eq '200') {
      Write-Host '  OK: /auth/login responde (KEYCLOAK-ADAPTER en Eureka).' -ForegroundColor Green
      return $true
    }
    Start-Sleep -Seconds 2
  }
  Write-Warning "auth/login no devolvio 200 en ${TimeoutSec}s. El login en el navegador puede fallar unos segundos; reintente."
  return $false
}

function Wait-RevGatewayReachable {
  param([int]$TimeoutSec = 180)
  $gatewayPort = $script:RevPortMap.Gateway
  Write-Host "Esperando api-gateway en $gatewayPort (max. $TimeoutSec s)..." -ForegroundColor Cyan
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  $start = Get-Date
  $lastProgressSec = -1
  while ((Get-Date) -lt $deadline) {
    $open = Test-NetConnection -ComputerName localhost -Port $gatewayPort `
      -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($open) {
      Write-Host "api-gateway listo (127.0.0.1:$gatewayPort)." -ForegroundColor Green
      return
    }
    $elapsed = [int]((Get-Date) - $start).TotalSeconds
    if ($elapsed -ge 15 -and ($elapsed - $lastProgressSec) -ge 15) {
      $lastProgressSec = $elapsed
      Write-Host "  ... ${elapsed}s - revise ventana 'api-gateway (:$gatewayPort)'." -ForegroundColor DarkYellow
    }
    Start-Sleep -Seconds 3
  }
  Write-Warning "api-gateway no respondio en ${TimeoutSec}s. Revise la ventana Maven del gateway."
}

function Get-RevAppJarSpecs {
  return @(
    @{ Module = 'infraestructuredomain/eureka-server'; Artifact = 'eureka-server' }
    @{ Module = 'infraestructuredomain/spring-boot-admin'; Artifact = 'spring-boot-admin' }
    @{ Module = 'businessdomain/ms-incidentes'; Artifact = 'ms-incidentes' }
    @{ Module = 'businessdomain/ms-zonas-riesgo'; Artifact = 'ms-zonas-riesgo' }
    @{ Module = 'businessdomain/ms-recursos'; Artifact = 'ms-recursos' }
    @{ Module = 'infraestructuredomain/bff-rev'; Artifact = 'bff-rev' }
    @{ Module = 'infraestructuredomain/keycloak-adapter'; Artifact = 'keycloak-adapter' }
    @{ Module = 'infraestructuredomain/api-gateway'; Artifact = 'api-gateway' }
  )
}

function Get-RevAppVersion {
  param([string]$RepoRoot)
  $envVersion = $env:REV_VERSION
  if ($envVersion) { return $envVersion }
  $dotEnv = Join-Path $RepoRoot '.env'
  if (Test-Path $dotEnv) {
    Import-DotEnv $dotEnv
    if ($env:REV_VERSION) { return $env:REV_VERSION }
  }
  return '1.0-SNAPSHOT'
}

function Test-RevAppJarsReady {
  param([string]$RepoRoot)
  $version = Get-RevAppVersion -RepoRoot $RepoRoot
  foreach ($spec in (Get-RevAppJarSpecs)) {
    $jar = Join-Path $RepoRoot "$($spec.Module)/target/$($spec.Artifact)-$version.jar"
    if (-not (Test-Path $jar)) {
      return $false
    }
  }
  return $true
}

function Invoke-RevMavenPackage {
  param(
    [string]$RepoRoot,
    [string]$MavenLauncher
  )
  Push-Location $RepoRoot
  try {
    if ($MavenLauncher -like '*mvnw.cmd') {
      & .\mvnw.cmd -DskipTests package
    } else {
      & $MavenLauncher -DskipTests package
    }
    if ($LASTEXITCODE -ne 0) {
      throw "Maven package fallo (codigo $LASTEXITCODE)"
    }
  } finally {
    Pop-Location
  }
}

function Wait-RevAppsReady {
  param([string]$ComposeFile = 'docker-compose.yml')
  Wait-TcpPort -Port $script:RevPortMap.Eureka -TimeoutSec 180 -Label "Eureka ($($script:RevPortMap.Eureka))" | Out-Null
  Wait-TcpPort -Port $script:RevPortMap.MsIncidentes -TimeoutSec 180 -Label "MS Incidentes ($($script:RevPortMap.MsIncidentes))" | Out-Null
  Wait-TcpPort -Port $script:RevPortMap.MsZonas -TimeoutSec 180 -Label "MS Zonas ($($script:RevPortMap.MsZonas))" | Out-Null
  Wait-TcpPort -Port $script:RevPortMap.MsRecursos -TimeoutSec 180 -Label "MS Recursos ($($script:RevPortMap.MsRecursos))" | Out-Null
  Wait-TcpPort -Port $script:RevPortMap.Bff -TimeoutSec 180 -Label "BFF ($($script:RevPortMap.Bff))" | Out-Null
  Wait-TcpPort -Port $script:RevPortMap.KeycloakAdapter -TimeoutSec 180 -Label "Keycloak adapter ($($script:RevPortMap.KeycloakAdapter))" | Out-Null
  $null = Wait-RevServiceInEureka -ServiceName 'KEYCLOAK-ADAPTER' -TimeoutSec 120
  Wait-RevGatewayReachable -TimeoutSec 240
  $authOk = Wait-RevAuthRouteReady -TimeoutSec 90
  if (-not $authOk) {
    Write-Host 'Reintentando registro auth (restart gateway + keycloak-adapter)...' -ForegroundColor Cyan
    $null = Invoke-RevCompose -ComposeFile $ComposeFile -Profiles @('apps') -Arguments @(
      'restart', 'keycloak-adapter', 'api-gateway'
    )
    Start-Sleep -Seconds 8
    $null = Wait-RevServiceInEureka -ServiceName 'KEYCLOAK-ADAPTER' -TimeoutSec 90
    Wait-RevAuthRouteReady -TimeoutSec 90 | Out-Null
  }
}

function Get-RevMavenLauncher {
  param([string]$RepoRoot)
  $mvnw = Join-Path $RepoRoot 'mvnw.cmd'
  if (Test-Path $mvnw) { return $mvnw }
  $cmd = Get-Command mvn -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    "$env:MAVEN_HOME\bin\mvn.cmd",
    "$env:M2_HOME\bin\mvn.cmd",
    'C:\Program Files\Apache\Maven\bin\mvn.cmd'
  )
  foreach ($path in $candidates) {
    if ($path -and (Test-Path $path)) { return $path }
  }
  return $null
}

function Start-TerminalJob {
  param(
    [string]$Title,
    [string]$WorkDir,
    [string]$Command
  )
  $escapedTitle = $Title.Replace('"', '""')
  $wdLiteral = $WorkDir.Replace("'", "''")
  $psCmd = "Set-Location -LiteralPath '$wdLiteral'; try { `$Host.UI.RawUI.WindowTitle = ""$escapedTitle"" } catch {} ; $Command"
  Start-Process -FilePath 'powershell' -WorkingDirectory $WorkDir `
    -ArgumentList @('-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', $psCmd) | Out-Null
}

function Start-MavenTerminalJob {
  param(
    [string]$Title,
    [string]$WorkDir,
    [string]$Module,
    [string]$MavenLauncher
  )
  $escapedTitle = $Title.Replace('"', '""')
  $wdLiteral = $WorkDir.Replace("'", "''")
  $modLiteral = $Module.Replace("'", "''")
  $mvnLiteral = $MavenLauncher.Replace("'", "''")
  if ($MavenLauncher -like '*mvnw.cmd') {
    $psCmd = "Set-Location -LiteralPath '$wdLiteral'; try { `$Host.UI.RawUI.WindowTitle = ""$escapedTitle"" } catch {} ; & .\mvnw.cmd @('spring-boot:run','-pl','$modLiteral')"
  } else {
    $psCmd = "Set-Location -LiteralPath '$wdLiteral'; try { `$Host.UI.RawUI.WindowTitle = ""$escapedTitle"" } catch {} ; & '$mvnLiteral' -pl '$modLiteral' spring-boot:run"
  }
  Start-Process -FilePath 'powershell' -WorkingDirectory $WorkDir `
    -ArgumentList @('-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', $psCmd) | Out-Null
}

function Import-DotEnv {
  param([string]$DotEnvPath)
  if (-not (Test-Path $DotEnvPath)) { return }
  Get-Content $DotEnvPath | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0 -or $line.StartsWith('#')) { return }
    $idx = $line.IndexOf('=')
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    if ($key.Length -gt 0) {
      Set-Item -Path ("Env:{0}" -f $key) -Value $value
    }
  }
}
