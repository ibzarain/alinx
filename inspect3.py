from pathlib import Path
import re
frag = Path("/home/ibz-arain/Dev/alinx/panelized-fragment.html").read_text()
m = re.search(r'<h5 class="advantage-heading">.*?</h5>', frag)
print(m.group(0)[:500] if m else 'none')
m2 = re.search(r'Six advantages', frag)
print(frag[m2.start():m2.start()+1200])
