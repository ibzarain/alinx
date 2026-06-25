"use client";

import { useEffect } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (e) => e.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }),
      { threshold: 0.08 }
    );
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const DELAY = ["", " d1", " d2", " d3"];

/* ─── Content (verbatim from alinx.build) ─────────── */
const ENABLES = [
  "consistent, repeatable stacking",
  "flush structural and envelope interfaces",
  "predictable waterproofing conditions",
  "automation-ready alignment for future manufacturing integration",
];

const USE_CASES = [
  "Hospitality (hotels, extended-stay)",
  "Multi-family residential from entry level to luxury",
  "Student housing",
  "Medical and healthcare facilities",
  "Correctional facilities",
  "Institutional and civic buildings",
];

const GALLERY = [
  { src: "/images/volumetric/slides/slide1.webp", alt: "" },
  { src: "/images/volumetric/slides/slide2.webp", alt: "" },
  { src: "/images/volumetric/slides/slide3.webp", alt: "" },
];

/* ─── Shared bits ─────────────────────────────────── */
function SourceList({ items, dark = false, cols = false }: { items: string[]; dark?: boolean; cols?: boolean }) {
  return (
    <ul className={`pnl-source-list${dark ? " pnl-source-list--dark" : ""}${cols ? " pnl-source-list--cols" : ""}`}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

/* ─── HERO ─────────────────────────────────────────── */
function Hero() {
  return (
    <section className="pnl-hero">
      <div
        className="pnl-hero-bg"
        aria-hidden
        style={{
          background:
            "linear-gradient(105deg, rgba(8,10,14,0.92) 0%, rgba(8,10,14,0.42) 52%, rgba(8,10,14,0.9) 100%), url(/images/volumetric/true-volumetric-building.webp) center 38% / cover no-repeat",
        }}
      />
      <div className="pnl-hero-grid-overlay" aria-hidden />
      <div className="pnl-hero-inner">
        <Link href="/" className="inner-hero-back">
          <svg viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </Link>
        <div className="pnl-hero-body">
          <span className="pnl-hero-kicker" aria-hidden />
          <h1 className="pnl-hero-title">Turnkey<br />Modular</h1>
          <p className="pnl-hero-lead">
            Using Metaloq technology, A-Linx delivers modular structures built to the
            world&apos;s tightest tolerances. Volumetric is finally a practical option.
          </p>
        </div>
      </div>
      <a href="#vol-true" className="pnl-scroll-cue" aria-label="Scroll to explore">
        <span className="pnl-scroll-cue-line" />
      </a>
    </section>
  );
}

/* ─── TRUE VOLUMETRIC ─────────────────────────────── */
function TrueVolumetric() {
  return (
    <section className="pnl-block pnl-block--light" id="vol-true">
      <div className="pnl-container">
        <div className="pnl-editorial reveal">
          <span className="pnl-kicker" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/volumetric/true-volumetric-logo.svg" alt="True Volumetric Logo" className="vol-logo" />
          <h2 className="section-h2 pnl-section-h2">
            A-Linx delivers volumetric structures that radically change the construction landscape
          </h2>
        </div>
        <p className="pnl-prose pnl-prose--lead reveal d1">
          A-Linx is the manufacturing and installation arm of True Volumetric. Its modular
          structures are engineered to advanced manufacturing-sector tolerances, delivering
          uncompromised dimensional stability from factory floor to final set. That level of
          precision rewrites construction economics, collapses timelines, and unlocks a level of
          fit and finish the industry has never achieved. This is the breakthrough that turns
          offsite construction from a promising concept into a decisive, category-defining
          advantage.
        </p>
      </div>
    </section>
  );
}

/* ─── METALOQ ──────────────────────────────────────── */
function Metaloq() {
  return (
    <section className="pnl-block pnl-block--cream">
      <div className="pnl-container">
        <div className="pnl-feature reveal">
          <div className="pnl-feature-copy">
            <span className="pnl-kicker" aria-hidden />
            <h2 className="section-h2 pnl-section-h2">
              Metaloq technology: the heart of an industry-changing innovation
            </h2>
            <MetaloqProse />
            <SourceList items={ENABLES} />
          </div>
          <div className="pnl-feature-media">
            <div className="vol-media-stack">
              <div className="pnl-media-frame pnl-media-frame--tall">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/volumetric/metaloq-worker.webp" alt="Metaloq Worker" />
              </div>
              <div className="pnl-media-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/volumetric/corner-beams-connected.webp" alt="Corner beams connected" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaloqProse() {
  const text =
    "Every A-Linx module is built on a proprietary METALOQ frame using fabrication techniques that include laser cutting and press braking to achieve final volumetric frame tolerances of approximately ±0.01 inches (H) and ±0.03 (L) with near-perfect squareness. This level of precision, coupled with our own expertise in exterior panel finishing, enables:";
  const parts = text.split(/(±0\.01 inches \(H\)|±0\.03 \(L\))/);
  return (
    <p className="pnl-deck pnl-deck--wide">
      {parts.map((part, i) =>
        part === "±0.01 inches (H)" || part === "±0.03 (L)" ? (
          <strong key={i} className="pnl-stat-inline">{part}</strong>
        ) : (
          part
        )
      )}
    </p>
  );
}

/* ─── DISRUPT / USE CASES ─────────────────────────── */
function Disrupt() {
  return (
    <section className="pnl-block pnl-block--light">
      <div className="pnl-container">
        <div className="pnl-editorial reveal">
          <span className="pnl-kicker" aria-hidden />
          <h2 className="section-h2 pnl-section-h2">Designed to disrupt construction conventions</h2>
          <p className="pnl-deck pnl-deck--wide pnl-deck--gap">
            Radically altering the construction landscape across a wide spectrum of case uses, one
            module at a time.
          </p>
        </div>

        <div className="vol-gallery reveal d1">
          {GALLERY.map((g, i) => (
            <div key={i} className="pnl-media-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>

        <div className="pnl-feature pnl-feature--reverse vol-feature-tight reveal">
          <div className="pnl-feature-copy">
            <p className="pnl-prose pnl-prose--lead vol-prose-flush">
              Unlike conventional offsite systems that import traditional construction materials into
              a factory-based production, True Volumetric applies proven manufacturing principles for
              precision, repeatability, and tolerance control. The result is a unique product that
              performs reliably from factory assembly through transportation, stacking, and long-term
              building service. Our METALOQ-based structures are ideally suited for modular projects
              requiring high precision, repeatability, speed to market, reduced manufacturing
              complexity and, ultimately, solid bottom-line economics. Typical use cases include:
            </p>
          </div>
          <div className="pnl-feature-copy">
            <SourceList items={USE_CASES} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function VolumetricPage() {
  useScrollReveal();
  return (
    <div className="pnl-page">
      <Hero />
      <TrueVolumetric />
      <Metaloq />
      <Disrupt />
      <SiteFooter />
    </div>
  );
}
