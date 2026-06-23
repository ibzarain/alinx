from pathlib import Path
import re
frag = Path("/home/ibz-arain/Dev/alinx/panelized-fragment.html").read_text()
i = frag.find("... and six more:")
print(frag[i:i+1800])
