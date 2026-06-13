# Repara arranque de ms-recursos cuando Flyway V7 falló (503 en /api/recursos/*).
# Elimina el registro fallido y reinicia el contenedor con JAR recompilado.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Push-Location $root
try {
    Write-Host "Recompilando ms-recursos..." -ForegroundColor Cyan
    & "$root\mvnw.cmd" -q -pl businessdomain/ms-recursos -am package "-DskipTests"
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo compilacion ms-recursos"
    }

    Write-Host "Limpiando migracion V7 fallida en PostgreSQL..." -ForegroundColor Cyan
    docker exec rev-postgres-recursos-1 psql -U rev -d rev_recursos -c @"
DELETE FROM flyway_schema_history WHERE version IN ('7', '8') AND success = false;
DELETE FROM brigada_vehiculos WHERE id_brigada IN (1, 2);
"@

    Write-Host "Reiniciando ms-recursos..." -ForegroundColor Cyan
    docker compose -p rev restart ms-recursos

    Write-Host "Espere ~20s y pruebe http://localhost:15173/recursos" -ForegroundColor Green
}
finally {
    Pop-Location
}
