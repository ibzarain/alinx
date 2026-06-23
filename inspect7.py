from pathlib import Path
frag = Path("/home/ibz-arain/Dev/alinx/panelized-fragment.html").read_text()
i = frag.find("SINGLE-SOURCE")
print(frag[i:i+350])
