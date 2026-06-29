/**
 * Hero pixel morph — square grid with smooth edge sub-pixels.
 */

/** Subdivisions per grid cell for edge smoothing (4×4 → 16-bit mask). */
const CELL_SUB = 4;
const FULL_SUB_MASK = (1 << (CELL_SUB * CELL_SUB)) - 1;

export type PixelCell = {
  gx: number;
  gy: number;
  order: number;
  /** Bitmask of filled sub-pixels; all bits set = one full square */
  subMask: number;
};

export type WordMask = {
  word: string;
  cells: PixelCell[];
  cols: number;
  rows: number;
  cellSize: number;
  width: number;
  height: number;
  minGx: number;
  minGy: number;
  maxGx: number;
  maxGy: number;
  offsetX: number;
  offsetY: number;
};

export type MorphGrid = {
  cellSize: number;
  cols: number;
  rows: number;
  width: number;
  height: number;
  words: WordMask[];
};

export type MorphDrawState = {
  mode: "assemble" | "hold" | "morph" | "dissolve";
  wordIndex: number;
  nextIndex: number;
  reveal: number;
  morphT: number;
  dissolve: number;
};

/** Sample grid — sharp square pixels */
export const GRID_COLS = 240;
export const GRID_ROWS = 52;

const HERO_PIXEL_COLOR_FALLBACK = "#f0ede6";

let cachedPixelColor: string | null = null;

/** Matches --bg3 (cream section below hero). */
function heroPixelColor(): string {
  if (cachedPixelColor) return cachedPixelColor;
  if (typeof document === "undefined") {
    cachedPixelColor = HERO_PIXEL_COLOR_FALLBACK;
    return cachedPixelColor;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg3")
    .trim();
  cachedPixelColor = value || HERO_PIXEL_COLOR_FALLBACK;
  return cachedPixelColor;
}

function hash(x: number, y: number, s = 0): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + s * 43.758) * 43758.5453;
  return n - Math.floor(n);
}

export type HeroFontStyle = {
  family: string;
  weight: number;
  /** Letter-spacing as em (matches section-h2) */
  trackingEm: number;
};

export function resolveHeroFontStyle(): HeroFontStyle {
  const fallback: HeroFontStyle = {
    family: "Barlow Condensed, sans-serif",
    weight: 800,
    trackingEm: 0.02,
  };
  if (typeof document === "undefined") return fallback;

  const probe = document.querySelector<HTMLElement>("[data-hero-font-probe]");
  if (!probe) return fallback;

  const style = getComputedStyle(probe);
  const fontSize = parseFloat(style.fontSize) || 100;
  let trackingEm = fallback.trackingEm;
  const ls = style.letterSpacing;
  if (ls && ls !== "normal") {
    const px = parseFloat(ls);
    if (!Number.isNaN(px)) trackingEm = px / fontSize;
  }

  return {
    family: style.fontFamily || fallback.family,
    weight: parseInt(style.fontWeight, 10) || fallback.weight,
    trackingEm,
  };
}

/** @deprecated Use resolveHeroFontStyle */
export function resolveHeroFontFamily(): string {
  return resolveHeroFontStyle().family;
}

export async function ensureHeroFonts(style: HeroFontStyle): Promise<void> {
  await document.fonts.ready;
  const sizes = [12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80];
  const weights = [style.weight, 800, 700];
  await Promise.all(
    weights.flatMap((weight) =>
      sizes.map((size) =>
        document.fonts
          .load(`${weight} ${size}px ${style.family}`)
          .catch(() => undefined)
      )
    )
  );
}

function measureTrackedWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  trackingEm: number,
  fontSize: number
): number {
  const tracking = fontSize * trackingEm;
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    w += ctx.measureText(text[i]).width;
    if (i < text.length - 1) w += tracking;
  }
  return w;
}

function paintTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  trackingEm: number,
  mode: "fill" | "stroke"
) {
  const tracking = fontSize * trackingEm;
  let cursor = x;
  for (let i = 0; i < text.length; i++) {
    if (mode === "stroke") ctx.strokeText(text[i], cursor, y);
    else ctx.fillText(text[i], cursor, y);
    cursor += ctx.measureText(text[i]).width;
    if (i < text.length - 1) cursor += tracking;
  }
}

function paintTrackedTextCapAligned(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baselineY: number,
  fontSize: number,
  trackingEm: number
) {
  ctx.textBaseline = "alphabetic";
  const refDescent = ctx.measureText("H").actualBoundingBoxDescent;
  const tracking = fontSize * trackingEm;
  let cursor = x;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const m = ctx.measureText(ch);
    const y = baselineY - (m.actualBoundingBoxDescent - refDescent);
    ctx.fillText(ch, cursor, y);
    cursor += m.width;
    if (i < text.length - 1) cursor += tracking;
  }
}

