"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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

const ADV_ICONS = [
  <svg key="1" viewBox="0 0 30 30" fill="none"><rect x="1" y="13" width="11" height="15" stroke="currentColor" strokeWidth="1.5" /><rect x="17" y="5" width="11" height="23" stroke="currentColor" strokeWidth="1.5" /><line x1="6" y1="1" x2="6" y2="13" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" /></svg>,
  <svg key="2" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 26c0-5 4.5-9 10-9s10 4 10 9" stroke="currentColor" strokeWidth="1.5" /></svg>,
  <svg key="3" viewBox="0 0 30 30" fill="none"><path d="M3 18L10 11L16 16L23 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M5 3Q9 7 7 11" stroke="currentColor" strokeWidth="1" opacity="0.5" /></svg>,
  <svg key="4" viewBox="0 0 30 30" fill="none"><rect x="7" y="7" width="16" height="16" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="11" width="8" height="8" stroke="currentColor" strokeWidth="1" opacity="0.7" /></svg>,
  <svg key="5" viewBox="0 0 30 30" fill="none"><rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" /><rect x="17" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="17" width="10" height="10" stroke="currentColor" strokeWidth="1.5" /><rect x="17" y="17" width="10" height="10" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" /></svg>,
  <svg key="6" viewBox="0 0 30 30" fill="none"><path d="M15 3L27 9L27 21L15 27L3 21L3 9Z" stroke="currentColor" strokeWidth="1.5" /></svg>,
  <svg key="7" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M10 15L13 18L20 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="8" viewBox="0 0 30 30" fill="none"><path d="M5 24L9 13L15 19L21 9L25 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="9" viewBox="0 0 30 30" fill="none"><rect x="2" y="9" width="26" height="17" stroke="currentColor" strokeWidth="1.5" /><line x1="2" y1="15" x2="28" y2="15" stroke="currentColor" strokeWidth="0.75" /><line x1="10" y1="9" x2="10" y2="26" stroke="currentColor" strokeWidth="0.75" /></svg>,
  <svg key="10" viewBox="0 0 30 30" fill="none"><path d="M5 26L5 15L25 15L25 26" stroke="currentColor" strokeWidth="1.5" /><path d="M1 15L15 5L29 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="11" viewBox="0 0 30 30" fill="none"><rect x="3" y="19" width="24" height="8" stroke="currentColor" strokeWidth="1.5" /><rect x="8" y="13" width="14" height="6" stroke="currentColor" strokeWidth="1.5" /><rect x="12" y="7" width="6" height="6" stroke="currentColor" strokeWidth="1.5" /></svg>,
  <svg key="12" viewBox="0 0 30 30" fill="none"><line x1="15" y1="27" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" /><polyline points="7,13 15,5 23,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

const ADVANTAGES_FIRST = [
  { title: ["PARALLEL", "WORKSTREAMS"], text: "Components pre-manufactured in tandem with site civil and construction work. Result: faster, earlier installation." },
  { title: ["LESS MANPOWER", "REQUIRED ON SITE"], text: "Less skilled labour required on site. Result: reduced cost and lower risk of injury." },
  { title: ["AVOIDANCE OF", "WEATHER RESTRICTIONS"], text: "Less affected by traditional on-site construction conditions. Result: tighter scheduling, reduced weather-related delays on site." },
  { title: ["SINGLE-SOURCE", "ACCOUNTABILITY"], text: "From site civil to superstructure, A-Linx and its affiliates deliver a complete service. Result: single-source reliability." },
  { title: ["DESIGN", "FLEXIBILITY"], text: "Standardized or custom components built to custom specifications. Result: extensive design flexibility." },
  { title: ["FULLY INTEGRATED", "PARTNER"], text: "Total compatibility with all other building technologies. Result: seamless integration with most engineering designs." },
];

const ADVANTAGES_SECOND = [
  { title: ["PRECISION FABRICATION"], text: "Process uses Quality Control Systems to ensure product conformance before arrival on site. Result: reduction in quality disruptions." },
  { title: ["REDUCED MATERIAL WASTE"], text: "Zero net material waste incurred compared to traditional methods. Result: tighter cost control." },
  { title: ["LEAN MANUFACTURING APPROACH"], text: "Systemic approach to building safely, quality first, cost-focused and efficiency oriented. Result: optimal product, significant cost savings." },
  { title: ["LIGHTER FOUNDATIONS"], text: "Lightweight components reduce the required bearing capacity and increase efficiency. Result: significant cost savings" },
  { title: ["LIMITED STORAGE REQUIREMENTS"], text: "Better materials management reduces on-site storage and space-usage requirements. Result: ideal for compact work sites." },
  { title: ["EXPEDITED ERECTION"], text: "Compressed site schedule limits on-site resources/equipment. Result: on time and on budget." },
];

const STEEL_POINTS = [
  "Offers the highest strength-to-weight ratio of any building material",
  "Steel is dimensionally stable - it does not expand or contract with moisture content",
  "Steel is 100% recyclable and non-combustible. Not vulnerable to termites and mold",
  "Steel is inorganic - it will not rot, warp, split, crack or creep",
  "Steel's high strength results in safer structures, reduced maintenance and slower structural aging",
  "Lighter structures with stronger connections result in higher resistance to seismic forces. Reduced probability of damage in high winds.",
];

const FACTORY_BULLETS = [
  "are assembled to high-precision standards",
  "dramatically reduce production waste",
  "are adaptable to a wide variety of design approaches",
];

const ELEMENTS = [
  { title: "Floor assemblies", text: "A-Linx uses a variety of floor systems, including composite decks, hollow-core plank, open web steel joists, and standard C-joists." },
  { title: "Exterior walls", text: "Exterior wall sections are typically shipped with insulation, air barrier and sheathing in place. They can also be shipped with a variety of pre-installed exterior finishes, i.e. EIFS, faux brick, hardy board or aluminum paneling." },
  { title: "Prefab panels", text: "Load- and wind-bearing panels are designed using specific gauges and dimensions based on load requirements to support the building's complete superstructure." },
  { title: "Structural steel", text: "Structural steel elements such as posts, angles, HSS and W sections, are included as required to provide added strength for point loading and to support larger spans." },
  { title: "Lintels", text: "Steel stud/track or structural steel beams are installed above most windows and doorways to distribute load across open spans." },
  { title: "Slab shoring", text: "When required, these temporary beams support the floor slab while the concrete is being poured and cured. They are strategically located to allow roughing in of interior walls on below floors." },
];

const INCLUSIONS = [
  "Cast-in-place cores",
  "Pre-installed windows and doors",
  "Prefabricated mechanical openings",
  "Shop drawing preparation and engineering",
];

const OFFSITE_SUMMARY = [
  "Reduced number of skilled workers needed on site",
  "Enhanced workmanship and factory-built precision",
  "Improved quality control and production efficiencies",
  "Reduced time to watertight superstructure",
  "Reduced total superstructure install costs",
];

const SAVINGS_BULLETS = [
  "Reduced need for expensive skilled trades on site",
  "Reduced exposure to weather delays results in lower downtime",
  "Assembly processes in our factory are cost controlled for maximum economy",
  "Controlled materials procurement and handling in factory result in reduced waste",
  "Front-loaded planning allows for value engineering and for cost-containing strategies to be designed into the entire structure",
];

function AdvTitle({ lines }: { lines: string[] }) {
  return (
    <div className="pnl-adv-title">
      {lines.map((line, i) => (
        <span key={line}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}

function AdvText({ text }: { text: string }) {
  const idx = text.indexOf(" Result: ");
  if (idx === -1) return <p className="pnl-adv-text">{text}</p>;
  return (
    <p className="pnl-adv-text">
      {text.slice(0, idx)}
      <span className="pnl-adv-result"> Result: {text.slice(idx + 9)}</span>
    </p>
  );
}

function FactoryIntro() {
  const text =
    "With A-Linx panelized components superstructure completion times are typically 35% faster and overall costs are typically 20% lower than structures erected using conventional methods. Our factory-made components:";
  const parts = text.split(/(35% faster|20% lower)/);
  return (
    <p className="pnl-deck pnl-deck--dark pnl-deck--wide">
      {parts.map((part) =>
        part === "35% faster" || part === "20% lower" ? (
          <strong key={part} className="pnl-stat-inline">{part}</strong>
        ) : (
          part
        )
      )}
    </p>
  );
}

function SourceList({
  items,
  dark = false,
  cols = false,
}: {
  items: string[];
  dark?: boolean;
  cols?: boolean;
}) {
  return (
    <ul className={`pnl-source-list${dark ? " pnl-source-list--dark" : ""}${cols ? " pnl-source-list--cols" : ""}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/* ─── HERO ───────────────────────────────────────── */
function Hero() {
  return (
    <section className="pnl-hero">
      <div className="pnl-hero-bg" aria-hidden />
      <div className="pnl-hero-grid-overlay" aria-hidden />
      <div className="pnl-hero-inner">
        <Link href="/" className="inner-hero-back">
          <svg viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </Link>
        <div className="pnl-hero-body">
          <span className="pnl-hero-kicker" aria-hidden />
          <h1 className="pnl-hero-title">Panelized<br />Components</h1>
          <p className="pnl-hero-lead">
            A-Linx is a comprehensive supplier of panelized interior and fully-finished
            exterior structural panels.
          </p>
        </div>
      </div>
      <a href="#pnl-advantages" className="pnl-scroll-cue" aria-label="Scroll to explore">
        <span className="pnl-scroll-cue-line" />
      </a>
    </section>
  );
}

/* ─── STRUCTURAL INNOVATION ──────────────────────── */
function StructuralInnovation() {
  return (
    <section className="pnl-block pnl-block--light">
      <div className="pnl-container">
        <div className="pnl-editorial reveal">
          <span className="pnl-kicker" aria-hidden />
          <h2 className="section-h2 pnl-section-h2">
            Structural innovation that makes off-site fabrication the undeniable option of choice
          </h2>
        </div>
        <div className="pnl-cinema reveal d1">
          <div className="pnl-video">
            <iframe
              src="https://www.youtube.com/embed/7TI_VtpUEo4"
              title="A-Linx panelized construction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <p className="pnl-prose pnl-prose--lead reveal d2">
          A-LINX is a fully integrated general-contract-service provider that pre-builds exterior/
          interior load-bearing wall systems and roof trusses. Our systems allow you to complete your
          superstructure in an expedited timeframe, reducing the building costs associated with
          traditional construction. Standard or custom components, including pre-finished interior and
          exterior panels in a range of building material options, allows for design flexibility and
          can adapt to unique client demands. Tighter tolerances and precision assembly processes
          dramatically reduce site issues, allowing your project to advance with previously
          unthinkable speed, accuracy and economy.
        </p>
      </div>
    </section>
  );
}

/* ─── FEATURE SPLIT ──────────────────────────────── */
function FeatureSplit({
  title, body, image, alt, reverse = false, children,
}: {
  title: string; body?: string; image: string; alt: string;
  reverse?: boolean; children?: ReactNode;
}) {
  return (
    <section className={`pnl-block pnl-block--cream${reverse ? " pnl-block--alt" : ""}`}>
      <div className="pnl-container">
        <div className={`pnl-feature reveal${reverse ? " pnl-feature--reverse" : ""}`}>
          <div className="pnl-feature-copy">
            <span className="pnl-kicker" aria-hidden />
            <h2 className="section-h2 pnl-section-h2">{title}</h2>
            {body && <p className="pnl-deck pnl-deck--wide">{body}</p>}
            {children}
          </div>
          <div className="pnl-feature-media">
            <div className="pnl-media-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={alt} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FACTORY BAND ───────────────────────────────── */
function FactoryBand() {
  return (
    <section className="pnl-band">
      <div className="pnl-container">
        <div className="pnl-band-grid reveal">
          <div className="pnl-band-visual">
            <div className="pnl-media-frame pnl-media-frame--glow pnl-media-frame--tall">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/panelized/render.webp" alt="A-LINX render" />
            </div>
          </div>
          <div className="pnl-band-copy">
            <FactoryIntro />
            <SourceList items={FACTORY_BULLETS} dark />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── ADVANTAGES ─────────────────────────────────── */
function Advantages() {
  return (
    <section className="pnl-block pnl-block--dark" id="pnl-advantages">
      <div className="pnl-container">
        <h2 className="section-h2 pnl-section-h2 pnl-section-h2--light reveal">
          <span className="pnl-kicker pnl-kicker--light" aria-hidden />
          Six advantages you can&apos;t afford to ignore:
        </h2>
        <div className="pnl-adv-grid">
          {ADVANTAGES_FIRST.map((a, i) => (
            <div key={a.title.join()} className={`pnl-adv-card reveal${DELAY[i % 4]}`}>
              <div className="pnl-adv-card-top">
                <div className="pnl-adv-icon">{ADV_ICONS[i]}</div>
                <span className="pnl-adv-index">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <AdvTitle lines={a.title} />
              <AdvText text={a.text} />
            </div>
          ))}
        </div>
        <h2 className="section-h2 pnl-section-h2 pnl-section-h2--light pnl-section-h2--spaced reveal">
          <span className="pnl-kicker pnl-kicker--light" aria-hidden />
          ... and six more:
        </h2>
        <div className="pnl-adv-grid">
          {ADVANTAGES_SECOND.map((a, i) => (
            <div key={a.title.join()} className={`pnl-adv-card reveal${DELAY[i % 4]}`}>
              <div className="pnl-adv-card-top">
                <div className="pnl-adv-icon">{ADV_ICONS[i + 6]}</div>
                <span className="pnl-adv-index">{String(i + 7).padStart(2, "0")}</span>
              </div>
              <AdvTitle lines={a.title} />
              <AdvText text={a.text} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SYSTEM ELEMENTS ────────────────────────────── */
const MOBILE_HOTSPOT_MQ = "(max-width: 900px)";
const MOBILE_MIN_HOTSPOT_RADIUS_PX = 15;

function scaleSvgHotspots(root: HTMLElement) {
  const svg = root.querySelector("svg");
  if (!svg) return;

  const mobile = window.matchMedia(MOBILE_HOTSPOT_MQ).matches;
  const displayWidth = svg.getBoundingClientRect().width;
  if (!displayWidth) return;

  const vb = svg.viewBox.baseVal;
  const pxPerUnit = displayWidth / vb.width;
  const baseR = 51;
  const scale = mobile
    ? Math.max(1.375, MOBILE_MIN_HOTSPOT_RADIUS_PX / (baseR * pxPerUnit))
    : 1;

  root.querySelectorAll<SVGGElement>(".pnl-svg-hotspot").forEach((g) => {
    const bg = g.querySelector(".pnl-svg-hotspot-bg");
    if (!bg) return;
    const cx = Number(bg.getAttribute("cx"));
    const cy = Number(bg.getAttribute("cy"));
    if (scale > 1) {
      g.setAttribute("transform", `translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`);
    } else {
      g.removeAttribute("transform");
    }
  });
}

function InteractiveDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [tipPos, setTipPos] = useState<{ x: number; y: number; place: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/images/panelized/panelized-systems.svg")
      .then((r) => r.text())
      .then((markup) => {
        if (cancelled || !rootRef.current) return;
        rootRef.current.innerHTML = markup;
        setReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !rootRef.current) return;
    const root = rootRef.current;

    const syncActiveClass = (num: number | null) => {
      root.querySelectorAll<SVGGElement>(".pnl-svg-hotspot").forEach((g) => {
        g.classList.toggle("is-active", Number(g.dataset.num) === num);
      });
    };

    const positionTip = (g: SVGGElement) => {
      const circle = g.querySelector(".pnl-svg-hotspot-bg");
      const svg = g.ownerSVGElement;
      if (!circle || !svg) return;
      const cx = Number(circle.getAttribute("cx"));
      const cy = Number(circle.getAttribute("cy"));
      const vb = svg.viewBox.baseVal;
      setTipPos({
        x: (cx / vb.width) * 100,
        y: (cy / vb.height) * 100,
        place: g.dataset.place ?? "right",
      });
    };

    const onDoc = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) {
        activeRef.current = null;
        setCurrent(null);
        syncActiveClass(null);
        setTipPos(null);
      }
    };

    const cleanups: Array<() => void> = [];

    root.querySelectorAll<SVGGElement>(".pnl-svg-hotspot").forEach((g) => {
      const num = Number(g.dataset.num);

      const onClick = (e: Event) => {
        e.stopPropagation();
        const next = activeRef.current === num ? null : num;
        activeRef.current = next;
        setCurrent(next);
        syncActiveClass(next);
        if (next === null) setTipPos(null);
        else positionTip(g);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(e);
        }
      };

      g.addEventListener("click", onClick);
      g.addEventListener("keydown", onKey);
      cleanups.push(() => {
        g.removeEventListener("click", onClick);
        g.removeEventListener("keydown", onKey);
      });
    });

    document.addEventListener("pointerdown", onDoc);
    cleanups.push(() => document.removeEventListener("pointerdown", onDoc));

    return () => cleanups.forEach((fn) => fn());
  }, [ready]);

  useEffect(() => {
    if (!ready || !rootRef.current) return;
    const root = rootRef.current;

    const update = () => scaleSvgHotspots(root);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(root);
    window.addEventListener("resize", update);
    const mq = window.matchMedia(MOBILE_HOTSPOT_MQ);
    mq.addEventListener("change", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, [ready]);

  const item = current !== null ? ELEMENTS[current - 1] : null;

  return (
    <div className="pnl-diagram-interactive reveal">
      <div className="pnl-diagram-svg-wrap" ref={rootRef} />

      {item && tipPos && (
        <div
          className={`pnl-hotspot-card pnl-hotspot-card--floating pnl-hotspot-card--${tipPos.place}`}
          style={{ left: `${tipPos.x}%`, top: `${tipPos.y}%` }}
          role="tooltip"
        >
          <div className="pnl-hotspot-card-accent" aria-hidden />
          <div className="pnl-hotspot-card-inner">
            <div className="pnl-system-title pnl-system-title--card">{item.title}</div>
            <p className="pnl-system-text pnl-system-text--card">{item.text}</p>
          </div>
        </div>
      )}

      <p className="pnl-diagram-hint">Click an element to explore</p>

      {item && (
        <div className="pnl-hotspot-mobile-panel" aria-live="polite">
          <div className="pnl-hotspot-card-accent" aria-hidden />
          <div className="pnl-hotspot-card-inner">
            <div className="pnl-system-title pnl-system-title--card">{item.title}</div>
            <p className="pnl-system-text pnl-system-text--card">{item.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PanelizedSystem() {
  return (
    <section className="pnl-block pnl-block--light">
      <div className="pnl-container">
        <div className="pnl-system-head reveal">
          <span className="pnl-kicker" aria-hidden />
          <h2 className="section-h2 pnl-section-h2">
            Elements of A-Linx panelized system
          </h2>
        </div>

        <div className="pnl-diagram-frame pnl-diagram-frame--interactive">
          <InteractiveDiagram />
        </div>

        <div className="pnl-inclusions reveal">
          <h3 className="pnl-inclusions-title">Typical inclusions not illustrated</h3>
          <div className="pnl-chip-row">
            {INCLUSIONS.map((item) => (
              <span key={item} className="pnl-chip">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PRECISION ──────────────────────────────────── */
function PrecisionSection() {
  return (
    <section className="pnl-block pnl-block--cream">
      <div className="pnl-container">
        <h2 className="section-h2 pnl-section-h2 reveal">
          <span className="pnl-kicker" aria-hidden />
          Precision, economy and a faster path to a watertight superstructure
        </h2>
        <div className="pnl-outcome-grid">
          <div className="pnl-outcome-card reveal">
            <div className="pnl-outcome-title">PRECISION &amp; RELIABILITY</div>
            <p className="pnl-outcome-text">
              The construction industry is already moving toward systems-based operations that shift
              traditional field work into controlled off-site facilities, backed by standardized build
              processes that ensure benchmarked quality standards. A-Linx delivers all the benefits of
              precision, factory-based component assembly.
            </p>
          </div>
          <div className="pnl-outcome-card reveal d1">
            <div className="pnl-outcome-title">MANAGING TOTAL COSTS</div>
            <p className="pnl-outcome-text">
              Value-streamed assembly processes maximize production efficiencies and streamline
              component delivery to the site. Front-loaded planning allows for value engineering and
              for cost-containing strategies to be designed into the entire structure. In every aspect,
              the A-Linx approach drives competitive costing.
            </p>
          </div>
          <div className="pnl-outcome-card reveal d2">
            <div className="pnl-outcome-title">REDUCING ERECTION TIME</div>
            <p className="pnl-outcome-text">
              Pre-fabrication reduces build times on site by 20% compared to traditional methods. It
              significantly reduces weather-related delays allowing you to get to a watertight
              superstructure in previously unthinkable timeframes. Interior finishes can advance at an
              accelerated pace and clients enjoy a shorter timeline to facility opening and occupation.
            </p>
          </div>
        </div>
        <div className="pnl-summary-panel reveal">
          <h3 className="pnl-summary-title">SUMMARY OF BENEFITS TO OFFSITE CONSTRUCTION</h3>
          <SourceList items={OFFSITE_SUMMARY} cols />
        </div>
      </div>
    </section>
  );
}

/* ─── SAVINGS / WEIGHT ───────────────────────────── */
function SavingsSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fills = ref.current?.querySelectorAll<HTMLElement>(".wc-fill");
    if (!fills) return;
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        fills.forEach((f) => { f.style.width = (f.dataset.w ?? "0") + "%"; });
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    <section className="pnl-block pnl-block--light">
      <div className="pnl-container">
        <div className="pnl-savings-head reveal">
          <div className="pnl-savings-intro">
            <span className="pnl-kicker" aria-hidden />
            <h2 className="section-h2 pnl-section-h2">Bottom-line savings that deliver a competitive edge</h2>
            <p className="pnl-deck pnl-deck--wide">
              The A-Linx Light-Gauge Steel system delivers a revolutionary competitive advantage -
              primarily through reduced erection times and a significantly reduced materials cost.
            </p>
          </div>
          <div className="pnl-savings-photo">
            <div className="pnl-media-frame pnl-media-frame--wide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/panelized/panelized-components.webp" alt="Panelized components" />
            </div>
          </div>
        </div>

        <div className="pnl-savings-body">
          <div className="pnl-savings-copy reveal">
            <p className="pnl-deck pnl-deck--wide">
              The reduction in materials usage and the associated cost savings are reflected in the
              finished superstructure weight. Comparison of typical weight by construction method:
            </p>
            <p className="pnl-deck pnl-deck--wide pnl-deck--gap">
              Lighter-weight structures can be erected over less stringently engineered foundations
              and footings, again, resulting in lower overall build costs.
            </p>
            <p className="pnl-deck pnl-deck--wide pnl-deck--gap">
              Other significant savings, as we&apos;ve detailed throughout this site, also arise from:
            </p>
            <SourceList items={SAVINGS_BULLETS} />
            <p className="pnl-deck pnl-deck--wide pnl-deck--gap">
              The bottom line results of these and other factors dramatically validate our claim to
              offering a significant competitive edge as compared to traditional building processes.
            </p>
          </div>
          <div className="pnl-chart-card reveal d1" ref={ref}>
            <div className="pnl-weight-table">
              <div className="pnl-weight-row pnl-weight-row--head">
                <span>METHOD</span>
                <span>LBS / SQ. FT.</span>
              </div>
              {[
                { name: "COMSLAB", val: "55", w: "58", cls: "a", highlight: true },
                { name: "CAST IN PLACE", val: "95", w: "100", cls: "b" },
                { name: "PRECAST*", val: "65", w: "68", cls: "c" },
              ].map((r) => (
                <div key={r.name} className={`pnl-weight-row${r.highlight ? " pnl-weight-row--best" : ""}`}>
                  <span className="pnl-weight-method">{r.name}</span>
                  <span className="pnl-weight-val">{r.val}</span>
                  <div className="wc-track"><div className={`wc-fill ${r.cls}`} data-w={r.w} style={{ width: 0 }} /></div>
                </div>
              ))}
            </div>
            <p className="pnl-chart-note">
              *To achieve sound attenuation comparable to comslab, precast requires 75-90 lbs./sq. ft.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── STATS ──────────────────────────────────────── */
function SavingsStats() {
  const stats = [
    { num: "35%", label: "FASTER SUPERSTRUCTURE BUILD" },
    { num: "20%", label: "SUPERSTRUCTURE COST SAVINGS" },
  ];
  return (
    <div className="pnl-stats-wrap">
      <div className="pnl-stats-banner">
        {stats.map((s, i) => (
          <div key={s.num} className={`pnl-stats-line reveal${DELAY[i]}`}>
            <span className="pnl-stats-num">{s.num}</span>
            <span className="pnl-stats-label">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="pnl-stats-caption reveal">
        Typical A-Linx savings compared to conventional (cast-in-place) construction
      </p>
    </div>
  );
}

export default function PanelizedPage() {
  useScrollReveal();
  return (
    <div className="pnl-page">
      <Hero />
      <StructuralInnovation />
      <FeatureSplit
        title="Watertight and airtight assembly of pre-finished exterior panels"
        body="A-Linx has invested nearly a decade into refining our exterior panel assembly processes, always with the goal of resolving industry-wide challenges of waterproofing, air sealing and fire rating. Our processes now deliver to the highest industry standards."
        image="/images/panelized/prefinished-external-panels.jpg"
        alt="Prefinished external panels"
      />
      <FeatureSplit
        title="Advantages of light-gauge steel superstructures"
        image="/images/panelized/steel-superstructures.webp"
        alt="Light-gauge steel superstructures"
        reverse
      >
        <SourceList items={STEEL_POINTS} />
      </FeatureSplit>
      <FactoryBand />
      <Advantages />
      <PanelizedSystem />
      <PrecisionSection />
      <SavingsSection />
      <SavingsStats />
      <SiteFooter />
    </div>
  );
}
