import sys
import xml.etree.ElementTree as ET
from pathlib import Path

path = Path(sys.argv[1])
root = ET.parse(path).getroot()
rows = []
for pkg in root.findall("package"):
    c = pkg.find("counter[@type='INSTRUCTION']")
    if c is None:
        continue
    missed, covered = int(c.get("missed")), int(c.get("covered"))
    total = missed + covered
    if total < 15:
        continue
    rows.append((pkg.get("name"), covered, missed, total, 100 * covered / total))
rows.sort(key=lambda x: -x[3])
print(path)
for name, cov, miss, total, pct in rows:
    print(f"  {pct:5.1f}% ({cov:4}/{total:4}) {name}")
c = root.find("counter[@type='INSTRUCTION']")
missed, covered = int(c.get("missed")), int(c.get("covered"))
total = missed + covered
need = max(0, int(0.8 * total + 0.999) - covered)
print(f"  TOTAL {100*covered/total:.1f}% — need {need} instr for 80%")
