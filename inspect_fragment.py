#!/usr/bin/env python3
from pathlib import Path
import re
html = Path("/home/ibz-arain/Dev/alinx/alinx-build.html").read_text()
id_pat = re.compile(r'id\s*=\s*["\']explore-panelized["\']', re.I)
match = id_pat.search(html)
start = match.start()
lt = html.rfind("<", 0, start)
open_tag = html[lt:html.find(">", start)+1]
tag_name = re.match(r"<\s*(\w+)", open_tag).group(1).lower()
close = f"</{tag_name}>"
depth = 0
pos = lt
end = None
tag_re = re.compile(r"<\s*(/?)\s*(\w+)[^>]*>", re.I)
while pos < len(html):
    m = tag_re.search(html, pos)
    if not m:
        break
    slash, tname = m.group(1), m.group(2).lower()
    if tname == tag_name:
        if slash:
            depth -= 1
            if depth == 0:
                end = m.end()
                break
        elif not html[m.start():m.end()].endswith("/>"):
            depth += 1
    pos = m.end()
fragment = html[lt:end]
Path("/home/ibz-arain/Dev/alinx/panelized-fragment.html").write_text(fragment)
print(len(fragment))
