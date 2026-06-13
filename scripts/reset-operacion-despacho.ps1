# Reinicia datos operativos: sin incidentes, 6 zonas Cordillera, 2 brigadas listas.
# Aplica Flyway V8/V9 (incidentes, recursos) y V9 (zonas).

param(
    [switch]$Rebuild,
    [switch]$ResetVolumes
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Push-Location $root
try {
    if ($ResetVolumes) {
        Write-Host "Deteniendo stack y borrando volumenes PostgreSQL..." -ForegroundColor Cyan
        docker compose -p rev down
        docker volume rm rev_pg_incidentes rev_pg_recursos rev_pg_zonas 2>$null
        $Rebuild = $true
    }

    if ($Rebuild) {
        Write-Host "Reconstruyendo ms-incidentes, ms-zonas-riesgo y ms-recursos..." -ForegroundColor Cyan
        & "$PSScriptRoot\dev-up.ps1" -DockerApps -Build
    } else {
        Write-Host "Reiniciando microservicios (aplica Flyway pendiente)..." -ForegroundColor Cyan
        docker compose -p rev restart ms-incidentes ms-zonas-riesgo ms-recursos 2>$null
        if ($LASTEXITCODE -ne 0) {
            & "$PSScriptRoot\dev-up.ps1" -DockerApps
        }
    }

    Write-Host ""
    Write-Host "Listo. Verifique:" -ForegroundColor Green
    Write-Host "  - Incidentes: ninguno en /incidentes ni cola /despacho/operacion"
    Write-Host "  - Zonas: 6 en /zonas (Centro PA, Alto Jahuel, Bajos de Mena, ...)"
    Write-Host "  - Brigadas: MUN-RAPIDA y MUN-REFUERZO en Lista"
    Write-Host ""
    Write-Host "Si aun ve datos viejos, ejecute con -ResetVolumes:" -ForegroundColor Yellow
    Write-Host "  .\scripts\reset-operacion-despacho.ps1 -ResetVolumes"
}
finally {
    Pop-Location
}
