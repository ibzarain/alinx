"use client";

import {
  compositeHorizontalReveal,
  createOffscreenLayers,
  mapScrollToTransition,
  resizeOffscreenLayers,
  type OffscreenLayers,
} from "@/lib/scroll-composite";
import { useCallback, useEffect, useRef, useState } from "react";

const STEP_COUNT = 5;
const STEP_SRC = (n: number) => `/steps/step${n}.png`;

const PHASES = [
  "Foundation",
  "Steel Skeleton",
  "Facade Panels",
  "Glass Facade",
  "Site Complete",
] as const;

const SCROLL_HEIGHT_VH = 360;
const HEADLINE_FADE_END = 0.18;
/** Feather as a fraction of viewport width (logical px). */
const FEATHER_WIDTH_RATIO = 0.055;
/** Subtle highlight at wipe edge (separate from the mask). */
const ENABLE_EDGE_GLOW = true;
const EDGE_GLOW_OPACITY = 0.06;

function stepSrc(index: number) {
  return STEP_SRC(index + 1);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Map scrub progress to 0–1 over the phase section only (after headline fades). */
function phaseScrollProgress(progress: number) {
  if (progress <= HEADLINE_FADE_END) return 0;
  return (progress - HEADLINE_FADE_END) / (1 - HEADLINE_FADE_END);
}

/** Hold full opacity most of each segment; short fades at edges only. */
function phaseWordOpacity(phaseIndex: number, phaseProgress: number) {
  const n = PHASES.length;
  const seg = 1 / n;
  const start = phaseIndex * seg;
  const end = start + seg;
  const edge = seg * 0.12;

  if (phaseProgress < start || phaseProgress > end) return 0;
  if (phaseProgress < start + edge) {
    return (phaseProgress - start) / edge;
  }
  if (phaseProgress > end - edge) {
    return (end - phaseProgress) / edge;
  }
  return 1;
}

function getDpr(): number {
  return Math.min(window.devicePixelRatio || 1, 2.5);
}

export default function ScrollScrubHero() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const layersRef = useRef<OffscreenLayers | null>(null);
  const lastDrawKeyRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [headlineOpacity, setHeadlineOpacity] = useState(1);

  const drawScene = useCallback(
    (fromIndex: number, toIndex: number, blend: number) => {
      const canvas = canvasRef.current;
      const images = imagesRef.current;
      const from = images[fromIndex];
      const to = images[toIndex];
      if (!canvas || !from?.complete || !from.naturalWidth) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = getDpr();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;

      const drawKey = `${w}x${h}@${dpr}:${fromIndex}-${toIndex}:${blend.toFixed(4)}`;
      if (drawKey === lastDrawKeyRef.current) return;
      lastDrawKeyRef.current = drawKey;

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      let layers = layersRef.current;
      if (!layers) {
        layers = createOffscreenLayers();
        layersRef.current = layers;
      }
      if (!layers) return;

      resizeOffscreenLayers(layers, w, h, dpr);

      const featherPx = Math.max(24, w * FEATHER_WIDTH_RATIO);

      if (blend <= 0 || fromIndex === toIndex) {
        compositeHorizontalReveal(ctx, from, from, w, h, 0, layers, {
          featherPx,
        });
        return;
      }

      const incoming = to?.complete && to.naturalWidth ? to : from;
      compositeHorizontalReveal(ctx, from, incoming, w, h, blend, layers, {
        featherPx,
        edgeGlow: ENABLE_EDGE_GLOW,
        edgeGlowOpacity: EDGE_GLOW_OPACITY,
      });
    },
    []
  );

  const updateFromScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !ready) return;

    const rect = container.getBoundingClientRect();
    const scrollable = container.offsetHeight - window.innerHeight;
    const p = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1);

    setProgress(p);
    setHeadlineOpacity(1 - clamp(p / HEADLINE_FADE_END, 0, 1));

    if (reducedMotion) {
      drawScene(0, 0, 0);
      return;
    }

    const phaseP = phaseScrollProgress(p);
    const { fromIndex, toIndex, blend } = mapScrollToTransition(
      phaseP,
      STEP_COUNT
    );
    drawScene(fromIndex, toIndex, blend);

    window.dispatchEvent(
      new CustomEvent("hero-scrub-progress", { detail: { progress: p } })
    );
  }, [drawScene, ready, reducedMotion]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setReady(false);
    imagesRef.current = [];
    lastDrawKeyRef.current = "";

    const images: HTMLImageElement[] = [];
    let loaded = 0;

    const onLoad = () => {
      loaded += 1;
      if (loaded >= STEP_COUNT) {
        imagesRef.current = images;
        setReady(true);
      }
    };

    for (let i = 0; i < STEP_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = stepSrc(i);
      img.onload = onLoad;
      img.onerror = onLoad;
      images.push(img);
    }

    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    drawScene(0, 0, 0);
    updateFromScroll();

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateFromScroll();
      });
    };

    const onResize = () => {
      lastDrawKeyRef.current = "";
      updateFromScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, updateFromScroll, drawScene]);

  const phaseProgress = phaseScrollProgress(progress);
  const phaseStageVisible = phaseProgress > 0;

  const sectionStyle = reducedMotion
    ? undefined
    : ({ height: `${SCROLL_HEIGHT_VH}vh` } as React.CSSProperties);

  return (
    <section
      id="hero"
      ref={containerRef}
      className={`scroll-hero${reducedMotion ? " scroll-hero-reduced" : ""}`}
      style={sectionStyle}
    >
      <div className="scroll-hero-sticky">
        <canvas
          ref={canvasRef}
          className="scroll-hero-canvas"
          aria-hidden
        />
        {!ready && <div className="scroll-hero-loading" aria-hidden />}

        <div className="scroll-hero-vignette" aria-hidden />

        <div
          className="hero-content"
          style={{
            opacity: headlineOpacity,
            pointerEvents: headlineOpacity < 0.1 ? "none" : "auto",
          }}
        >
          <h1 className="hero-h1">
            <span className="line1">Vertically</span>
            <span className="line2">Integrated.</span>
          </h1>
          <p className="hero-sub">
            Factory-engineered modular structures and panelized systems built to
            manufacturing tolerances, delivered 35% faster and 20% more
            economically than conventional construction.
          </p>
          <div className="hero-actions">
            <a href="#services" className="btn-primary">
              Explore Solutions
            </a>
            <a href="#projects" className="btn-ghost">
              View Projects
            </a>
          </div>
        </div>

        <div
          className={`hero-phase-stage${phaseStageVisible ? " visible" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {PHASES.map((label, i) => {
            const wordOpacity = phaseWordOpacity(i, phaseProgress);
            if (wordOpacity < 0.02) return null;
            const t = 1 - wordOpacity;
            return (
              <span
                key={label}
                className="hero-phase-word"
                style={{
                  opacity: wordOpacity,
                  transform: `translate(-50%, calc(-50% + ${t * 6}px))`,
                  filter: t > 0.15 ? `blur(${t * 3}px)` : "none",
                }}
                aria-hidden={wordOpacity < 0.5}
              >
                {label}
              </span>
            );
          })}
        </div>

        {!reducedMotion && (
          <div className="hero-scrub-progress" aria-hidden>
            <div
              className="hero-scrub-progress-fill"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
