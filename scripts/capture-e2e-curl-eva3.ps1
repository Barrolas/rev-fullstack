# Captura evidencia E2E-03 / E2E-04 (401 sin JWT, 200 con JWT)
# Requiere: .\scripts\dev-up.ps1 -DockerApps
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$evDir = Join-Path $root 'docs\informe-evidencias\eva3\evidencias'
New-Item -ItemType Directory -Path $evDir -Force | Out-Null

$gateway = 'http://localhost:18080'
$out401 = Join-Path $evDir 'curl-401.txt'
$out200 = Join-Path $evDir 'curl-200.txt'

Write-Host "E2E-03: GET /api/incidentes sin token..."
$r401 = curl.exe -s -w "`nHTTP:%{http_code}" "$gateway/api/incidentes" 2>&1
$r401 | Set-Content $out401 -Encoding UTF8
Write-Host $r401

Write-Host "`nE2E-04: login + GET dashboard/incidentes con Bearer..."
$login = curl.exe -s -X POST "$gateway/auth/login" `
    -H 'Content-Type: application/x-www-form-urlencoded' `
    -d 'username=despachador&password=rev123' 2>&1
$token = ($login | ConvertFrom-Json).access_token
if (-not $token) {
    "Login fallo:`n$login" | Set-Content $out200 -Encoding UTF8
    Write-Warning "No se obtuvo token. Verificar Keycloak/Gateway."
    exit 1
}
$r200 = curl.exe -s -w "`nHTTP:%{http_code}" "$gateway/api/dashboard/incidentes" -H "Authorization: Bearer $token" 2>&1
$r200 | Set-Content $out200 -Encoding UTF8
Write-Host ($r200.Substring(0, [Math]::Min(200, $r200.Length))) "..."

Write-Host "`nEvidencia guardada:"
Write-Host "  $out401"
Write-Host "  $out200"
Write-Host "Opcional: capturar pantalla de esta consola como curl-401.png / curl-200.png"
