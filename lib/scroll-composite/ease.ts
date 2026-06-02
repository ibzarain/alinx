/** Clamp to [0, 1]. */
export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

/** Perlin-style smoothstep on [0, 1] (classic ease-in-out). */
export function smoothstep01(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** Smoothstep between edges a and b. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return smoothstep01(t);
}

/**
 * Ease-in-out for scroll segment progress (ported from Ameo-style pipelines).
 * Uses smoothstep — symmetric acceleration / deceleration.
 */
export function easeInOut(t: number): number {
  return smoothstep01(t);
}
