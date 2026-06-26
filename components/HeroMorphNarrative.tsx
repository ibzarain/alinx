"use client";

import { HERO_BEATS, heroActiveBeatIndex, narrativeScrollStyle } from "@/lib/hero-phases";
import HeroPixelMorph from "@/components/HeroPixelMorph";

type HeroMorphNarrativeProps = {
  beatProgress: number;
  heroProgress: number;
  reducedMotion?: boolean;
  revealed?: boolean;
};

export default function HeroMorphNarrative({
  beatProgress,
  heroProgress,
  reducedMotion = false,
  revealed = true,
}: HeroMorphNarrativeProps) {
  const activeIndex = heroActiveBeatIndex(beatProgress);
  const activeWord = HERO_BEATS[activeIndex]?.word ?? "";
  const narrative = narrativeScrollStyle(heroProgress);

  return (
    <div
      className="hero-narrative"
      style={{
        opacity: revealed && narrative.visible ? narrative.opacity : 0,
        visibility: revealed && narrative.visible ? "visible" : "hidden",
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className="hero-narrative-stage"
        style={{ transform: `translateY(${narrative.translateY})` }}
      >
        <HeroPixelMorph
          beatProgress={beatProgress}
          reducedMotion={reducedMotion}
        />
      </div>
      <span className="sr-only">{narrative.visible ? activeWord : ""}</span>
    </div>
  );
}
