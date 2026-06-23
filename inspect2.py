from pathlib import Path
import re
frag = Path("/home/ibz-arain/Dev/alinx/panelized-fragment.html").read_text()
for pat in ["table", "td", "th", "advantage", "stat", "two-column", "grid"]:
    print(pat, len(re.findall(pat, frag, re.I)))
# show chunk around METHOD
i = frag.find("METHOD")
print(frag[i-400:i+500])
