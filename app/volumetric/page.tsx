"use client";

import { useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
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

const STEEL_ADVANTAGES = [
  {
    title: "Stronger and safer",
    points: [
      "Strength-to-weight ratio three to five times higher than wood",
      "Engineered to handle transport, wind, and seismic conditions",
      "Non-combustible structure protects people and reduces insurance costs",
    ],
  },
  {
    title: "Sustainable choice",
    points: [
      "Entire structure is recyclable steel",
      "Minimal waste in production",
      "Reduced foundation requirements and lower transportation emissions",
      "Supports high performance energy design and airtight construction",
    ],
  },
  {
    title: "Durable and healthy",
    points: [
      "No rot, termites, mold, or shrinkage",
      "Maintains structural integrity across seasons",
      "Precision-built components eliminate warping",
    ],
  },
];

const STEEL_FASTER = [
  "Factory production shortens build schedules by thirty to fifty per cent",
  "On site assembly completed in days",
  "Immune to lumber price swings and weather delays",
];

const STEEL_RESULT = [
  "Faster to build",
  "Stronger and safer",
  "More sustainable",
  "Built for scale in any community",
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

/* ─── KEY BENEFITS ────────────────────────────────── */
function KeyBenefits() {
  return (
    <section className="pnl-block pnl-block--dark">
      <div className="pnl-container">
        <h2 className="section-h2 pnl-section-h2 pnl-section-h2--light reveal vol-key-benefits-kicker">
          <span className="pnl-kicker pnl-kicker--light" aria-hidden />
          KEY BENEFITS
        </h2>
        <h2 className="section-h2 pnl-section-h2 pnl-section-h2--light reveal d1 vol-key-benefits-head">
          Modular construction simply makes better sense
        </h2>
        <div className="pnl-adv-grid pnl-adv-grid--quad">
          {KEY_BENEFITS.map((b, i) => (
            <div key={b.title} className={`pnl-adv-card reveal${DELAY[i % 2]}`}>
              <div className="pnl-adv-card-top">
                <span className="pnl-adv-index">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="pnl-adv-title">{b.title}</div>
              <SourceList items={b.points} dark />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── LIGHT GAUGE STEEL ───────────────────────────── */
function Steel() {
  return (
    <section className="pnl-block pnl-block--cream">
      <div className="pnl-container">
        <h2 className="section-h2 pnl-section-h2 reveal">
          <span className="pnl-kicker" aria-hidden />
          Light gauge steel: a future-proof advantage
        </h2>
        <div className="pnl-outcome-grid pnl-outcome-grid--quad">
          {STEEL_ADVANTAGES.map((s, i) => (
            <div key={s.title} className={`pnl-outcome-card reveal${DELAY[i % 2]}`}>
              <div className="pnl-outcome-title">{s.title}</div>
              <SourceList items={s.points} />
            </div>
          ))}
        </div>
        <div className="pnl-inclusions reveal">
          <h3 className="pnl-inclusions-title">
            The Result: a repeatable and adaptable building solution that is:
          </h3>
          <SourceList items={STEEL_RESULT} />
        </div>
        <div className="pnl-outcome-card reveal vol-steel-faster">
          <div className="pnl-outcome-title">Faster and predictable</div>
          <SourceList items={STEEL_FASTER} />
        </div>
      </div>
    </section>
  );
}

/* ─── CSA + ENTERPRISE ────────────────────────────── */
function Closing() {
  return (
    <section className="pnl-block pnl-block--light">
      <div className="pnl-container">
        <div className="pnl-outcome-card reveal vol-closing-card">
          <span className="pnl-kicker" aria-hidden />
          <h2 className="section-h2 pnl-section-h2">A fully certified CSA facility</h2>
          <p className="pnl-outcome-text">
            Alinx operates as a fully certified CSA A277 facility, demonstrating our commitment to
            the highest standards of quality, consistency, and compliance in prefabricated
            construction. This certification ensures that all components manufactured in our
            controlled environment meet rigorous building code requirements through a third-party
            audited quality management system. For our clients, this means greater confidence in
            product performance, improved construction efficiency, and streamlined approvals on
            every project.
          </p>
        </div>
        <div className="pnl-outcome-card reveal d1 vol-closing-card vol-closing-card--spaced">
          <span className="pnl-kicker" aria-hidden />
          <h2 className="section-h2 pnl-section-h2">
            Backed by a broadly diversified enterprise that allows us to self perform across a
            variety of construction disciplines
          </h2>
          <EnterpriseProse />
        </div>
      </div>
    </section>
  );
}

function EnterpriseProse() {
  const text =
    "A-Linx is affiliated with service providers that allow us to design and manage every aspect of the build cycle, from property acquisition to long-term facility management. Our core team is led by experienced innovators in light gauge steel construction and certified welding professionals, and backed by on-staff construction managers who have collectively been awarded projects valued at over $20 billion since 2015. It is a true one-stop shop for projects of all sizes and levels of complexity.";
  const parts = text.split(/(\$20 billion)/);
  return (
    <p className="pnl-outcome-text">
      {parts.map((part, i) =>
        part === "$20 billion" ? <strong key={i} className="pnl-stat-inline">{part}</strong> : part
      )}
    </p>
  );
}

export default function VolumetricPage() {
  useScrollReveal();
  return (
    <div className="pnl-page">
      <Nav />
      <Hero />
      <TrueVolumetric />
      <Metaloq />
      <Disrupt />
      <KeyBenefits />
      <Steel />
      <Closing />
      <SiteFooter />
    </div>
  );
}
