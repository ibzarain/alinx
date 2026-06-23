from pathlib import Path
import re
frag = Path("/home/ibz-arain/Dev/alinx/panelized-fragment.html").read_text()
print("ul", frag.count("<ul"))
print("ol", frag.count("<ol"))
# list items text
for m in re.finditer(r"<li>(.*?)</li>", frag, re.S):
    t = re.sub(r"<[^>]+>", " ", m.group(1))
    t = re.sub(r"\s+", " ", t).strip()
    print("LI:", t[:100])
