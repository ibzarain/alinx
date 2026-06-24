/**
 * Hero scroll beats — word morph on linear scroll (video/frame scrub stays 1:1).
 */

export type HeroBeat = {
  word: string;
};

export const HERO_BEATS: HeroBeat[] = [
  { word: "FOUNDATION" },
  { word: "PANELS" },
  { word: "EXTERIOR" },
];

/** @deprecated Use HERO_BEATS */
export const HERO_PHASES = HERO_BEATS;

/**
 * Narrative scroll breakpoints (0–1 after headline fade).
 * Words begin at 0%, 33%, and 66%.
 */
export const HERO_WORD_CUES = [0, 0.22, 0.80, 1] as const;

/**
 * Scroll progress (0–1) spent on each word morph.
 * Same duration for every transition — increase for slower morphs.
 */
export const HERO_MORPH_DURATION = 0.20;

/** Headline fades before narrative words appear. */
export const HERO_HEADLINE_FADE_END = 0.08;

/** 0–1 progress through the narrative region (after headline). */
export function heroBeatScrollProgress(heroProgress: number): number {
  if (heroProgress <= HERO_HEADLINE_FADE_END) return 0;
  return (
    (heroProgress - HERO_HEADLINE_FADE_END) / (1 - HERO_HEADLINE_FADE_END)
  );
}

/** @deprecated Use heroBeatScrollProgress */
export const heroPhaseScrollProgress = heroBeatScrollProgress;

export function beatSegmentBounds(beatIndex: number) {
  const start = HERO_WORD_CUES[beatIndex] ?? 0;
  const end = HERO_WORD_CUES[beatIndex + 1] ?? 1;
  return { start, end, seg: end - start };
}

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Scroll timing → pixel morph draw state */
export function morphStateFromBeatProgress(
  beatProgress: number
): import("@/lib/hero-pixel-mask").MorphDrawState {
  const last = HERO_BEATS.length - 1;
  const idx = heroActiveBeatIndex(beatProgress);
  const { end } = beatSegmentBounds(idx);

  if (idx === last) {
    return {
      mode: "hold",
      wordIndex: idx,
      nextIndex: idx,
      reveal: 1,
      morphT: 0,
      dissolve: 0,
    };
  }

  const morphStart = end - HERO_MORPH_DURATION;

  if (beatProgress < morphStart) {
    return {
      mode: "hold",
      wordIndex: idx,
      nextIndex: idx,
      reveal: 1,
      morphT: 0,
      dissolve: 0,
    };
  }

  const morphT = smoothstep(
    (beatProgress - morphStart) / HERO_MORPH_DURATION
  );
  return {
    mode: "morph",
    wordIndex: idx,
    nextIndex: idx + 1,
    reveal: 1,
    morphT,
    dissolve: 0,
  };
}

export function morphVisibility(
  _state: import("@/lib/hero-pixel-mask").MorphDrawState
): number {
  return 1;
}

export function heroActiveBeatIndex(beatProgress: number): number {
  if (beatProgress <= 0) return 0;
  for (let i = 0; i < HERO_BEATS.length; i++) {
    const { start, end } = beatSegmentBounds(i);
    if (beatProgress >= start && beatProgress < end) return i;
  }
  return HERO_BEATS.length - 1;
}

/** @deprecated Use heroActiveBeatIndex */
export const heroActivePhaseIndex = heroActiveBeatIndex;
