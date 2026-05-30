# REV - Script de arranque local (PowerShell)
# Uso: .\scripts\start-rev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "=== REV: levantando infraestructura Docker ===" -ForegroundColor Cyan
Set-Location $Root
docker compose up -d

Write-Host ""
Write-Host "=== Orden de arranque manual de servicios Spring ===" -ForegroundColor Yellow
Write-Host "1. infraestructuredomain/eureka-server     (8761)"
Write-Host "2. infraestructuredomain/spring-boot-admin (8099)"
Write-Host "3. businessdomain/ms-incidentes            (8081)"
Write-Host "4. businessdomain/ms-zonas-riesgo          (8082)"
Write-Host "5. businessdomain/ms-recursos              (8083)"
Write-Host "6. infraestructuredomain/bff-rev             (8085)"
Write-Host "7. infraestructuredomain/keycloak-adapter    (8088)"
Write-Host "8. infraestructuredomain/api-gateway         (8080)"
Write-Host "9. frontend/rev-dashboard                    (5173)"
Write-Host ""
Write-Host "Keycloak Admin: http://localhost:8090  (admin/admin)" -ForegroundColor Green
Write-Host "Eureka:        http://localhost:8761" -ForegroundColor Green
Write-Host "Gateway:       http://localhost:8080" -ForegroundColor Green
