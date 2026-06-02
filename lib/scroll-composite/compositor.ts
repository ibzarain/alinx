import { paintHorizontalRevealMask } from "./mask";

export type CompositeOptions = {
  featherPx: number;
  /** Subtle bright band at the wipe edge. */
  edgeGlow?: boolean;
  edgeGlowWidthPx?: number;
  edgeGlowOpacity?: number;
};

export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
): void {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = cw / ch;
  let sw: number;
  let sh: number;
  let sx: number;
  let sy: number;

  if (ir > cr) {
    sh = img.naturalHeight;
    sw = sh * cr;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / cr;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

export type OffscreenLayers = {
  layer: HTMLCanvasElement;
  layerCtx: CanvasRenderingContext2D;
  mask: HTMLCanvasElement;
  maskCtx: CanvasRenderingContext2D;
};

export function createOffscreenLayers(): OffscreenLayers | null {
  if (typeof document === "undefined") return null;

  const layer = document.createElement("canvas");
  const mask = document.createElement("canvas");
  const layerCtx = layer.getContext("2d");
  const maskCtx = mask.getContext("2d");
  if (!layerCtx || !maskCtx) return null;

  return { layer, layerCtx, mask, maskCtx };
}

export function resizeOffscreenLayers(
  layers: OffscreenLayers,
  width: number,
  height: number,
  dpr: number
): void {
  const pw = Math.round(width * dpr);
  const ph = Math.round(height * dpr);
  for (const canvas of [layers.layer, layers.mask]) {
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
  }
  layers.layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  layers.maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Draw base image, then wipe incoming image left→right with a feathered mask.
 * `blend` must already be eased (0–1).
 */
export function compositeHorizontalReveal(
  ctx: CanvasRenderingContext2D,
  from: HTMLImageElement,
  to: HTMLImageElement,
  width: number,
  height: number,
  blend: number,
  layers: OffscreenLayers,
  options: CompositeOptions
): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (blend <= 0) {
    drawCover(ctx, from, width, height);
    return;
  }

  if (blend >= 1) {
    drawCover(ctx, to, width, height);
    return;
  }

  drawCover(ctx, from, width, height);

  const { layerCtx, maskCtx, layer, mask } = layers;
  layerCtx.clearRect(0, 0, width, height);
  drawCover(layerCtx, to, width, height);

  paintHorizontalRevealMask(maskCtx, width, height, blend, {
    featherPx: options.featherPx,
  });

  layerCtx.save();
  layerCtx.globalCompositeOperation = "destination-in";
  layerCtx.drawImage(mask, 0, 0, width, height);
  layerCtx.restore();

  ctx.drawImage(layer, 0, 0, width, height);

  if (options.edgeGlow) {
    paintEdgeGlow(ctx, width, height, blend, options);
  }
}

function paintEdgeGlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  blend: number,
  options: CompositeOptions
): void {
  const glowWidth = options.edgeGlowWidthPx ?? Math.max(24, options.featherPx * 0.75);
  const opacity = options.edgeGlowOpacity ?? 0.12;
  const edge = blend * width;

  const g = ctx.createLinearGradient(
    edge - glowWidth,
    0,
    edge + glowWidth,
    0
  );
  g.addColorStop(0, "rgba(255, 248, 235, 0)");
  g.addColorStop(0.45, `rgba(255, 248, 235, ${opacity})`);
  g.addColorStop(0.55, `rgba(255, 248, 235, ${opacity * 0.85})`);
  g.addColorStop(1, "rgba(255, 248, 235, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = g;
  ctx.fillRect(
    Math.max(0, edge - glowWidth),
    0,
    Math.min(width, edge + glowWidth) - Math.max(0, edge - glowWidth),
    height
  );
  ctx.restore();
}
