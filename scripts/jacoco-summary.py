import sys
import xml.etree.ElementTree as ET
from pathlib import Path

path = Path(sys.argv[1])
root = ET.parse(path).getroot()
for pkg in root.findall("package"):
    c = pkg.find("counter[@type='INSTRUCTION']")
    if c is None:
        continue
    missed, covered = int(c.get("missed")), int(c.get("covered"))
    total = missed + covered
    if total > 50:
        print(f"{pkg.get('name')}: {100 * covered / total:.1f}%")