function popcount(mask: number): number {
  let n = 0;
  let m = mask;
  while (m) {
    n += m & 1;
    m >>= 1;
  }
  return n;
}

type GlyphGxRange = { gxMin: number; gxMax: number };

function glyphGxRanges(
  text: string,
  style: HeroFontStyle,
  fontSize: number
): GlyphGxRange[] {
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return [];

  const size = fontSize * CELL_SUB;
  measure.font = `${style.weight} ${size}px ${style.family}`;
  const tracking = size * style.trackingEm;

  const ranges: GlyphGxRange[] = [];
  let cursor = 0;
  for (let i = 0; i < text.length; i++) {
    const w = measure.measureText(text[i]).width;
    ranges.push({
      gxMin: Math.floor(cursor / CELL_SUB),
      gxMax: Math.floor((cursor + w - 1) / CELL_SUB),
    });
    cursor += w;
    if (i < text.length - 1) cursor += tracking;
  }
  return ranges;
}

/** Trim a glyph's lowest row, then shift it down so it "falls" slightly. */
function dropGlyphBottomRow(
  cells: PixelCell[],
  gxMin: number,
  gxMax: number,
  dropRows = 1
): PixelCell[] {
  const inGlyph = cells.filter((c) => c.gx >= gxMin && c.gx <= gxMax);
  const rest = cells.filter((c) => c.gx < gxMin || c.gx > gxMax);
  if (inGlyph.length === 0) return cells;

  let bottomGy = 0;
  for (const c of inGlyph) {
    if (c.gy > bottomGy) bottomGy = c.gy;
  }

  const trimmed = inGlyph.filter((c) => c.gy < bottomGy);
  const dropped = trimmed.map((c) => ({ ...c, gy: c.gy + dropRows }));
  return [...rest, ...dropped];
}

function applyWordGlyphPatches(
  mask: Omit<WordMask, "offsetX" | "offsetY">,
  style: HeroFontStyle,
  fontSize: number
): Omit<WordMask, "offsetX" | "offsetY"> {
  if (mask.word !== "EXTERIOR") return mask;

  const ranges = glyphGxRanges(mask.word, style, fontSize);
  const oRange = ranges[6];
  if (!oRange) return mask;

  const cells = dropGlyphBottomRow(mask.cells, oRange.gxMin, oRange.gxMax);
  return finalizeMaskBounds({ ...mask, cells });
}

/** Drop lone antialias specks that read as stray dots between letters. */
function pruneIsolatedCells(cells: PixelCell[]): PixelCell[] {
  const key = (gx: number, gy: number) => `${gx},${gy}`;
  const occupied = new Set(cells.map((c) => key(c.gx, c.gy)));

  return cells.filter((c) => {
    if (popcount(c.subMask) >= 6) return true;

    let neighbors = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        if (occupied.has(key(c.gx + dx, c.gy + dy))) neighbors++;
      }
    }
    return neighbors >= 2;
  });
}

function sampleRaster(
  data: Uint8ClampedArray,
  text: string,
  cols: number,
  rows: number,
  cellSize: number,
  sub: number
): Omit<WordMask, "offsetX" | "offsetY"> | null {
  const cells: PixelCell[] = [];
  const pixelCols = cols * sub;

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      let subMask = 0;

      for (let sy = 0; sy < sub; sy++) {
        for (let sx = 0; sx < sub; sx++) {
          const px = gx * sub + sx;
          const py = gy * sub + sy;
          const i = (py * pixelCols + px) * 4;
          const lum = data[i];
          const alpha = data[i + 3];
          if (alpha > 100 && lum > 88) {
            subMask |= 1 << (sy * sub + sx);
          }
        }
      }

      if (subMask === 0) continue;
      cells.push({ gx, gy, order: hash(gx, gy, text.length), subMask });
    }
  }

  if (cells.length < 20) return null;
  if (cells.length > cols * rows * 0.52) return null;

  const cleaned = pruneIsolatedCells(cells);
  if (cleaned.length < 20) return null;

  cleaned.sort((a, b) => a.order - b.order);
  cleaned.forEach((c, idx) => {
    c.order = idx / Math.max(cleaned.length - 1, 1);
  });

  return {
    word: text,
    cells: cleaned,
    cols,
    rows,
    cellSize,
    width: cols * cellSize,
    height: rows * cellSize,
    minGx: 0,
    minGy: 0,
    maxGx: 0,
    maxGy: 0,
  };
}

