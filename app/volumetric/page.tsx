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

/* ─── HERO ───────────────────────────────────────── */
function Hero() {
  return (
    <section className="inner-hero inner-hero--volumetric">
      <div className="inner-hero-content">
        <Link href="/" className="inner-hero-back">
          <svg viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          A-LINX
        </Link>
        <div className="inner-hero-tag">02 / Turnkey Modular</div>
        <h1 className="inner-hero-h1">Precision at<br /><em>Every Storey.</em></h1>
        <p className="inner-hero-sub">
          Full volumetric modules built on METALOQ frames — laser-cut, press-braked to
          manufacturing tolerances. Single ADUs to 20-storey communities.
        </p>
        <div className="inner-hero-stats">
          <div className="ih-stat"><div className="ih-stat-num">±0.01<span className="ih-stat-unit">"</span></div><div className="ih-stat-label">Height Tolerance</div></div>
          <div className="ih-stat"><div className="ih-stat-num">±0.03<span className="ih-stat-unit">"</span></div><div className="ih-stat-label">Length Tolerance</div></div>
          <div className="ih-stat"><div className="ih-stat-num">20</div><div className="ih-stat-label">Max Storeys</div></div>
          <div className="ih-stat"><div className="ih-stat-num">CSA</div><div className="ih-stat-label">A277 Certified</div></div>
        </div>
      </div>
    </section>
  );
}

