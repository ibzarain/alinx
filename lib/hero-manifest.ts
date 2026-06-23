import manifest from "../public/hero/frames/manifest.json";

export type HeroFrameManifest = {
  frameCount: number;
  endFrame?: number;
  endTimeSec?: number;
  fps: number;
  pattern: string;
  width: number;
  height: number;
  videoSrc?: string;
  cacheKey: string;
};

export const HERO_MANIFEST = manifest as HeroFrameManifest;
export const HERO_FRAME_COUNT = HERO_MANIFEST.frameCount;
export const HERO_END_FRAME = HERO_MANIFEST.endFrame ?? HERO_FRAME_COUNT;
export const HERO_END_TIME_SEC = HERO_MANIFEST.endTimeSec;
export const HERO_VIDEO_SRC = HERO_MANIFEST.videoSrc ?? "/building.mp4";
export const HERO_FRAME_PATTERN = HERO_MANIFEST.pattern;
export const HERO_FRAME_CACHE_KEY = HERO_MANIFEST.cacheKey;

export function heroFrameSrcForManifest(index: number, manifest: HeroFrameManifest): string {
  const n = String(index + 1).padStart(4, "0");
  const path = manifest.pattern.replace("%04d", n);
  return `${path}?v=${encodeURIComponent(manifest.cacheKey)}`;
}

/** Map scroll progress (0–1) to last extracted frame index (0-based). */
export function mapScrollToFrameIndex(progress: number, frameCount = HERO_FRAME_COUNT): number {
  const p = Math.min(1, Math.max(0, progress));
  const last = Math.max(0, frameCount - 1);
  return Math.round(p * last);
}

export function mapScrollToVideoTime(progress: number, duration: number): number {
  const p = Math.min(1, Math.max(0, progress));
  if (HERO_END_TIME_SEC && duration > 0) {
    return p * Math.min(HERO_END_TIME_SEC, duration);
  }
  return p * duration;
}