function finalizeMaskBounds(
  mask: Omit<WordMask, "minGx" | "minGy" | "maxGx" | "maxGy">
): WordMask {
  let minGx = GRID_COLS;
  let minGy = GRID_ROWS;
  let maxGx = 0;
  let maxGy = 0;
  for (const cell of mask.cells) {
    if (cell.gx < minGx) minGx = cell.gx;
    if (cell.gy < minGy) minGy = cell.gy;
    if (cell.gx > maxGx) maxGx = cell.gx;
    if (cell.gy > maxGy) maxGy = cell.gy;
  }
  const w = (maxGx - minGx + 1) * mask.cellSize;
  const h = (maxGy - minGy + 1) * mask.cellSize;
  return {
    ...mask,
    minGx,
    minGy,
    maxGx,
    maxGy,
    width: w,
    height: h,
  };
}

function unionMaskBounds(masks: WordMask[]) {
  let minGx = GRID_COLS;
  let minGy = GRID_ROWS;
  let maxGx = 0;
  let maxGy = 0;
  for (const mask of masks) {
    if (mask.minGx < minGx) minGx = mask.minGx;
    if (mask.minGy < minGy) minGy = mask.minGy;
    if (mask.maxGx > maxGx) maxGx = mask.maxGx;
    if (mask.maxGy > maxGy) maxGy = mask.maxGy;
  }
  return { minGx, minGy, maxGx, maxGy };
}

function fitFontSizeForWords(
  texts: string[],
  style: HeroFontStyle,
  pixelCols: number,
  baseFontSize: number
): number {
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return baseFontSize;

  let size = baseFontSize;
  const minSize = 10 * CELL_SUB;
  const setFont = (s: number) => {
    measure.font = `${style.weight} ${s}px ${style.family}`;
  };

  setFont(size);
  while (size > minSize) {
    const tooWide = texts.some(
      (text) =>
        measureTrackedWidth(measure, text, style.trackingEm, size) >
        pixelCols * 0.94
    );
    if (!tooWide) break;
    size -= 1;
    setFont(size);
  }

  return size;
}

function alignWordsToBaseline(masks: WordMask[]): WordMask[] {
  const { maxGy: baselineGy } = unionMaskBounds(masks);
  return masks.map((mask) => {
    const dy = baselineGy - mask.maxGy;
    if (dy === 0) return mask;
    const shifted = mask.cells.map((c) => ({ ...c, gy: c.gy + dy }));
    return finalizeMaskBounds({ ...mask, cells: shifted });
  });
}

function rasterizeOnce(
  text: string,
  style: HeroFontStyle,
  cellSize: number,
  cols: number,
  rows: number,
  fontSize: number
): Omit<WordMask, "offsetX" | "offsetY"> | null {
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return null;

  const pixelCols = cols * CELL_SUB;
  const pixelRows = rows * CELL_SUB;

  let size = fontSize * CELL_SUB;
  const setFont = (s: number) => {
    measure.font = `${style.weight} ${s}px ${style.family}`;
  };

  setFont(size);
  while (
    measureTrackedWidth(measure, text, style.trackingEm, size) > pixelCols * 0.94 &&
    size > 10 * CELL_SUB
  ) {
    size -= 1;
    setFont(size);
  }

  const off = document.createElement("canvas");
  off.width = pixelCols;
  off.height = pixelRows;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, pixelCols, pixelRows);
  ctx.fillStyle = "#fff";
  ctx.font = `${style.weight} ${size}px ${style.family}`;
  ctx.textAlign = "left";
  const bottomPad = CELL_SUB * 2;
  const baselineY = pixelRows - bottomPad;
  paintTrackedTextCapAligned(
    ctx,
    text,
    0,
    baselineY,
    size,
    style.trackingEm
  );

  return sampleRaster(
    ctx.getImageData(0, 0, pixelCols, pixelRows).data,
    text,
    cols,
    rows,
    cellSize,
    CELL_SUB
  );
}

function rasterizeWord(
  word: string,
  style: HeroFontStyle,
  cellSize: number,
  fontSize: number
): Omit<WordMask, "offsetX" | "offsetY"> | null {
  const text = word.toUpperCase();
  const cols = GRID_COLS;
  const rows = GRID_ROWS;

  for (let i = 0; i < 3; i++) {
    const mask = rasterizeOnce(
      text,
      style,
      cellSize,
      cols,
      rows,
      fontSize - i * 2
    );
    if (mask) return mask;
  }

  return rasterizeOnce(
    text,
    { ...style, family: "Barlow Condensed, sans-serif" },
    cellSize,
    cols,
    rows,
    fontSize - 4
  );
}

