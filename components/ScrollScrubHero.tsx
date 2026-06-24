"use client";

import { drawCover } from "@/lib/scroll-composite";
import {
  HERO_MANIFEST,
  HERO_VIDEO_SRC,
  heroFrameSrcForManifest,
  mapScrollToFrameBlend,
  mapScrollToVideoTime,
  type HeroFrameManifest,
} from "@/lib/hero-manifest";
import {
  heroBeatScrollProgress,
  HERO_HEADLINE_FADE_END,
} from "@/lib/hero-phases";
import HeroMorphNarrative from "@/components/HeroMorphNarrative";
import { useCallback, useEffect, useRef, useState } from "react";

const HEADLINE_FADE_END = HERO_HEADLINE_FADE_END;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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
  const manifestRef = useRef<HeroFrameManifest>(HERO_MANIFEST);
  const frameCountRef = useRef(HERO_MANIFEST.frameCount);
  const modeRef = useRef<ScrubMode>("frames");
  const lastDrawKeyRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [useFrames, setUseFrames] = useState(true);
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

  const drawFrameBlend = useCallback(
    (fromIndex: number, toIndex: number, blend: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const from = imagesRef.current[fromIndex];
      const to = imagesRef.current[toIndex];
      if (!from?.complete || !from.naturalWidth) return;

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

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawCover(ctx, from, w, h);

      if (blend > 0.001 && toIndex !== fromIndex && to?.complete && to.naturalWidth) {
        ctx.globalAlpha = blend;
        drawCover(ctx, to, w, h);
        ctx.globalAlpha = 1;
      }
    },
    []
  );

  const drawFrame = useCallback(
    (frameIndex: number) => {
      drawFrameBlend(frameIndex, frameIndex, 0);
    },
    [drawFrameBlend]
  );

  const seekVideo = useCallback(
    (scrubP: number) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;

      const target = mapScrollToVideoTime(
        scrubP,
        video.duration,
        manifestRef.current
      );
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

    if (reducedMotion) {
      if (modeRef.current === "frames") {
        drawFrame((manifestRef.current.startFrame ?? 1) - 1);
      } else seekVideo(0);
      return;
    }

    if (modeRef.current === "frames") {
      const { fromIndex, toIndex, blend } = mapScrollToFrameBlend(
        p,
        manifestRef.current
      );
      drawFrameBlend(fromIndex, toIndex, blend);
    } else {
      seekVideo(p);
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
    modeRef.current = "frames";
    lastDrawKeyRef.current = "";

    async function loadFrameImages(): Promise<boolean> {
      let manifest: HeroFrameManifest = HERO_MANIFEST;
      try {
        const res = await fetch("/hero/frames/manifest.json");
        if (res.ok) {
          manifest = (await res.json()) as HeroFrameManifest;
        }
      } catch {
        /* use bundled manifest */
      }

      if (cancelled || !manifest.frameCount) return false;

      manifestRef.current = manifest;
      frameCountRef.current = manifest.frameCount;

      const frameCount = manifest.frameCount;
      const images: HTMLImageElement[] = new Array(frameCount);
      let loaded = 0;

      await new Promise<void>((resolve) => {
        const onDone = () => {
          loaded += 1;
          if (loaded >= frameCount) resolve();
        };

        for (let i = 0; i < frameCount; i++) {
          const img = new Image();
          img.decoding = "async";
          img.src = heroFrameSrcForManifest(i, manifest);
          img.onload = onDone;
          img.onerror = onDone;
          images[i] = img;
        }
      });

      if (cancelled) return false;

      const startIdx = (manifest.startFrame ?? 1) - 1;
      const endIdx = Math.min(manifest.endFrame ?? frameCount, frameCount) - 1;
      const firstOk = images[startIdx]?.complete && images[startIdx].naturalWidth > 0;
      const lastOk = images[endIdx]?.complete && images[endIdx].naturalWidth > 0;
      if (!firstOk || !lastOk) return false;

      imagesRef.current = images;
      return true;
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
      const hasFrames = await loadFrameImages();
      if (cancelled) return;

      if (hasFrames) {
        modeRef.current = "frames";
        setUseFrames(true);
      } else {
        console.warn(
          "Hero frames missing or failed to load — falling back to video scrub.",
          HERO_MANIFEST
        );
        modeRef.current = "video";
        setUseFrames(false);
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

  const beatProgress = heroBeatScrollProgress(progress);
  const narrativeVisible = beatProgress > 0;

  return (
    <section
      id="hero"
      ref={containerRef}
      className={`scroll-hero${reducedMotion ? " scroll-hero-reduced" : ""}`}
    >
      <div className="scroll-hero-sticky">
        <video
          ref={videoRef}
          className="scroll-hero-video"
          src={HERO_VIDEO_SRC}
          muted
          playsInline
          preload={useFrames ? "none" : "auto"}
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

        <HeroMorphNarrative
          beatProgress={beatProgress}
          visible={narrativeVisible}
          reducedMotion={reducedMotion}
        />
      </div>
    </section>
  );
}
