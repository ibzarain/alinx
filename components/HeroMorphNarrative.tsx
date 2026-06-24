"use client";

import { HERO_BEATS, heroActiveBeatIndex } from "@/lib/hero-phases";
import HeroPixelMorph from "@/components/HeroPixelMorph";

type HeroMorphNarrativeProps = {
  beatProgress: number;
  visible: boolean;
  reducedMotion?: boolean;
};

export default function HeroMorphNarrative({
  beatProgress,
  visible,
  reducedMotion = false,
}: HeroMorphNarrativeProps) {
  const activeIndex = heroActiveBeatIndex(beatProgress);
  const activeWord = HERO_BEATS[activeIndex]?.word ?? "";

  return (
    <div
      className={`hero-narrative${visible ? " visible" : ""}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="hero-narrative-stage">
        <HeroPixelMorph
          beatProgress={beatProgress}
          reducedMotion={reducedMotion}
        />
      </div>
      <span className="sr-only">{visible ? activeWord : ""}</span>
    </div>
  );
}