export async function buildMorphGrid(
  words: string[],
  cellSize: number,
  style: HeroFontStyle
): Promise<MorphGrid | null> {
  await ensureHeroFonts(style);

  const cols = GRID_COLS;
  const rows = GRID_ROWS;
  const pixelCols = cols * CELL_SUB;
  const upperWords = words.map((w) => w.toUpperCase());
  const fontSize = fitFontSizeForWords(
    upperWords,
    style,
    pixelCols,
    Math.round(rows * 0.82)
  );

  const local: NonNullable<ReturnType<typeof rasterizeWord>>[] = [];
  for (const w of upperWords) {
    const mask = rasterizeWord(w, style, cellSize, fontSize);
    if (!mask) return null;
    local.push(applyWordGlyphPatches(mask, style, fontSize));
  }

  const placed: WordMask[] = alignWordsToBaseline(
    local.map((m) =>
      finalizeMaskBounds({
        ...m,
        cellSize,
        offsetX: 0,
        offsetY: 0,
      })
    )
  );

  const { minGx, minGy, maxGx, maxGy } = unionMaskBounds(placed);
  const cropW = (maxGx - minGx + 1) * cellSize;
  const cropH = (maxGy - minGy + 1) * cellSize;

  return {
    cellSize,
    cols: GRID_COLS,
    rows: GRID_ROWS,
    width: cropW,
    height: cropH,
    words: placed,
  };
}

export function drawMorphFrame(
  canvas: HTMLCanvasElement,
  grid: MorphGrid,
  state: MorphDrawState,
  alpha = 1
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { cellSize } = grid;

  const from = grid.words[state.wordIndex];
  const to = grid.words[state.nextIndex];
  if (!from) return;

  const activeMasks =
    state.mode === "morph" && to && to !== from ? [from, to] : [from];
  const bounds = unionMaskBounds(activeMasks);
  const width = (bounds.maxGx - bounds.minGx + 1) * cellSize;
  const height = (bounds.maxGy - bounds.minGy + 1) * cellSize;

  const pw = Math.round(width * dpr);
  const ph = Math.round(height * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  if (alpha <= 0.004) return;

  const pixelColor = heroPixelColor();

  const drawCell = (
    mask: WordMask,
    cell: PixelCell,
    scatter = 0
  ) => {
    let x = (cell.gx - bounds.minGx) * cellSize;
    let y =
      (cell.gy - bounds.minGy) * cellSize +
      (bounds.maxGy - mask.maxGy) * cellSize;

    if (scatter > 0) {
      const j = scatter * cellSize * 1.8;
      x += (hash(cell.gx, cell.gy, 2) - 0.5) * j;
      y += (hash(cell.gx, cell.gy, 7) - 0.5) * j;
    }

    ctx.globalAlpha = alpha;
    ctx.fillStyle = pixelColor;

    const ix = Math.floor(x);
    const iy = Math.floor(y);

    if (cell.subMask === FULL_SUB_MASK) {
      ctx.fillRect(ix, iy, cellSize + 1, cellSize + 1);
      return;
    }

    const subSpan = cellSize / CELL_SUB;
    const subSize = Math.max(1, Math.ceil(subSpan));
    for (let sy = 0; sy < CELL_SUB; sy++) {
      for (let sx = 0; sx < CELL_SUB; sx++) {
        const bit = sy * CELL_SUB + sx;
        if ((cell.subMask >> bit) & 1) {
          const rx = Math.floor(ix + sx * subSpan);
          const ry = Math.floor(iy + sy * subSpan);
          ctx.fillRect(rx, ry, subSize, subSize);
        }
      }
    }
  };

  if (state.mode === "assemble") {
    for (const cell of from.cells) {
      if (cell.order > state.reveal) continue;
      drawCell(from, cell);
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (state.mode === "hold") {
    for (const cell of from.cells) {
      drawCell(from, cell);
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (state.mode === "dissolve") {
    for (const cell of from.cells) {
      if (cell.order < state.dissolve * 0.85) continue;
      drawCell(from, cell, state.dissolve);
    }
    ctx.globalAlpha = 1;
    return;
  }

  const t = state.morphT;
  if (t < 0.45) {
    const d = t / 0.45;
    for (const cell of from.cells) {
      if (cell.order < d * 0.85) continue;
      drawCell(from, cell, d * 0.95);
    }
  } else if (to) {
    const r = (t - 0.45) / 0.55;
    for (const cell of to.cells) {
      if (cell.order > r) continue;
      drawCell(to, cell, (1 - r) * 0.7);
    }
  }

  ctx.globalAlpha = 1;
}
