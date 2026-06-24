#!/usr/bin/env python3
"""Detect bright yellow numbered callout circles on the panelized systems diagram."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "public" / "images" / "panelized" / "panelized-systems.webp"
OUT_JSON = ROOT / "public" / "images" / "panelized" / "hotspots.json"
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
            "min_x": x, "max_x": x + w - 1,
            "min_y": y, "max_y": y + h - 1,
        })
    return blobs


def dedupe(blobs: list[dict], min_dist: float = 50) -> list[dict]:
    blobs = sorted(blobs, key=lambda b: b["area"], reverse=True)
    picked = []
    for b in blobs:
        if any((b["cx"] - p["cx"]) ** 2 + (b["cy"] - p["cy"]) ** 2 < min_dist ** 2 for p in picked):
            continue
        picked.append(b)
    return picked


def read_digit(img: Image.Image, blob: dict) -> int | None:
    w, h = img.size
    cx, cy = blob["cx"], blob["cy"]
    r = max(8, int(min(blob["bw"], blob["bh"]) * 0.22))
    x0, x1 = max(0, int(cx) - r), min(w, int(cx) + r + 1)
    y0, y1 = max(0, int(cy) - r), min(h, int(cy) + r + 1)
    crop = img.crop((x0, y0, x1, y1)).convert("L")
    crop = ImageOps.autocontrast(crop)
    scale = 8
    crop = crop.resize((max(1, crop.width * scale), max(1, crop.height * scale)), Image.Resampling.NEAREST)
    arr = np.array(crop)
    dark = arr < 115

    try:
        import pytesseract
        bw = Image.fromarray((arr < 128).astype(np.uint8) * 255)
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
        fs = max(14, crop.height // 2)
        draw.text((crop.width // 2 - fs // 3, crop.height // 2 - fs // 2), str(d), fill=0)
        tmpl = np.array(t) < 128
        overlap = (dark & tmpl).sum()
        union = (dark | tmpl).sum()
        score = overlap / max(union, 1)
        if score > best_score:
            best_score = score
            best_d = d
    return best_d if best_score > 0.06 else None


def detect(image_path: Path):
    img = Image.open(image_path).convert("RGB")
    arr = np.array(img)
    ih, iw = arr.shape[:2]
    strict, loose = yellow_masks(arr)

    # Primary callouts share ~9700px² area at full resolution
    primary = find_yellow_blobs(strict, min_area=7000, max_area=12000)
    primary = dedupe(primary)

    # If missing callouts (e.g. #2 on green wall), use looser mask for medium blobs
    if len(primary) < 6:
        extra = find_yellow_blobs(loose, min_area=3000, max_area=12000)
        extra = dedupe(extra + primary)
        primary = extra

    # Keep the 6 most callout-like (large + round)
    primary.sort(key=lambda b: b["area"] * b["circularity"], reverse=True)
    picked = dedupe(primary)[:6]

    if len(picked) < 6:
        print(f"Warning: only found {len(picked)} callouts", file=sys.stderr)

    for p in picked:
        p["digit"] = read_digit(img, p)

    # Resolve duplicate / missing digits
    used: dict[int, dict] = {}
    unknown: list[dict] = []
    for p in picked:
        d = p.get("digit")
        if d and d not in used:
            used[d] = p
        else:
            p["digit"] = None
            unknown.append(p)

    missing = [d for d in range(1, 7) if d not in used]
    for p in unknown:
        if missing:
            p["digit"] = missing.pop(0)

    results = []
    for p in picked:
        num = p.get("digit")
        if not num:
            continue
        px_pct = round(p["cx"] / iw * 1000) / 10
        py_pct = round(p["cy"] / ih * 1000) / 10
        place = "left" if px_pct > 62 else "right"
        results.append({
            "num": num,
            "x": px_pct,
            "y": py_pct,
            "place": place,
            "px": round(p["cx"]),
            "py": round(p["cy"]),
            "area": round(p["area"]),
        })

    results.sort(key=lambda r: r["num"])
    return img, results, iw, ih


def save_debug(img: Image.Image, results: list, path: Path):
    draw = ImageDraw.Draw(img)
    for r in results:
        x, y = r["px"], r["py"]
        draw.ellipse((x - 26, y - 26, x + 26, y + 26), outline="red", width=4)
        draw.text((x - 8, y - 10), str(r["num"]), fill="red")
    img.save(path)


def main():
    if not IMAGE.exists():
        print(f"Missing image: {IMAGE}", file=sys.stderr)
        sys.exit(1)

    img, results, w, h = detect(IMAGE)
    payload = {"width": w, "height": h, "hotspots": results}
    print(json.dumps(payload, indent=2))
    OUT_JSON.write_text(json.dumps(payload, indent=2))
    save_debug(img.copy(), results, OUT_DEBUG)
    print(f"\nWrote {OUT_JSON} and {OUT_DEBUG}", file=sys.stderr)


if __name__ == "__main__":
    main()
