"use client";

import { useEffect, useRef } from "react";
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

/* ─── HERO ───────────────────────────────────────── */
function Hero() {
  return (
    <section className="inner-hero inner-hero--panelized">
      <div className="inner-hero-content">
        <Link href="/" className="inner-hero-back">
          <svg viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          A-LINX
        </Link>
        <div className="inner-hero-tag">01 / Panelized Components</div>
        <h1 className="inner-hero-h1">Factory-Built.<br /><em>Field-Fast.</em></h1>
        <p className="inner-hero-sub">
          Pre-finished exterior and interior structural panels shipped ready to install —
          35% faster builds, 20% lower superstructure cost.
        </p>
        <div className="inner-hero-stats">
          <div className="ih-stat"><div className="ih-stat-num">35<span className="ih-stat-unit">%</span></div><div className="ih-stat-label">Faster Build</div></div>
          <div className="ih-stat"><div className="ih-stat-num">20<span className="ih-stat-unit">%</span></div><div className="ih-stat-label">Cost Savings</div></div>
          <div className="ih-stat"><div className="ih-stat-num">±0.01<span className="ih-stat-unit">"</span></div><div className="ih-stat-label">Precision</div></div>
          <div className="ih-stat"><div className="ih-stat-num">CSA</div><div className="ih-stat-label">A277 Certified</div></div>
        </div>
      </div>
    </section>
  );
}

/* ─── SYSTEM ELEMENTS ────────────────────────────── */
const ELEMENTS = [
  { n: "01", title: "Floor Assemblies",         items: ["Composite deck systems", "Hollow-core plank", "Open web steel joists"] },
  { n: "02", title: "Exterior Walls",            items: ["Pre-insulated with air barrier", "EIFS, brick, Hardie finish options", "Pre-installed windows & doors"] },
  { n: "03", title: "Structural Panels",         items: ["Load-bearing wall panels", "Wind-bearing assemblies", "Pre-cut to spec"] },
  { n: "04", title: "Structural Steel",          items: ["Posts, angles, HSS, W-sections", "Factory-cut & fabricated", "Connection hardware included"] },
  { n: "05", title: "Lintels & Openings",        items: ["Window & door lintels pre-set", "Prefab mechanical openings", "Shop drawing coordination"] },
  { n: "06", title: "Slab Shoring",              items: ["Engineered to structural plan", "Integrated with pour schedule", "Rapid deployment systems"] },
];

function Elements() {
  return (
    <section className="steps-section">
      <div className="section-header reveal">
        <div className="label-row"><div className="label-line" /><span className="label-text">System Components</span></div>
        <h2 className="section-h2">Six Elements.<br />One Package.</h2>
      </div>
      <div className="steps-grid">
        {ELEMENTS.map((e) => (
          <div key={e.n} className="step-card reveal">
            <div className="step-num">{e.n}</div>
            <div className="step-title">{e.title}</div>
            <ul className="step-includes" style={{ marginTop: 0, borderTop: "none" }}>
              {e.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── OUTCOMES ───────────────────────────────────── */
function Outcomes() {
  return (
    <section className="benefit-section">
      <div className="section-header reveal">
        <div className="label-row"><div className="label-line" /><span className="label-text">Why Panelized</span></div>
        <h2 className="section-h2">Built-In<br />Advantages.</h2>
      </div>
      <div className="benefit-grid">
        <div className="benefit-card reveal">
          <div className="benefit-title">Precision</div>
          <p className="benefit-text">Factory QC eliminates field variability. Every panel inspected before it ships.</p>
          <div className="benefit-stat">±0.01&quot;<div className="benefit-stat-label">Frame Tolerance</div></div>
        </div>
        <div className="benefit-card reveal d1">
          <div className="benefit-title">Cost Control</div>
          <p className="benefit-text">Front-loaded planning. Value engineering before fabrication — where it's free.</p>
          <div className="benefit-stat">20%<div className="benefit-stat-label">Superstructure Savings</div></div>
        </div>
        <div className="benefit-card reveal d2">
          <div className="benefit-title">Speed</div>
          <p className="benefit-text">Factory runs parallel to site prep. Earlier interior finish. Fewer weather delays.</p>
          <div className="benefit-stat">35%<div className="benefit-stat-label">Faster Schedule</div></div>
        </div>
      </div>
    </section>
  );
}

/* ─── WEIGHT CHART ───────────────────────────────── */
function WeightChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fills = ref.current?.querySelectorAll<HTMLElement>(".wc-fill");
    if (!fills) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { fills.forEach((f) => { f.style.width = (f.dataset.w ?? "0") + "%"; }); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    <section className="weight-section">
      <div className="section-header reveal">
        <div className="label-row"><div className="label-line" /><span className="label-text">Material Science</span></div>
        <h2 className="section-h2">42% Lighter<br />Floor System.</h2>
      </div>
      <div className="weight-layout">
        <div className="reveal">
          <p className="section-desc">ComSlab weighs just <strong>55 lbs/ft²</strong> vs 95 for cast-in-place. Lighter structure = smaller foundations, lower seismic demand, more units on the same footprint.</p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[["100%", "Recyclable steel"], ["0", "Moisture expansion"], ["A+", "Seismic rating"]].map(([v, l]) => (
              <div key={l}><div style={{ fontFamily: "var(--font-barlow,'Barlow Condensed',sans-serif)", fontSize: "1.8rem", fontWeight: 800, color: "var(--olive)", lineHeight: 1 }}>{v}</div><div style={{ fontSize: "0.72rem", color: "var(--text2)", marginTop: "0.2rem" }}>{l}</div></div>
            ))}
          </div>
        </div>
        <div className="weight-chart reveal d1" ref={ref}>
          <div className="wc-label-row">Floor System Weight (lbs/ft²)</div>
          {[
            { name: "ComSlab (A-LINX)", val: "55", w: "58", cls: "a" },
            { name: "Cast-in-Place",    val: "95", w: "100", cls: "b" },
            { name: "Precast",          val: "65", w: "68",  cls: "c" },
          ].map((r) => (
            <div key={r.name} className="wc-item">
              <div className="wc-top"><span className="wc-name">{r.name}</span><span className="wc-val">{r.val}</span></div>
              <div className="wc-track"><div className={`wc-fill ${r.cls}`} data-w={r.w} style={{ width: 0 }} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────── */
function CTA() {
  return (
    <section className="inner-cta">
      <div className="cta-eyebrow">Get Started</div>
      <h2 className="cta-h2">Ready to Build<br /><span>35% Faster?</span></h2>
      <div className="cta-buttons">
        <a href="mailto:connect@alinx.build" className="btn-primary">connect@alinx.build</a>
        <a href="tel:2267247219" className="btn-ghost">226-724-7219</a>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <Link href="/volumetric" className="svc-explore-link" style={{ justifyContent: "center" }}>Also explore Turnkey Modular →</Link>
      </div>
    </section>
  );
}

export default function PanelizedPage() {
  useScrollReveal();
  return (
    <>
      <Nav />
      <Hero />
      <Elements />
      <Outcomes />
      <WeightChart />
      <CTA />
      <SiteFooter />
    </>
  );
}
