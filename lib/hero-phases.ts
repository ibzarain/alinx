/**
 * Hero construction phase copy — timing is scroll-based, not video frames.
 */
export type HeroPhase = {
  step: string;
  label: string;
  description: string;
  /** Relative scroll time — Foundation is brief; later stages get more room. */
  weight: number;
};

export const HERO_PHASES: HeroPhase[] = [
  {
    step: "01",
    label: "Foundation",
    description:
      "The build starts on site. Structure and cores rise floor by floor, setting the tolerances every panel and module will follow.",
    weight: 1,
  },
  {
    step: "02",
    label: "Facade Panels",
    description:
      "Factory-built wall panels are lifted into place. Insulation, air barrier, and structure install together, much faster than stick-built.",
    weight: 2,
  },
  {
    step: "03",
    label: "Glass Facade",
    description:
      "Glazing and exterior finishes close the envelope. Windows, cladding, and weatherproofing form a weathertight shell.",
    weight: 2,
  },
  {
    step: "04",
    label: "Site Complete",
    description:
      "From foundation to finish, a fully integrated building delivered faster, tighter, and more economically than conventional construction.",
    weight: 2.5,
  },
];

/** Headline mostly gone — phase cards begin while user is still leaving the hero title. */
export const HERO_HEADLINE_FADE_END = 0.08;

/** 0–1 progress through the phase-card region (after headline). */
export function heroPhaseScrollProgress(heroProgress: number): number {
  if (heroProgress <= HERO_HEADLINE_FADE_END) return 0;
  return (
    (heroProgress - HERO_HEADLINE_FADE_END) / (1 - HERO_HEADLINE_FADE_END)
  );
}

export function phaseSegmentBounds(phaseIndex: number) {
  const totalWeight = HERO_PHASES.reduce((sum, p) => sum + p.weight, 0);
  let cursor = 0;
  for (let i = 0; i < HERO_PHASES.length; i++) {
    const seg = HERO_PHASES[i].weight / totalWeight;
    const start = cursor;
    const end = cursor + seg;
    if (i === phaseIndex) return { start, end, seg };
    cursor = end;
  }
  return { start: 0, end: 0, seg: 0 };
}

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export type PhasePanelMotion = {
  opacity: number;
  zIndex: number;
};

/** In-place opacity crossfade — no slide or blur. */
export function phasePanelMotion(
  phaseIndex: number,
  phaseProgress: number
): PhasePanelMotion {
  const { start, end, seg } = phaseSegmentBounds(phaseIndex);
  const edge = seg * 0.14;

  if (phaseProgress < start || phaseProgress > end) {
    return { opacity: 0, zIndex: phaseIndex };
  }

  if (phaseProgress < start + edge) {
    return {
      opacity: smoothstep((phaseProgress - start) / edge),
      zIndex: 10 + phaseIndex,
    };
  }

  if (phaseProgress > end - edge) {
    return {
      opacity: smoothstep((end - phaseProgress) / edge),
      zIndex: 10 + phaseIndex,
    };
  }

  return { opacity: 1, zIndex: 10 + phaseIndex };
}

/** Which phase is primary at this scroll position (for progress rail). */
export function heroActivePhaseIndex(phaseProgress: number): number {
  if (phaseProgress <= 0) return 0;
  for (let i = 0; i < HERO_PHASES.length; i++) {
    const { start, end } = phaseSegmentBounds(i);
    if (phaseProgress >= start && phaseProgress < end) return i;
  }
  return HERO_PHASES.length - 1;
}
