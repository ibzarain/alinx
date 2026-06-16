"use client";

import { drawCover } from "@/lib/scroll-composite";
import { useCallback, useEffect, useRef, useState } from "react";

type FrameManifest = {
  fps: number;
  frameCount: number;
  pattern: string;
  width: number;
  height: number;
  cacheKey: string;
};

const VIDEO_SRC = "/building.mp4";
const MANIFEST_PATH = "/hero/frames/manifest.json";

const PHASES = [
  { label: "Foundation", span: 2 },
  { label: "Facade Panels", span: 1 },
  { label: "Glass Facade", span: 1 },
  { label: "Site Complete", span: 1 },
] as const;

const SCROLL_HEIGHT_VH = 240;
const HEADLINE_FADE_END = 0.18;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function frameSrc(pattern: string, index: number) {
  const n = String(index + 1).padStart(4, "0");
  return pattern.replace("%04d", n);
}

function phaseScrollProgress(progress: number) {
  if (progress <= HEADLINE_FADE_END) return 0;
  return (progress - HEADLINE_FADE_END) / (1 - HEADLINE_FADE_END);
}

function phaseSegmentBounds(phaseIndex: number) {
  const totalSpan = PHASES.reduce((sum, p) => sum + p.span, 0);
  let cursor = 0;
  for (let i = 0; i < PHASES.length; i++) {
    const seg = PHASES[i].span / totalSpan;
    const start = cursor;
    const end = cursor + seg;
    if (i === phaseIndex) return { start, end, seg };
    cursor = end;
  }
  return { start: 0, end: 0, seg: 0 };
}

function phaseWordOpacity(phaseIndex: number, phaseProgress: number) {
  const { start, end, seg } = phaseSegmentBounds(phaseIndex);
  const edge = seg * 0.12;

  if (phaseProgress < start || phaseProgress > end) return 0;
  if (phaseProgress < start + edge) return (phaseProgress - start) / edge;
  if (phaseProgress > end - edge) return (end - phaseProgress) / edge;
  return 1;
}

function mapProgressToFrame(progress: number, frameCount: number) {
  const p = clamp(progress, 0, 1);
  return Math.min(frameCount - 1, Math.round(p * (frameCount - 1)));
}

function getDpr(): number {
  return Math.min(window.devicePixelRatio || 1, 2.5);
}

type ScrubMode = "frames" | "video";

export default function ScrollScrubHero() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const manifestRef = useRef<FrameManifest | null>(null);
  const modeRef = useRef<ScrubMode>("video");
  const lastDrawKeyRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [headlineOpacity, setHeadlineOpacity] = useState(1);

  const drawImage = useCallback((source: CanvasImageSource, key: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = getDpr();
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    if (key === lastDrawKeyRef.current) return;
    lastDrawKeyRef.current = key;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (source instanceof HTMLImageElement) {
      drawCover(ctx, source, w, h);
      return;
    }

    const video = source as HTMLVideoElement;
    const ir = video.videoWidth / video.videoHeight;
    const cr = w / h;
    let sw: number;
    let sh: number;
    let sx: number;
    let sy: number;

    if (ir > cr) {
      sh = video.videoHeight;
      sw = sh * cr;
      sx = (video.videoWidth - sw) / 2;
      sy = 0;
    } else {
      sw = video.videoWidth;
      sh = sw / cr;
      sx = 0;
      sy = (video.videoHeight - sh) / 2;
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
  }, []);

  const drawFrame = useCallback(
    (frameIndex: number) => {
      const img = imagesRef.current[frameIndex];
      if (!img?.complete || !img.naturalWidth) return;
      drawImage(img, `frame:${frameIndex}`);
    },
    [drawImage]
  );

  const seekVideo = useCallback(
    (phaseP: number) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;

      const target = phaseP * video.duration;
      if (Math.abs(video.currentTime - target) > 0.02) {
        video.currentTime = target;
      }
      if (video.readyState >= 2) {
        drawImage(video, `video:${target.toFixed(3)}`);
      }
    },
    [drawImage]
  );

  const updateFromScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !ready) return;

    const rect = container.getBoundingClientRect();
    const scrollable = container.offsetHeight - window.innerHeight;
    const p = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1);

    setProgress(p);
    setHeadlineOpacity(1 - clamp(p / HEADLINE_FADE_END, 0, 1));

    const phaseP = phaseScrollProgress(p);

    if (reducedMotion) {
      if (modeRef.current === "frames") drawFrame(0);
      else seekVideo(0);
      return;
    }

    if (modeRef.current === "frames" && manifestRef.current) {
      drawFrame(mapProgressToFrame(phaseP, manifestRef.current.frameCount));
    } else {
      seekVideo(phaseP);
    }

    window.dispatchEvent(
      new CustomEvent("hero-scrub-progress", { detail: { progress: p } })
    );
  }, [drawFrame, ready, reducedMotion, seekVideo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setReady(false);
    imagesRef.current = [];
    manifestRef.current = null;
    modeRef.current = "video";
    lastDrawKeyRef.current = "";

    async function loadFrames(): Promise<boolean> {
      try {
        const res = await fetch(MANIFEST_PATH);
        if (!res.ok) return false;
        const manifest = (await res.json()) as FrameManifest;
        if (!manifest.frameCount || cancelled) return false;

        const images: HTMLImageElement[] = new Array(manifest.frameCount);
        let loaded = 0;

        await new Promise<void>((resolve) => {
          const onDone = () => {
            loaded += 1;
            if (loaded >= manifest.frameCount) resolve();
          };

          for (let i = 0; i < manifest.frameCount; i++) {
            const img = new Image();
            img.decoding = "async";
            img.src = frameSrc(manifest.pattern, i);
            img.onload = onDone;
            img.onerror = onDone;
            images[i] = img;
          }
        });

        if (cancelled) return false;
        manifestRef.current = manifest;
        imagesRef.current = images;
        modeRef.current = "frames";
        return true;
      } catch {
        return false;
      }
    }

    function loadVideo(): Promise<void> {
      return new Promise((resolve) => {
        const video = videoRef.current;
        if (!video) {
          resolve();
          return;
        }

        const onReady = () => {
          video.removeEventListener("loadeddata", onReady);
          video.removeEventListener("error", onReady);
          resolve();
        };

        video.addEventListener("loadeddata", onReady);
        video.addEventListener("error", onReady);
        video.load();
      });
    }

    async function init() {
      const hasFrames = await loadFrames();
      if (cancelled) return;

      if (!hasFrames) {
        modeRef.current = "video";
        await loadVideo();
      }

      if (!cancelled) setReady(true);
    }

    init();

    return () => {
      cancelled = true;
      imagesRef.current.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

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
  }, [ready, updateFromScroll]);

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
        <video
          ref={videoRef}
          className="scroll-hero-video"
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden
        />
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
          {PHASES.map((phase, i) => {
            const wordOpacity = phaseWordOpacity(i, phaseProgress);
            if (wordOpacity < 0.02) return null;
            const t = 1 - wordOpacity;
            return (
              <span
                key={phase.label}
                className="hero-phase-word"
                style={{
                  opacity: wordOpacity,
                  transform: `translate(-50%, calc(-50% + ${t * 6}px))`,
                  filter: t > 0.15 ? `blur(${t * 3}px)` : "none",
                }}
                aria-hidden={wordOpacity < 0.5}
              >
                {phase.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
