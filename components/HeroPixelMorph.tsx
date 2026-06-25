"use client";

import {
  buildMorphGrid,
  drawMorphFrame,
  ensureHeroFonts,
  GRID_COLS,
  resolveHeroFontStyle,
  type MorphGrid,
} from "@/lib/hero-pixel-mask";
import {
  HERO_BEATS,
  morphStateFromBeatProgress,
  morphVisibility,
} from "@/lib/hero-phases";
import { useEffect, useRef, useState } from "react";

type HeroPixelMorphProps = {
  beatProgress: number;
  reducedMotion?: boolean;
};

/** Sharp square pixels — scales with viewport */
function cellSizeForViewport(): number {
  const vw = window.innerWidth;
  const fit = Math.floor(vw / GRID_COLS);
  if (vw < 600) return Math.max(2, Math.min(3, fit));
  if (vw < 900) return Math.max(2, Math.min(4, fit));
  return Math.max(3, Math.min(5, fit));
}

export default function HeroPixelMorph({
  beatProgress,
  reducedMotion = false,
}: HeroPixelMorphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<MorphGrid | null>(null);
  const [ready, setReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const morphState = morphStateFromBeatProgress(beatProgress);
  const activeWord = HERO_BEATS[morphState.wordIndex]?.word ?? "";

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    async function rebuild() {
      const fontStyle = resolveHeroFontStyle();
      await ensureHeroFonts(fontStyle);

      if (cancelled) return;

      const cellSize = cellSizeForViewport();
      const grid = await buildMorphGrid(
        HERO_BEATS.map((b) => b.word),
        cellSize,
        fontStyle
      );

      if (cancelled) return;

      gridRef.current = grid;
      setReady(!!grid);
      setUseFallback(!grid);

      if (grid && canvasRef.current) {
        drawMorphFrame(
          canvasRef.current,
          grid,
          morphStateFromBeatProgress(beatProgress),
          morphVisibility(morphStateFromBeatProgress(beatProgress))
        );
      }
    }

    rebuild();

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 200);
    };

    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !ready || !gridRef.current || !canvasRef.current) return;
    drawMorphFrame(
      canvasRef.current,
      gridRef.current,
      morphStateFromBeatProgress(beatProgress),
      morphVisibility(morphStateFromBeatProgress(beatProgress))
    );
  }, [beatProgress, ready, reducedMotion]);

  if (reducedMotion || useFallback) {
    return (
      <div className="hero-narrative-fallback" aria-live="polite">
        {activeWord}
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="hero-narrative-pixel"
        aria-hidden={!ready}
      />
      <span className="sr-only" aria-live="polite">
        {activeWord}
      </span>
    </>
  );
}
