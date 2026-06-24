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
export const HERO_WORD_CUES = [0, 0.40, 0.85, 1] as const;

/**
 * Scroll progress (0–1) spent on each word morph.
 * Same duration for every transition — increase for slower morphs.
 */
export const HERO_MORPH_DURATION = 0.20;

/**
 * Scroll progress (0–1) for headline scrolling up and off screen.
 */
export const HERO_HEADLINE_EXIT_END = 0.11;

/** When narrative begins sliding in (overlaps headline exit). */
export const HERO_NARRATIVE_ENTER_START = 0.035;

/** When narrative is fully in and word morph timeline begins. */
export const HERO_NARRATIVE_ENTER_END = 0.11;

/** @deprecated Use HERO_HEADLINE_EXIT_END */
export const HERO_HEADLINE_FADE_END = HERO_HEADLINE_EXIT_END;

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Headline scrolls up and fades near the end of its exit. */
export function headlineExitProgress(heroProgress: number): number {
  return smoothstep(clamp01(heroProgress / HERO_HEADLINE_EXIT_END));
}

/** FOUNDATION narrative slides in from below. */
export function narrativeEnterProgress(heroProgress: number): number {
  if (heroProgress <= HERO_NARRATIVE_ENTER_START) return 0;
  return smoothstep(
    clamp01(
      (heroProgress - HERO_NARRATIVE_ENTER_START) /
        (HERO_NARRATIVE_ENTER_END - HERO_NARRATIVE_ENTER_START)
    )
  );
}

export function headlineScrollStyle(heroProgress: number): {
  translateY: string;
  opacity: number;
} {
  const t = headlineExitProgress(heroProgress);
  const fade = smoothstep(Math.max(0, (t - 0.5) / 0.5));
  return {
    translateY: `${-t * 22}vh`,
    opacity: 1 - fade,
  };
}

export function narrativeScrollStyle(heroProgress: number): {
  translateY: string;
  opacity: number;
  visible: boolean;
} {
  const t = narrativeEnterProgress(heroProgress);
  return {
    translateY: `${(1 - t) * 14}vh`,
    opacity: t,
    visible: t > 0.01,
  };
}

/** 0–1 progress through the narrative region (after intro scroll handoff). */
export function heroBeatScrollProgress(heroProgress: number): number {
  if (heroProgress <= HERO_NARRATIVE_ENTER_END) return 0;
  return (
    (heroProgress - HERO_NARRATIVE_ENTER_END) / (1 - HERO_NARRATIVE_ENTER_END)
  );
}

/** @deprecated Use heroBeatScrollProgress */
export const heroPhaseScrollProgress = heroBeatScrollProgress;

export function beatSegmentBounds(beatIndex: number) {
  const start = HERO_WORD_CUES[beatIndex] ?? 0;
  const end = HERO_WORD_CUES[beatIndex + 1] ?? 1;
  return { start, end, seg: end - start };
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
