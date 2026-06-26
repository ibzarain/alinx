"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CDN_ASSETS } from "@/lib/cdn";

const KEY_BENEFITS = [
  {
    title: "Built for Canada's housing challenges",
    points: [
      "Factory built using modern methods that meet National Building Code",
      "Rapid deployment in urban, rural, and remote locations",
      "Deploys from single ADUs up to 20-storey communities",
    ],
  },
  {
    title: "Replicable at scale",
    points: [
      "Standardized systems allow province-to-province rollout without requirement for additional re-engineering",
      "Efficient transport and on-site assembly",
      "Streamlined process supports large-scale community builds",
    ],
  },
  {
    title: "Fully integrated model",
    points: [
      "Design, engineering, fabrication, transport, and site build all managed in-house",
      "Consistent quality control, predictable timelines, reduced risk",
    ],
  },
  {
    title: "Adaptable to local needs",
    points: [
      "Flexible layouts and finishes suited for diverse communities",
      "Ability to reflect cultural and aesthetic priorities",
      "Custom design options without slowing production",
    ],
  },
];

function SourceList({ items, faint = 1 }: { items: string[]; faint?: number }) {
  return (
    <ul className="pnl-source-list kb-frost-card__list">
      {items.map((item) => (
        <li key={item} style={{ color: `rgba(228, 232, 238, ${faint})` }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

type FrostBenefitCardProps = {
  index: number;
  title: string;
  points: string[];
  reveal: number;
};

function FrostBenefitCard({ index, title, points, reveal }: FrostBenefitCardProps) {
  const frost = clamp(reveal, 0, 1);
  if (frost <= 0) return null;

  const blurPx = lerp(0, 8, frost);
  const tint = lerp(0, 0.52, frost);

  return (
    <article
      className="kb-frost-card"
      style={{ pointerEvents: frost > 0.2 ? "auto" : "none" }}
    >
      <div
        className="kb-frost-card__glass"
        aria-hidden
        style={{
          backdropFilter: `blur(${blurPx}px) saturate(${lerp(1, 1.08, frost)}) brightness(${lerp(0.94, 0.84, frost)})`,
          WebkitBackdropFilter: `blur(${blurPx}px) saturate(${lerp(1, 1.08, frost)}) brightness(${lerp(0.94, 0.84, frost)})`,
          background: `linear-gradient(160deg, rgba(12, 15, 20, ${tint * 0.92}) 0%, rgba(8, 10, 14, ${tint}) 100%)`,
          borderColor: `rgba(255, 255, 255, ${lerp(0, 0.14, frost)})`,
          boxShadow: `0 10px 32px rgba(0, 0, 0, ${lerp(0, 0.28, frost)})`,
        }}
      />
      <div className="kb-frost-card__body">
        <span className="kb-frost-card__index" aria-hidden style={{ opacity: frost }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3
          className="kb-frost-card__title"
          style={{ color: `rgba(244, 242, 236, ${lerp(0, 1, frost)})` }}
        >
          {title}
        </h3>
        <SourceList items={points} faint={lerp(0, 0.88, frost)} />
      </div>
    </article>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function lerpRgb(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  t: number,
) {
  return `rgb(${Math.round(lerp(from[0], to[0], t))}, ${Math.round(lerp(from[1], to[1], t))}, ${Math.round(lerp(from[2], to[2], t))})`;
}

type VideoBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
};

type LayoutMetrics = {
  padX: number;
  padBottom: number;
  headSpace: number;
  titleTop: number;
  titleBlock: number;
};

function getLayoutMetrics(vw: number, vh: number): LayoutMetrics {
  const padX = clamp(vw * 0.08, 32, 96);
  const padBottom = clamp(vh * 0.1, 48, 96);
  const navClearance = clamp(vh * 0.12, 96, 132);
  const titleBlock = clamp(vh * 0.12, 84, 120);
  const titleGap = clamp(vh * 0.045, 32, 52);
  const headSpace = navClearance + titleBlock + titleGap;

  return {
    padX,
    padBottom,
    headSpace,
    titleTop: navClearance,
    titleBlock,
  };
}

function computeVideoBox(
  vw: number,
  vh: number,
  expandT: number,
  metrics: LayoutMetrics,
): VideoBox {
  const { padX, padBottom, headSpace } = metrics;
  const startW = vw - padX * 2;
  const startH = vh - headSpace - padBottom;

  return {
    left: lerp(padX, 0, expandT),
    top: lerp(headSpace, 0, expandT),
    width: lerp(startW, vw, expandT),
    height: lerp(startH, vh, expandT),
    radius: lerp(clamp(vw * 0.022, 14, 22), 0, expandT),
  };
}

export default function ScrollExpandKeyBenefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  const expandT = reducedMotion ? 1 : easeInOutCubic(clamp((progress - 0.05) / 0.95, 0, 1));
  const cardsT = reducedMotion ? 1 : easeInOutCubic(clamp((expandT - 0.5) / 0.5, 0, 1));
  const creamOpacity = reducedMotion ? 0 : clamp(1 - expandT * 1.1, 0, 1);
  const topDarkT = reducedMotion ? 0 : easeInOutCubic(clamp((expandT - 0.08) / 0.72, 0, 1));
  const headColor = reducedMotion
    ? "var(--text)"
    : lerpRgb([20, 24, 31], [240, 237, 230], topDarkT);
  const navTheme = expandT > 0.45 ? "dark" : "light";

  const layout =
    viewport.w > 0 ? getLayoutMetrics(viewport.w, viewport.h) : null;
  const videoBox =
    layout != null
      ? computeVideoBox(viewport.w, viewport.h, expandT, layout)
      : null;

  const updateFromScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    setViewport({ w: window.innerWidth, h: window.innerHeight });

    if (reducedMotion) {
      setProgress(1);
      return;
    }

    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    const p = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1);
    setProgress(p);
  }, [reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 2;
    void video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    updateFromScroll();

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateFromScroll();
      });
    };

    const onResize = () => updateFromScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateFromScroll]);

  return (
    <section
      id="key-benefits"
      ref={sectionRef}
      className={`kb-scroll${reducedMotion ? " kb-scroll--reduced" : ""}`}
      data-nav-theme={navTheme}
    >
      <div className="kb-scroll-sticky">
        <div
          className="kb-scroll-cream"
          aria-hidden
          style={{ opacity: creamOpacity }}
        />

        <div
          className="kb-scroll-top-dark"
          aria-hidden
          style={{
            opacity: topDarkT,
            height: layout ? layout.headSpace : undefined,
          }}
        />

        <div
          className="kb-scroll-head-wrap"
          style={
            layout
              ? {
                  top: layout.titleTop,
                  maxHeight: layout.titleBlock,
                  paddingLeft: layout.padX,
                  paddingRight: layout.padX,
                }
              : undefined
          }
        >
          <h2
            className="section-h2 pnl-section-h2 kb-scroll-head"
            style={{
              color: headColor,
              textShadow:
                topDarkT > 0.15
                  ? `0 2px 18px rgba(0, 0, 0, ${lerp(0, 0.42, topDarkT)})`
                  : "none",
            }}
          >
            MODULAR CONSTRUCTION SIMPLY MAKES BETTER SENSE
          </h2>
        </div>

        <div className="kb-scroll-stage">
          <div
            className="kb-scroll-video-shell"
            style={
              videoBox
                ? {
                    left: videoBox.left,
                    top: videoBox.top,
                    width: videoBox.width,
                    height: videoBox.height,
                    borderRadius: videoBox.radius,
                  }
                : undefined
            }
          >
            <video
              ref={videoRef}
              className="kb-scroll-video"
              src={CDN_ASSETS.keyBenefitsVideo}
              muted
              autoPlay
              loop
              playsInline
              aria-hidden
            />
            <div
              className="kb-scroll-scrim"
              aria-hidden
              style={{ opacity: lerp(0.12, 0.55, cardsT) }}
            />

            <div
              className="kb-scroll-cards"
              aria-hidden={cardsT <= 0}
              style={{
                visibility: cardsT > 0 ? "visible" : "hidden",
                pointerEvents: cardsT > 0.2 ? "auto" : "none",
                ...(layout && !reducedMotion
                  ? { top: layout.headSpace, bottom: layout.padBottom }
                  : {}),
              }}
            >
              <div className="kb-scroll-cards-inner">
                <div className="kb-frost-cards">
                  {KEY_BENEFITS.map((b, i) => (
                    <FrostBenefitCard
                      key={b.title}
                      index={i}
                      title={b.title}
                      points={b.points}
                      reveal={cardsT}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
