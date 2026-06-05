# Empaqueta entrega EVA2 (sin node_modules ni target) → entrega/REV-EVA2-Barra-Guerrero.zip
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root 'entrega'
$staging = Join-Path $outDir 'REV-EVA2-Barra-Guerrero'
$zipPath = Join-Path $outDir 'REV-EVA2-Barra-Guerrero.zip'

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

# Documentación
$docDst = Join-Path $staging 'Documentacion'
New-Item -ItemType Directory -Path $docDst -Force | Out-Null
foreach ($f in @(
  'Presentacion-REV-EVA2-v5.pdf',
  'Presentacion-REV-EVA2-v5.html',
  'guion-defensa-oral-eva2.md',
  'patrones-y-arquitectura-rev.md',
  'CONTRIBUTING.md',
  'estrategia-ramas-commits-eva2.md',
  'guia-entorno-local.md',
  'repositorios.txt',
  'eva2-fullstack-rubrica.md'
)) {
  $p = Join-Path (Join-Path $root 'docs') $f
  if (Test-Path $p) { Copy-Item $p (Join-Path $docDst $f) -Force }
}

# Código
Copy-Tree (Join-Path $root 'frontend\rev-dashboard') (Join-Path $staging 'Frontend\rev-dashboard')
Copy-Tree (Join-Path $root 'infraestructuredomain\bff-rev') (Join-Path $staging 'Backend\bff-rev')
Copy-Tree (Join-Path $root 'businessdomain\ms-incidentes') (Join-Path $staging 'Backend\ms-incidentes')
Copy-Tree (Join-Path $root 'businessdomain\ms-zonas-riesgo') (Join-Path $staging 'Backend\ms-zonas-riesgo')
Copy-Tree (Join-Path $root 'businessdomain\ms-recursos') (Join-Path $staging 'Backend\ms-recursos')
Copy-Tree (Join-Path $root 'archetypes\rev-microservice-archetype') (Join-Path $staging 'Arquetipos\rev-microservice-archetype')

Copy-Item (Join-Path $root 'docs\repositorios.txt') (Join-Path $staging 'repositorios.txt') -Force
Copy-Item (Join-Path $root 'README.md') (Join-Path $staging 'README.md') -Force

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path $staging -DestinationPath $zipPath -Force
Write-Host "Listo: $zipPath"
