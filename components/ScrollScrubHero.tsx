"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HeroManifest = {
  fps: number;
  frameCount: number;
  pattern: string;
  width: number;
  height: number;
  cacheKey?: string;
};

const PHASES = [
  "Steel Skeleton",
  "Facade Panels",
  "Glass Facade",
  "Site Complete",
] as const;

const SCROLL_HEIGHT_VH = 300;
const HEADLINE_FADE_END = 0.2;

/** Map scrub progress to 0–1 over the phase section only (after headline fades) */
function phaseScrollProgress(progress: number) {
  if (progress <= HEADLINE_FADE_END) return 0;
  return (progress - HEADLINE_FADE_END) / (1 - HEADLINE_FADE_END);
}

/** Hold full opacity most of each segment; short fades at edges only */
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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function frameSrc(index: number, cacheKey: string) {
  const n = String(index + 1).padStart(4, "0");
  const q = cacheKey ? `?v=${encodeURIComponent(cacheKey)}` : "";
  return `/hero/frames/frame_${n}.jpg${q}`;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
) {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = cw / ch;
  let sw: number;
  let sh: number;
  let sx: number;
  let sy: number;

  if (ir > cr) {
    sh = img.naturalHeight;
    sw = sh * cr;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / cr;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

export default function ScrollScrubHero() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef(-1);
  const rafRef = useRef<number | null>(null);

  const [manifest, setManifest] = useState<HeroManifest | null>(null);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [headlineOpacity, setHeadlineOpacity] = useState(1);

  const frameCount = manifest?.frameCount ?? 0;
  const cacheKey =
    manifest?.cacheKey ?? (manifest ? String(manifest.frameCount) : "");

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (lastFrameRef.current === index) return;
    lastFrameRef.current = index;
    drawCover(ctx, img, w, h);
  }, []);

  const updateFromScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || reducedMotion || frameCount < 1) return;

    const rect = container.getBoundingClientRect();
    const scrollable = container.offsetHeight - window.innerHeight;
    const p =
      scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1);

    const frameIndex = Math.round(p * (frameCount - 1));
    drawFrame(frameIndex);

    setProgress(p);
    setHeadlineOpacity(1 - clamp(p / HEADLINE_FADE_END, 0, 1));

    window.dispatchEvent(
      new CustomEvent("hero-scrub-progress", { detail: { progress: p } })
    );
  }, [drawFrame, frameCount, reducedMotion]);

  useEffect(() => {
    let cancelled = false;
    fetch("/hero/frames/manifest.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: HeroManifest) => {
        if (!cancelled) setManifest(data);
      })
      .catch(() => {
        if (!cancelled) setManifest(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!manifest || frameCount < 1) return;

    setReady(false);
    framesRef.current = [];
    lastFrameRef.current = -1;

    const images: HTMLImageElement[] = [];
    let loaded = 0;

    const onLoad = () => {
      loaded += 1;
      if (loaded >= frameCount) {
        framesRef.current = images;
        setReady(true);
        drawFrame(0);
        updateFromScroll();
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(i, cacheKey);
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
  }, [manifest, cacheKey, frameCount, drawFrame, updateFromScroll]);

  useEffect(() => {
    if (reducedMotion) {
      const img = framesRef.current[0];
      if (img?.complete) drawFrame(0);
      return;
    }

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateFromScroll();
      });
    };

    const onResize = () => {
      lastFrameRef.current = -1;
      updateFromScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    updateFromScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, updateFromScroll, drawFrame, ready]);

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
