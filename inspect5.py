from pathlib import Path
frag = Path("/home/ibz-arain/Dev/alinx/panelized-fragment.html").read_text()
print(frag[:1500])
