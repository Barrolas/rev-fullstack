# Genera docs/data/territorial/casen_cordillera_seed.sql desde Libro CASEN 2024
param(
    [string]$XlsxPath = "e:\CODE\PERSONAL\advitair-enterprise\docs\notas_tecnicas\Libro_de_codigos_Casen_2024_prov_comuna.xlsx",
    [string]$ProvinciaNombre = "Cordillera"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$outFile = Join-Path $repoRoot "docs\data\territorial\casen_cordillera_seed.sql"

$py = @"
import openpyxl, sys
path, prov_name = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
ws = wb['Anexo1']
prov_code = None
comunas = []
for r in ws.iter_rows(values_only=True):
    if not r or len(r) < 8 or r[6] is None:
        continue
    if str(r[5]) == prov_name:
        prov_code = int(r[4])
        comunas.append((int(r[6]), prov_code, str(r[7]).replace("'", "''")))
if prov_code is None:
    raise SystemExit(f'Provincia no encontrada: {prov_name}')
print(prov_code)
for c in comunas:
    print(f'{c[0]}|{c[1]}|{c[2]}')
"@

$lines = py -3 -c $py $XlsxPath $ProvinciaNombre
$prov = [int]$lines[0]
$comunaRows = $lines | Select-Object -Skip 1

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("-- Generado por scripts/generate-casen-cordillera-seed.ps1")
[void]$sb.AppendLine("INSERT INTO provincias (codigo_casen, nombre, estado) VALUES")
[void]$sb.AppendLine("    ($prov, '$ProvinciaNombre', 'ACTIVA')")
[void]$sb.AppendLine("ON CONFLICT (codigo_casen) DO NOTHING;")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("INSERT INTO comunas (codigo_casen, codigo_provincia_casen, nombre, estado) VALUES")
$i = 0
foreach ($row in $comunaRows) {
    $parts = $row -split '\|', 3
    $suffix = if ($i -lt $comunaRows.Count - 1) { "," } else { "" }
    [void]$sb.AppendLine("    ($($parts[0]), $($parts[1]), '$($parts[2])', 'ACTIVA')$suffix")
    $i++
}
[void]$sb.AppendLine("ON CONFLICT (codigo_casen) DO NOTHING;")

Set-Content -Path $outFile -Value $sb.ToString() -Encoding UTF8
Write-Host "OK: $outFile ($($comunaRows.Count) comunas)"
