import manifest from "../public/hero/frames/manifest.json";

export type HeroFrameManifest = {
  frameCount: number;
  targetFrameCount?: number;
  endRatio?: number;
  endTimeSec?: number;
  fps: number;
  pattern: string;
  width: number;
  height: number;
  cacheKey: string;
};

export const HERO_MANIFEST = manifest as HeroFrameManifest;
export const HERO_END_RATIO = HERO_MANIFEST.endRatio ?? 0.84;
export const HERO_FRAME_PATTERN = HERO_MANIFEST.pattern;
export const HERO_FRAME_COUNT = HERO_MANIFEST.frameCount;
export const HERO_FRAME_CACHE_KEY = HERO_MANIFEST.cacheKey;

export function heroFrameSrc(index: number): string {
  const n = String(index + 1).padStart(4, "0");
  const path = HERO_FRAME_PATTERN.replace("%04d", n);
  return `${path}?v=${encodeURIComponent(HERO_FRAME_CACHE_KEY)}`;
}
