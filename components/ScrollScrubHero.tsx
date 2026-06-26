"use client";

import { drawCover } from "@/lib/scroll-composite";
import {
  HERO_MANIFEST,
  heroFrameSrcForManifest,
  mapScrollToFrameBlend,
  type HeroFrameManifest,
} from "@/lib/hero-manifest";
import {
  heroBeatScrollProgress,
  headlineScrollStyle,
  narrativeScrollStyle,
} from "@/lib/hero-phases";
import HeroMorphNarrative from "@/components/HeroMorphNarrative";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getDpr(): number {
  return Math.min(window.devicePixelRatio || 1, 2.5);
}

function loadHeroFrameImage(
  index: number,
  manifest: HeroFrameManifest
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      resolve(img.naturalWidth > 0 ? img : null);
    };
    img.onerror = () => resolve(null);
    img.src = heroFrameSrcForManifest(index, manifest);
  });
}

export default function ScrollScrubHero() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const manifestRef = useRef<HeroFrameManifest>(HERO_MANIFEST);
  const lastDrawKeyRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [loadPercent, setLoadPercent] = useState(0);
  const [loadReveal, setLoadReveal] = useState<"loading" | "revealing" | "done">("loading");
  const [portalReady, setPortalReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);

  const heroRevealed = loadReveal === "done";

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

  const updateFromScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || (!ready && !firstFrameReady)) return;

    const rect = container.getBoundingClientRect();
    const scrollable = container.offsetHeight - window.innerHeight;
    const p = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1);

    setProgress(p);

    const startIdx = (manifestRef.current.startFrame ?? 1) - 1;

    if (!ready || reducedMotion) {
      drawFrame(startIdx);
      return;
    }

    const { fromIndex, toIndex, blend } = mapScrollToFrameBlend(
      p,
      manifestRef.current
    );
    drawFrameBlend(fromIndex, toIndex, blend);

    window.dispatchEvent(
      new CustomEvent("hero-scrub-progress", { detail: { progress: p } })
    );
  }, [drawFrame, drawFrameBlend, firstFrameReady, ready, reducedMotion]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (heroRevealed) return;

    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.classList.add("hero-scroll-lock");
    if (scrollbarW > 0) {
      document.documentElement.style.setProperty(
        "--hero-lock-scrollbar",
        `${scrollbarW}px`
      );
    }

    return () => {
      document.documentElement.classList.remove("hero-scroll-lock");
      document.documentElement.style.removeProperty("--hero-lock-scrollbar");
    };
  }, [heroRevealed]);

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
    setFirstFrameReady(false);
    setLoadPercent(0);
    setLoadReveal("loading");
    imagesRef.current = [];
    lastDrawKeyRef.current = "";

    async function loadFrameImages(): Promise<boolean> {
      const manifest: HeroFrameManifest = HERO_MANIFEST;

      if (cancelled || !manifest.frameCount) return false;

      manifestRef.current = manifest;

      const frameCount = manifest.frameCount;
      const startIdx = (manifest.startFrame ?? 1) - 1;
      const endIdx = Math.min(manifest.endFrame ?? frameCount, frameCount) - 1;
      const images: HTMLImageElement[] = new Array(frameCount);
      let loadedCount = 0;

      const reportProgress = () => {
        loadedCount += 1;
        if (!cancelled) {
          setLoadPercent(Math.round((loadedCount / frameCount) * 100));
        }
      };

      const first = await loadHeroFrameImage(startIdx, manifest);
      if (cancelled || !first) {
        console.error(
          "Hero: failed to load first frame.",
          heroFrameSrcForManifest(startIdx, manifest)
        );
        return false;
      }

      images[startIdx] = first;
      imagesRef.current = images;
      lastDrawKeyRef.current = "";
      drawFrame(startIdx);
      reportProgress();
      setFirstFrameReady(true);

      const rest = Array.from({ length: frameCount }, (_, i) => i).filter(
        (i) => i !== startIdx
      );

      await Promise.all(
        rest.map(async (i) => {
          const img = await loadHeroFrameImage(i, manifest);
          if (!cancelled && img) images[i] = img;
          reportProgress();
        })
      );

      if (cancelled) return false;

      const loaded = images.filter((img) => img?.complete && img.naturalWidth > 0).length;
      const lastOk = images[endIdx]?.complete && images[endIdx].naturalWidth > 0;

      if (!lastOk) {
        console.warn(
          `Hero: frame ${endIdx + 1} missing (${loaded}/${frameCount} loaded).`
        );
      }

      if (loaded < 2) return false;

      imagesRef.current = images;
      return lastOk || loaded >= frameCount - 1;
    }

    async function init() {
      const hasFrames = await loadFrameImages();
      if (cancelled) return;

      if (!hasFrames) {
        console.error("Hero frames failed to load from CDN.", HERO_MANIFEST);
        setLoadReveal("done");
        return;
      }

      setReady(true);
      setLoadPercent(100);

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        setLoadReveal("done");
      } else {
        requestAnimationFrame(() => setLoadReveal("revealing"));
      }
    }

    init();

    return () => {
      cancelled = true;
      imagesRef.current.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [drawFrame]);

  useEffect(() => {
    if (!firstFrameReady) return;

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
  }, [firstFrameReady, ready, updateFromScroll]);

  const handleLoadingRevealEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "transform" || loadReveal !== "revealing") return;
    setLoadReveal("done");
  };

  const beatProgress = heroBeatScrollProgress(progress);
  const headline = headlineScrollStyle(progress);
  const narrative = narrativeScrollStyle(progress);

  const contentLive = firstFrameReady;

  const loadingOverlay =
    portalReady && loadReveal !== "done"
      ? createPortal(
          <div
            className={`scroll-hero-loading${loadReveal === "revealing" ? " scroll-hero-loading--reveal" : ""}`}
            onTransitionEnd={handleLoadingRevealEnd}
            aria-hidden={loadReveal === "revealing"}
            aria-busy={loadReveal === "loading"}
          >
            <div className="hero-load-percent" aria-live="polite">
              <span className="hero-load-percent-num">{loadPercent}</span>
              <span className="hero-load-percent-suffix">%</span>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {loadingOverlay}
      <section
      id="hero"
      ref={containerRef}
      className={`scroll-hero${reducedMotion ? " scroll-hero-reduced" : ""}`}
    >
      <div className="scroll-hero-sticky">
        <canvas
          ref={canvasRef}
          className="scroll-hero-canvas"
          aria-hidden
        />

        <div className="scroll-hero-vignette" aria-hidden />

        <div
          className="hero-content"
          style={{
            transform: `translateY(${headline.translateY})`,
            opacity: contentLive ? headline.opacity : 0,
            pointerEvents: contentLive && headline.opacity >= 0.1 ? "auto" : "none",
          }}
        >
          <span className="hero-kicker" aria-hidden />
          <h1 className="hero-h1">
            <span className="line1">Vertically</span>
            <span className="line2">Integrated.</span>
          </h1>
          <p className="hero-sub">
            Factory-built modular and panelized systems.
          </p>
          <div className="hero-actions">
            <Link href="/projects" className="btn-hero btn-hero--fill">
              Our Projects
            </Link>
            <Link href="/about" className="btn-hero btn-hero--line">
              Meet the Team
            </Link>
          </div>
        </div>

        <HeroMorphNarrative
          beatProgress={beatProgress}
          heroProgress={progress}
          reducedMotion={reducedMotion}
          revealed={contentLive}
        />
      </div>
    </section>
    </>
  );
}
