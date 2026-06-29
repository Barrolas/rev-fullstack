# Empaqueta entrega EVA3 (sin node_modules ni target) → entrega/REV-EVA3-Barra-Guerrero.zip
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root 'entrega'
$staging = Join-Path $outDir 'REV-EVA3-Barra-Guerrero'
$zipPath = Join-Path $outDir 'REV-EVA3-Barra-Guerrero.zip'

$exclude = @('node_modules', 'target', '.git', 'entrega', 'presentacion-audit-shots', 'presentacion-diagramas')

if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging -Force | Out-Null

function Copy-Tree($src, $dst) {
  if (-not (Test-Path $src)) { return }
  New-Item -ItemType Directory -Path $dst -Force | Out-Null
  Get-ChildItem $src -Force | ForEach-Object {
    if ($exclude -contains $_.Name) { return }
    $to = Join-Path $dst $_.Name
    if ($_.PSIsContainer) { Copy-Tree $_.FullName $to }
    else { Copy-Item $_.FullName $to -Force }
  }
}

# Documentación EVA3
$docDst = Join-Path $staging 'Documentacion'
New-Item -ItemType Directory -Path $docDst -Force | Out-Null
$eva3Docs = Join-Path (Join-Path $root 'docs') 'informe-evidencias\eva3'
foreach ($f in @(
  'plan-de-pruebas-eva3.md',
  'plan-de-pruebas-eva3.pdf',
  'matriz-de-pruebas-eva3.md',
  'matriz-de-pruebas-eva3.pdf',
  'informe-pruebas-eva3.md',
  'informe-pruebas-eva3.pdf',
  'instrucciones-equipo-eva3.md',
  'eva3-fullstack-rubrica.md',
  'guion-video-arquitectura-eva3.md',
  'guion-video-plataforma-eva3.md',
  'guion-video-ejecucion-pruebas-eva3.md',
  'guion-presentacion-oral-eva3.md',
  'registro-cambios-pruebas-v2.md'
)) {
  $p = Join-Path $eva3Docs $f
  if (Test-Path $p) { Copy-Item $p (Join-Path $docDst $f) -Force }
}

# Arquitectura EVA2 (reutilizada)
foreach ($f in @(
  'Presentacion-REV-EVA2-v5.pdf',
  'patrones-y-arquitectura-rev.md',
  'informe-sistema-rev.md',
  'repositorios.txt'
)) {
  $p = Join-Path (Join-Path $root 'docs') $f
  if (Test-Path $p) { Copy-Item $p (Join-Path $docDst $f) -Force }
}

# Evidencias (capturas JaCoCo, tests — crear antes de empaquetar)
$evSrc = Join-Path $eva3Docs 'evidencias'
$evDst = Join-Path $staging 'Evidencias'
if (Test-Path $evSrc) {
  Copy-Tree $evSrc $evDst
} else {
  New-Item -ItemType Directory -Path $evDst -Force | Out-Null
  @'
Colocar aquí antes de empaquetar:
- jacoco-ms-incidentes.png (captura target/site/jacoco)
- mvn-test-incidentes.png
- curl-401.png / curl-200.png
'@ | Set-Content (Join-Path $evDst 'LEEME.txt') -Encoding UTF8
}

# Código
Copy-Tree (Join-Path $root 'frontend\rev-dashboard') (Join-Path $staging 'Frontend\rev-dashboard')
Copy-Tree (Join-Path $root 'infraestructuredomain\bff-rev') (Join-Path $staging 'Backend\bff-rev')
Copy-Tree (Join-Path $root 'infraestructuredomain\api-gateway') (Join-Path $staging 'Backend\api-gateway')
Copy-Tree (Join-Path $root 'businessdomain\ms-incidentes') (Join-Path $staging 'Backend\ms-incidentes')
Copy-Tree (Join-Path $root 'businessdomain\ms-zonas-riesgo') (Join-Path $staging 'Backend\ms-zonas-riesgo')
Copy-Tree (Join-Path $root 'businessdomain\ms-recursos') (Join-Path $staging 'Backend\ms-recursos')
Copy-Tree (Join-Path $root 'archetypes\rev-microservice-archetype') (Join-Path $staging 'Arquetipos\rev-microservice-archetype')

Copy-Item (Join-Path $root 'docs\repositorios.txt') (Join-Path $staging 'repositorios.txt') -Force
Copy-Item (Join-Path $root 'README.md') (Join-Path $staging 'README.md') -Force

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path $staging -DestinationPath $zipPath -Force
Write-Host "Listo: $zipPath"
Write-Host "PDFs: docs/informe-evidencias/eva3/*.pdf (npm run build:eva3-pdfs en docs/)"
