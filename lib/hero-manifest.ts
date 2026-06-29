import manifest from "./hero-frames.manifest.json";
import { ALINX_CDN } from "./cdn";

export type HeroFrameManifest = {
  frameCount: number;
  startFrame?: number;
  endFrame?: number;
  endTimeSec?: number;
  fps: number;
  format?: "webp" | "jpg";
  pattern: string;
  width: number;
  height: number;
  cacheKey: string;
};

export const HERO_MANIFEST = manifest as HeroFrameManifest;
export const HERO_FRAME_COUNT = HERO_MANIFEST.frameCount;
export const HERO_START_FRAME = HERO_MANIFEST.startFrame ?? 1;
export const HERO_END_FRAME = HERO_MANIFEST.endFrame ?? HERO_FRAME_COUNT;
export const HERO_END_TIME_SEC = HERO_MANIFEST.endTimeSec;
export const HERO_FRAME_PATTERN = HERO_MANIFEST.pattern;
export const HERO_FRAME_CACHE_KEY = HERO_MANIFEST.cacheKey;

export function heroFrameSrcCandidates(index: number, m: HeroFrameManifest): string[] {
  const n = String(index + 1).padStart(4, "0");
  const ext = m.format ?? "webp";
  const q = `?v=${encodeURIComponent(m.cacheKey)}`;
  const fromPattern = m.pattern.includes("%04d")
    ? `${m.pattern.replace("%04d", n)}${q}`
    : `${m.pattern}${q}`;

  const local = `/hero/frames/frame_${n}.${ext}${q}`;
  const proxied = `/cdn-frames/frame_${n}.${ext}${q}`;
  const direct = `${ALINX_CDN}/frames/frame_${n}.${ext}${q}`;

  const out = [local, proxied];
  if (!out.includes(fromPattern)) out.push(fromPattern);
  if (!out.includes(direct)) out.push(direct);
  return out;
}

export function heroFrameSrcForManifest(index: number, m: HeroFrameManifest): string {
  return heroFrameSrcCandidates(index, m)[0];
}

export function scrubStartIndex(m: HeroFrameManifest = HERO_MANIFEST): number {
  return Math.max(0, (m.startFrame ?? 1) - 1);
}

export function scrubEndIndex(m: HeroFrameManifest = HERO_MANIFEST): number {
  return Math.min(m.endFrame ?? m.frameCount, m.frameCount) - 1;
}

export function mapScrollToFrameIndex(
  progress: number,
  m: HeroFrameManifest = HERO_MANIFEST
): number {
  const { fromIndex, toIndex, blend } = mapScrollToFrameBlend(progress, m);
  return blend >= 0.5 ? toIndex : fromIndex;
}

export type FrameBlend = {
  fromIndex: number;
  toIndex: number;
  blend: number;
};

/** Fractional frame position for smooth crossfade scrubbing. */
export function mapScrollToFrameBlend(
  progress: number,
  m: HeroFrameManifest = HERO_MANIFEST
): FrameBlend {
  const p = Math.min(1, Math.max(0, progress));
  const start = scrubStartIndex(m);
  const end = scrubEndIndex(m);
  const scaled = start + p * (end - start);
  const fromIndex = Math.floor(scaled);
  const toIndex = Math.min(end, fromIndex + 1);
  return { fromIndex, toIndex, blend: scaled - fromIndex };
}
