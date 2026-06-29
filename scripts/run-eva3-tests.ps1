# Ejecuta plan de pruebas EVA3: mvn test + JaCoCo en módulos críticos.
# Genera resumen en docs/informe-evidencias/eva3/evidencias/resumen-ejecucion.txt
$ErrorActionPreference = 'Continue'
$root = Split-Path $PSScriptRoot -Parent
$evidencias = Join-Path $root 'docs\informe-evidencias\eva3\evidencias'
$mvnw = Join-Path $root 'mvnw.cmd'

New-Item -ItemType Directory -Path $evidencias -Force | Out-Null

$modules = @(
  @{ Name = 'ms-incidentes'; Path = 'businessdomain\ms-incidentes' },
  @{ Name = 'bff-rev'; Path = 'infraestructuredomain\bff-rev' },
  @{ Name = 'ms-recursos'; Path = 'businessdomain\ms-recursos' },
  @{ Name = 'ms-zonas-riesgo'; Path = 'businessdomain\ms-zonas-riesgo' }
)

$lines = @(
  "REV EVA3 - Resumen ejecucion pruebas",
  "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  ""
)

foreach ($mod in $modules) {
  $dir = Join-Path $root $mod.Path
  Write-Host "=== $($mod.Name) ===" -ForegroundColor Cyan
  Push-Location $dir
  try {
    $out = & $mvnw -q test jacoco:report 2>&1
    $out | Out-Host
    $exitCode = $LASTEXITCODE
  } finally {
    Pop-Location
  }

  $jacocoXml = Join-Path $dir 'target\site\jacoco\jacoco.xml'
  $covLine = "  Cobertura: (reporte no generado)"
  if (Test-Path $jacocoXml) {
    [xml]$xml = Get-Content $jacocoXml
    $counter = $xml.report.counter | Where-Object { $_.type -eq 'INSTRUCTION' }
    if ($counter) {
      $missed = [int]$counter.missed
      $covered = [int]$counter.covered
      $total = $missed + $covered
      $pct = if ($total -gt 0) { [math]::Round(100.0 * $covered / $total, 1) } else { 0 }
      $covLine = "  Cobertura instrucciones: $pct% ($covered/$total)"
    }
  }

  $lines += "[$($mod.Name)] exit=$exitCode"
  $lines += $covLine
  $lines += "  JaCoCo: $($mod.Path)\target\site\jacoco\index.html"
  $lines += ""
}

$summaryPath = Join-Path $evidencias 'resumen-ejecucion.txt'
$lines | Set-Content $summaryPath -Encoding UTF8
Write-Host ""
Write-Host "Resumen: $summaryPath" -ForegroundColor Green
