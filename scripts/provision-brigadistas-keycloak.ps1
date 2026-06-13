# Provisiona usuarios Keycloak para brigadistas sin keycloak_sub y los vincula en ms-recursos.
# Uso: .\scripts\provision-brigadistas-keycloak.ps1
# Requiere: stack REV levantado (Keycloak :18090, Gateway :18080)

$ErrorActionPreference = "Stop"
$Gateway = "http://localhost:18080"
$Keycloak = "http://localhost:18090"
$AdminUser = "admin"
$AdminPass = "admin"
$Realm = "rev"
$DevPassword = "rev123"

function Get-AdminToken {
    $body = @{
        grant_type = "password"
        client_id  = "admin-cli"
        username   = $AdminUser
        password   = $AdminPass
    }
    $r = Invoke-RestMethod -Method Post -Uri "$Keycloak/realms/master/protocol/openid-connect/token" -Body $body
    return $r.access_token
}

function Get-DespachadorToken {
    $body = @{
        grant_type = "password"
        client_id  = "rev-frontend"
        client_secret = "rev-dev-secret"
        username   = "despachador"
        password   = $DevPassword
    }
    $r = Invoke-RestMethod -Method Post -Uri "$Keycloak/realms/$Realm/protocol/openid-connect/token" -Body $body
    return $r.access_token
}

Write-Host "Obteniendo catalogo de brigadistas..."
$token = Get-DespachadorToken
$catalogo = Invoke-RestMethod -Uri "$Gateway/api/recursos/catalogo" -Headers @{ Authorization = "Bearer $token" }
$brigadistas = $catalogo.brigadistas | Where-Object { $null -eq $_.keycloakUsername -or $_.keycloakUsername -ne "" }

$adminToken = Get-AdminToken
$usersUrl = "$Keycloak/admin/realms/$Realm/users"

foreach ($b in $catalogo.brigadistas) {
    if (-not $b.keycloakUsername) { continue }
    $username = $b.keycloakUsername
    $email = if ($b.email) { $b.email } else { "$username@valle.local" }

    $existing = Invoke-RestMethod -Method Get -Uri "$usersUrl?username=$username" -Headers @{ Authorization = "Bearer $adminToken" }
    $userId = $null
    if ($existing.Count -gt 0) {
        $userId = $existing[0].id
        Write-Host "  Usuario existente: $username ($userId)"
    } else {
        $payload = @{
            username = $username
            enabled = $true
            email = $email
            emailVerified = $true
            firstName = $b.nombre
            lastName = $b.apellido
            credentials = @(@{ type = "password"; value = $DevPassword; temporary = $false })
        } | ConvertTo-Json -Depth 5
        $headers = @{ Authorization = "Bearer $adminToken"; "Content-Type" = "application/json" }
        $resp = Invoke-WebRequest -Method Post -Uri $usersUrl -Headers $headers -Body $payload
        $userId = ($resp.Headers.Location -split "/")[-1]
        $roleUrl = "$Keycloak/admin/realms/$Realm/roles/Brigadista"
        $role = Invoke-RestMethod -Uri $roleUrl -Headers @{ Authorization = "Bearer $adminToken" }
        Invoke-RestMethod -Method Post -Uri "$usersUrl/$userId/role-mappings/realm" -Headers $headers -Body ("[$($role | ConvertTo-Json -Compress)]")
        Write-Host "  Creado: $username ($userId)"
    }

    $vincular = @{ keycloakSub = $userId; keycloakUsername = $username; email = $email } | ConvertTo-Json
    Invoke-RestMethod -Method Put -Uri "$Gateway/api/recursos/brigadistas/$($b.id)/vincular-keycloak" `
        -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } -Body $vincular | Out-Null
    Write-Host "  Vinculado en ms-recursos: $($b.id) -> $username"
}

Write-Host "Listo."