/* ─── METALOQ ────────────────────────────────────── */
function Metaloq() {
  return (
    <section className="dark-feature-section">
      <div className="metaloq-layout reveal">
        {/* Left — spec grid + table */}
        <div>
          <div className="label-row"><div className="label-line" /><span className="label-text" style={{ color: "var(--olive)" }}>Proprietary Technology</span></div>
          <h2 className="section-h2" style={{ color: "#d4ecb8" }}>METALOQ<br /><span style={{ fontSize: "0.5em", color: "rgba(192,224,152,0.5)", fontWeight: 500 }}>Frame System</span></h2>

          <div className="metaloq-spec-grid" style={{ marginTop: "2rem" }}>
            {[["±0.01\"","Height Tolerance"],["±0.03\"","Length Tolerance"],["CSA A277","Certification"],["20 Storeys","Max Height"]].map(([v, l]) => (
              <div key={l} className="ms-cell"><div className="ms-val">{v}</div><div className="ms-label">{l}</div></div>
            ))}
          </div>

          <div className="metaloq-spec-table spec-table" style={{ marginTop: "1px" }}>
            {[
              ["Fabrication",   "Laser cutting + press braking"],
              ["Material",      "Light-gauge steel"],
              ["QA",            "Third-party audited"],
              ["Deployment",    "ADU to 20-storey community"],
            ].map(([n, v]) => (
              <div key={n} className="spec-row">
                <span className="spec-name">{n}</span>
                <span className="spec-val" style={{ color: "#8dc87a" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — what it enables */}
        <div className="reveal d1">
          <div className="label-row"><div className="label-line" /><span className="label-text" style={{ color: "var(--olive)" }}>What It Enables</span></div>
          <div className="metaloq-features">
            {[
              ["Flush Stacking",           "Every module lands exactly right — no shimming, no adjustment."],
              ["Predictable Waterproofing","Precise geometry means sealants and membranes perform as designed."],
              ["Speed on Site",            "Perfect factory geometry = placement, not correction. Erection in days."],
              ["Scalable Systems",         "Standardized frames roll out province-to-province with consistent quality."],
            ].map(([t, d]) => (
              <div key={t}>
                <div style={{ fontFamily: "var(--font-barlow,'Barlow Condensed',sans-serif)", fontWeight: 700, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#d4ecb8", marginBottom: "0.2rem" }}>{t}</div>
                <div className="mf-item">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── USE CASES ──────────────────────────────────── */
const CASES = [
  { n:"01", title:"Multi-Family\nResidential" },
  { n:"02", title:"Retirement\nCommunities" },
  { n:"03", title:"Student\nHousing" },
  { n:"04", title:"Hotels &\nHospitality" },
  { n:"05", title:"Medical &\nHealthcare" },
  { n:"06", title:"Affordable\nHousing" },
  { n:"07", title:"Correctional\nFacilities" },
  { n:"08", title:"Institutional\n& Civic" },
];

function UseCases() {
  return (
    <section className="dark-feature-section" style={{ paddingTop: 0 }}>
      <div className="section-header reveal">
        <div className="label-row"><div className="label-line" /><span className="label-text" style={{ color: "var(--olive)" }}>Applications</span></div>
        <h2 className="section-h2" style={{ color: "#d4ecb8" }}>Built for<br />Any Program.</h2>
      </div>
      <div className="use-case-grid">
        {CASES.map((c) => (
          <div key={c.n} className="use-case-card reveal">
            <div className="uc-num">{c.n}</div>
            <div className="uc-title" style={{ whiteSpace: "pre-line" }}>{c.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── STEEL ADVANTAGES ───────────────────────────── */
function Steel() {
  return (
    <section className="dark-feature-section" style={{ paddingTop: 0 }}>
      <div className="section-header reveal">
        <div className="label-row"><div className="label-line" /><span className="label-text" style={{ color: "var(--olive)" }}>Light-Gauge Steel</span></div>
        <h2 className="section-h2" style={{ color: "#d4ecb8" }}>The Right<br />Material.</h2>
      </div>
      <div className="steel-adv-grid">
        {[
          { n:"01", t:"Stronger & Safer",    d:"3–5× strength-to-weight vs wood. Non-combustible. Engineered for transport, seismic and wind loads.", b:["Handles crane lift stresses","Exceeds wind/seismic code","Won't burn"] },
          { n:"02", t:"Sustainable",          d:"100% recyclable, minimal waste. Lighter loads mean smaller foundations and lower transport emissions.", b:["Infinitely recyclable","Minimal jobsite waste","Smaller foundations"] },
          { n:"03", t:"Durable",              d:"No rot, mold, termites, shrinkage or warping. Structural integrity maintained across decades.", b:["Immune to moisture damage","Dimensionally stable always","Zero maintenance required"] },
          { n:"04", t:"Faster & Predictable", d:"30–50% shorter schedules. On-site erection in days. Fixed cost — immune to lumber swings.", b:["30–50% faster build","Erection in days, not weeks","Price locked at contract"] },
        ].map((s) => (
          <div key={s.n} className="steel-adv-card reveal">
            <div className="sa-num">{s.n}</div>
            <div className="sa-title">{s.t}</div>
            <p className="sa-text">{s.d}</p>
            <ul className="sa-bullets">{s.b.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CERTS ──────────────────────────────────────── */
function Certs() {
  return (
    <div className="inner-certs reveal">
      {["CSA A277 Certified Facility","National Building Code Compliant","Third-Party Audited QMS","CSA A277-16 Modular Certification"].map((c) => (
        <div key={c} className="cert"><span className="cert-tick">✓</span>{c}</div>
      ))}
    </div>
  );
}

/* ─── CTA ────────────────────────────────────────── */
function CTA() {
  return (
    <section className="inner-cta">
      <div className="cta-eyebrow">Get Started</div>
      <h2 className="cta-h2">Build Higher.<br /><span>Build Faster.</span></h2>
      <div className="cta-buttons">
        <a href="mailto:connect@alinx.build" className="btn-primary">connect@alinx.build</a>
        <a href="tel:2267247219" className="btn-ghost">226-724-7219</a>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <Link href="/panelized" className="svc-explore-link" style={{ justifyContent: "center" }}>Also explore Panelized Components →</Link>
      </div>
    </section>
  );
}

export default function VolumetricPage() {
  useScrollReveal();
  return (
    <>
      <Nav />
      <Hero />
      <Metaloq />
      <UseCases />
      <Steel />
      <Certs />
      <CTA />
      <SiteFooter />
    </>
  );
}
