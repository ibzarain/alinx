import { smoothstep } from "./ease";

export type HorizontalRevealMaskOptions = {
  /** Soft band width in pixels (logical / CSS pixels). */
  featherPx: number;
};

/**
 * Alpha for the incoming layer in a left→right wipe (incoming on the left of the edge).
 * 0 = base only; 1 = incoming only.
 */
export function horizontalRevealAlpha(
  x: number,
  width: number,
  progress: number,
  options: HorizontalRevealMaskOptions
): number {
  const { featherPx } = options;
  const feather = Math.max(1, featherPx);
  const edge = clampProgress(progress) * width;
  return 1 - smoothstep(edge - feather, edge + feather, x);
}

function clampProgress(p: number): number {
  return Math.min(1, Math.max(0, p));
}

/**
 * Fill a mask canvas for `destination-in` compositing.
 * Uses the alpha channel only: transparent = hide incoming, opaque = show incoming.
 * (Opaque black/white fills do NOT work — both have alpha 1.)
 */
export function paintHorizontalRevealMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  options: HorizontalRevealMaskOptions
): void {
  const feather = Math.max(1, options.featherPx);
  const edge = clampProgress(progress) * width;

  ctx.clearRect(0, 0, width, height);

  if (progress <= 0) return;

  if (progress >= 1) {
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // Wipe front moves left → right: incoming visible left of edge, base on the right.
  const leftSolid = Math.max(0, edge - feather);
  const rightSolid = Math.min(width, edge + feather);

  if (leftSolid > 0) {
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, leftSolid, height);
  }

  const bandLeft = leftSolid;
  const bandWidth = Math.max(1, rightSolid - bandLeft);
  const gradient = ctx.createLinearGradient(bandLeft, 0, bandLeft + bandWidth, 0);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(bandLeft, 0, bandWidth, height);
}
