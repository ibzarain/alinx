#!/usr/bin/env python3
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

URL = "https://alinx.build/"
OUT = Path("/home/ibz-arain/Dev/alinx/panelized-source-text.txt")
HTML_PATH = Path("/home/ibz-arain/Dev/alinx/alinx-build.html")

VOID = frozenset(
    "area base br col embed hr img input link meta param source track wbr use".split()
)
SKIP = frozenset(("script", "style", "iframe", "svg"))
BLOCK = frozenset(
    "h1 h2 h3 h4 h5 h6 p li td th caption dt dd figcaption".split()
)
CONTAINER = frozenset(
    "div section ul ol article main header footer nav figure".split()
)


class Node:
    __slots__ = ("tag", "attrs", "children")

    def __init__(self, tag=None, attrs=None):
        self.tag = tag
        self.attrs = dict(attrs or [])
        self.children = []


class Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root")
        self.stack = [self.root]
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if self._skip:
            return
        if tag in SKIP:
            self._skip += 1
            return
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in SKIP and self._skip:
            self._skip -= 1
            return
        if self._skip:
            return
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self._skip:
            return
        self.stack[-1].children.append(data)


def class_list(node: Node):
    raw = node.attrs.get("class", "")
    return raw.split() if raw else []


def text_of(node: Node) -> str:
    parts = []
    for child in node.children:
        if isinstance(child, str):
            parts.append(child)
        elif child.tag == "br":
            parts.append("\n")
        else:
            parts.append(text_of(child))
    return "".join(parts)


def normalize(text: str) -> str:
    text = text.replace("\xa0", " ")
    out_lines = []
    for line in text.split("\n"):
        line = re.sub(r"[ \t]+", " ", line)
        out_lines.append(line.strip())
    text = "\n".join(out_lines).strip()
    return text


def extract_fragment(html: str) -> str:
    id_pat = re.compile(r'id\s*=\s*["\']explore-panelized["\']', re.I)
    match = id_pat.search(html)
    if not match:
        raise SystemExit("explore-panelized not found")
    start = match.start()
    lt = html.rfind("<", 0, start)
    open_tag = html[lt : html.find(">", start) + 1]
    tag_name = re.match(r"<\s*(\w+)", open_tag).group(1).lower()
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
            elif not html[m.start() : m.end()].endswith("/>"):
                depth += 1
        pos = m.end()
    if end is None:
        raise SystemExit("closing tag not found")
    return html[lt:end]


class Extractor:
    def __init__(self):
        self.lines = []

    def walk_container(self, node: Node):
        buffer = []

        def flush():
            if not buffer:
                return
            text = normalize("".join(buffer))
            if text:
                self.lines.append(text)
            buffer.clear()

        for child in node.children:
            if isinstance(child, str):
                buffer.append(child)
                continue
            if not isinstance(child, Node) or child.tag in SKIP:
                continue
            if child.tag == "img":
                flush()
                self.walk(child)
            elif child.tag == "p" and "two-column-grid-mini" in class_list(child):
                flush()
                self.walk(child)
            elif child.tag in BLOCK:
                flush()
                self.walk(child)
            elif child.tag in CONTAINER:
                flush()
                self.walk_container(child)
            else:
                buffer.append(text_of(child))
        flush()

    def walk(self, node: Node):
        if node.tag in SKIP:
            return
        if node.tag == "img":
            alt = node.attrs.get("alt")
            if alt is not None and alt != "":
                self.lines.append(alt)
            return
        if node.tag == "p" and "two-column-grid-mini" in class_list(node):
            for child in node.children:
                if isinstance(child, Node) and child.tag == "span":
                    self.lines.append(normalize(text_of(child)))
            return
        if node.tag in BLOCK:
            text = normalize(text_of(node))
            if text:
                self.lines.append(text)
            return
        self.walk_container(node)


req = Request(URL, headers={"User-Agent": "Mozilla/5.0"})
html = urlopen(req, timeout=60).read().decode("utf-8", errors="replace")
HTML_PATH.write_text(html, encoding="utf-8")
fragment = extract_fragment(html)
builder = Builder()
builder.feed(fragment)
root = builder.root.children[0] if builder.root.children else None
if root is None:
    sys.exit("empty fragment")
ext = Extractor()
ext.walk(root)
OUT.write_text("\n".join(ext.lines) + ("\n" if ext.lines else ""), encoding="utf-8")
print(f"Wrote {len(ext.lines)} entries to {OUT}")
