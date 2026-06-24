#!/usr/bin/env python3
"""Generate interactive SVG for the panelized systems diagram.

Scans the source image for bright yellow numbered callout circles and writes
an SVG with embedded image reference + transparent hotspot circles.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "public" / "images" / "panelized" / "panelized-systems.webp"
OUT_SVG = ROOT / "public" / "images" / "panelized" / "panelized-systems.svg"
OUT_DEBUG = ROOT / "public" / "images" / "panelized" / "hotspots-debug.png"


def yellow_masks(arr: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    r, g, b = arr[..., 0].astype(np.int16), arr[..., 1].astype(np.int16), arr[..., 2].astype(np.int16)
    strict = (
        (r > 220) & (g > 185) & (b < 65) &
        ((r - b) > 150) & ((g - b) > 110) & (r >= g)
    )
    loose = (
        (r > 200) & (g > 170) & (b < 90) &
        ((r - b) > 120) & ((g - b) > 80)
    )
    return strict, loose


def find_yellow_blobs(mask: np.ndarray, min_area: float, max_area: float):
    import cv2
    mask_u8 = (mask.astype(np.uint8) * 255)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask_u8 = cv2.morphologyEx(mask_u8, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(mask_u8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    blobs = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < min_area or area > max_area:
            continue
        peri = cv2.arcLength(cnt, True)
        if peri <= 0:
            continue
        circ = 4.0 * np.pi * area / (peri * peri)
        if circ < 0.5:
            continue
        m = cv2.moments(cnt)
        if m["m00"] == 0:
            continue
        cx = m["m10"] / m["m00"]
        cy = m["m01"] / m["m00"]
        x, y, w, h = cv2.boundingRect(cnt)
        blobs.append({
            "cx": cx, "cy": cy,
            "area": area,
            "bw": w, "bh": h,
            "circularity": circ,
        })
    return blobs


def dedupe(blobs: list[dict], min_dist: float = 50) -> list[dict]:
    blobs = sorted(blobs, key=lambda b: b["area"] * b["circularity"], reverse=True)
    picked = []
    for b in blobs:
        if any((b["cx"] - p["cx"]) ** 2 + (b["cy"] - p["cy"]) ** 2 < min_dist ** 2 for p in picked):
            continue
        picked.append(b)
    return picked


def read_digit(img: Image.Image, arr: np.ndarray, ymask: np.ndarray, blob: dict) -> int | None:
    w, h = img.size
    cx, cy = blob["cx"], blob["cy"]
    r = blob["r"]
    Y, X = np.mgrid[0 : arr.shape[0], 0 : arr.shape[1]]
    dist2 = (X - cx) ** 2 + (Y - cy) ** 2
    inner = dist2 < (r * 0.55) ** 2
    black = (arr[..., 0] < 85) & (arr[..., 1] < 85) & (arr[..., 2] < 85)
    digit_region = black & inner

    ys, xs = np.where(digit_region)
    if len(xs) < 10:
        return None

    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    pad = 2
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(w, x1 + pad), min(h, y1 + pad)

    crop = img.crop((x0, y0, x1, y1)).convert("L")
    crop = ImageOps.autocontrast(crop)
    scale = 12
    crop = crop.resize(
        (max(1, crop.width * scale), max(1, crop.height * scale)),
        Image.Resampling.NEAREST,
    )
    arr_crop = np.array(crop)
    dark = arr_crop < 125

    try:
        import pytesseract
        bw = Image.fromarray((arr_crop < 128).astype(np.uint8) * 255)
        txt = pytesseract.image_to_string(
            bw, config="--psm 10 -c tessedit_char_whitelist=123456",
        ).strip()
        if txt and txt[0].isdigit() and 1 <= int(txt[0]) <= 6:
            return int(txt[0])
    except Exception:
        pass

    best_d, best_score = None, -1.0
    for d in range(1, 7):
        t = Image.new("L", (crop.width, crop.height), 255)
        draw = ImageDraw.Draw(t)
        fs = max(18, crop.height // 2)
        draw.text((crop.width // 2 - fs // 3, crop.height // 2 - fs // 2), str(d), fill=0)
        tmpl = np.array(t) < 128
        overlap = (dark & tmpl).sum()
        union = (dark | tmpl).sum()
        score = overlap / max(union, 1)
        if score > best_score:
            best_score = score
            best_d = d
    return best_d if best_score > 0.08 else None


def assign_digits_spatial(primary: list[dict], width: int, height: int):
    """Map scanned yellow blobs to callout numbers 1–6 using layout geometry."""
    for p in primary:
        p["r"] = round(math.sqrt(p["area"] / math.pi) * 0.92, 1)
        p["digit"] = None

    blobs = list(primary)
    if len(blobs) != 6:
        return

    mid_x = width / 2

    # 1 — bottom center (floor decking)
    lower = [b for b in blobs if b["cy"] > height * 0.72]
    one = min(lower, key=lambda b: abs(b["cx"] - mid_x))
    one["digit"] = 1
    blobs.remove(one)

    # 2 — lower left (exterior wall)
    two = min([b for b in blobs if b["cy"] > height * 0.65], key=lambda b: b["cx"])
    two["digit"] = 2
    blobs.remove(two)

    # 6 — far right
    six = max(blobs, key=lambda b: b["cx"])
    six["digit"] = 6
    blobs.remove(six)

    # 5 — top (lintel / header)
    five = min(blobs, key=lambda b: b["cy"])
    five["digit"] = 5
    blobs.remove(five)

    # 4 — upper left of the two remaining
    blobs.sort(key=lambda b: b["cy"])
    four, three = blobs[0], blobs[1]
    four["digit"] = 4
    three["digit"] = 3


def detect_callouts(image_path: Path):
    img = Image.open(image_path).convert("RGB")
    arr = np.array(img)
    ih, iw = arr.shape[:2]
    strict, loose = yellow_masks(arr)

    primary = dedupe(find_yellow_blobs(strict, 7000, 12000))
    if len(primary) < 6:
        primary = dedupe(find_yellow_blobs(loose, 3000, 12000) + primary)[:6]
    else:
        primary = primary[:6]

    if len(primary) < 6:
        print(f"Warning: only found {len(primary)} yellow callouts", file=sys.stderr)

    assign_digits_spatial(primary, iw, ih)

    primary.sort(key=lambda b: b.get("digit") or 99)
    return img, primary, iw, ih


def build_svg(callouts: list[dict], width: int, height: int) -> str:
    image_href = "/images/panelized/panelized-systems.webp"
    hotspots = []
    for c in callouts:
        num = c.get("digit")
        if not num:
            continue
        cx = round(c["cx"], 1)
        cy = round(c["cy"], 1)
        r = c["r"]
        place = "left" if cx / width > 0.62 else "right"
        hotspots.append(
            f'    <g class="pnl-svg-hotspot" data-num="{num}" data-place="{place}" '
            f'role="button" tabindex="0" aria-label="Callout {num}">\n'
            f'      <circle class="pnl-svg-hotspot-mask" cx="{cx}" cy="{cy}" r="{r + 7}" />\n'
            f'      <circle class="pnl-svg-hotspot-bg" cx="{cx}" cy="{cy}" r="{r}" />\n'
            f'      <text class="pnl-svg-hotspot-num" x="{cx}" y="{cy}" '
            f'text-anchor="middle" dominant-baseline="central" font-size="{round(r * 1.05)}">{num}</text>\n'
            f"    </g>"
        )

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 {width} {height}"
     width="100%"
     height="auto"
     role="img"
     aria-label="Panelized System diagram with numbered callouts 1 through 6">
  <image href="{image_href}" x="0" y="0" width="{width}" height="{height}" preserveAspectRatio="xMidYMid meet"/>
  <g id="pnl-diagram-hotspots">
{chr(10).join(hotspots)}
  </g>
</svg>
"""


def save_debug(img: Image.Image, callouts: list[dict], path: Path):
    draw = ImageDraw.Draw(img)
    for c in callouts:
        num = c.get("digit")
        if not num:
            continue
        x, y, r = c["cx"], c["cy"], c["r"]
        draw.ellipse((x - r, y - r, x + r, y + r), outline="red", width=4)
        draw.text((x - 8, y - 10), str(num), fill="red")
    img.save(path)


def main():
    if not IMAGE.exists():
        print(f"Missing image: {IMAGE}", file=sys.stderr)
        sys.exit(1)

    img, callouts, w, h = detect_callouts(IMAGE)
    svg = build_svg(callouts, w, h)
    OUT_SVG.write_text(svg, encoding="utf-8")
    save_debug(img.copy(), callouts, OUT_DEBUG)
    print(f"Wrote {OUT_SVG} ({len(callouts)} hotspots)", file=sys.stderr)


if __name__ == "__main__":
    main()
