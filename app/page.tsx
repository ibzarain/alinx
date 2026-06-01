"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ScrollScrubHero from "@/components/ScrollScrubHero";

/* ─── NAV ─────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const hero = document.getElementById("hero");
      // Hero canvas is sticky and visible until the section fully scrolls off.
      // Keep nav dark while any part of the hero section is still in the viewport.
      const heroShowing = hero
        ? hero.getBoundingClientRect().bottom > 0
        : y < window.innerHeight;
      setOverHero(heroShowing);
      setScrolled(!heroShowing);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);

  const close = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`site-nav${scrolled ? " scrolled" : ""}${overHero ? " nav-over-hero" : ""}`}
      >
        <a href="#" className="nav-logo">
          <Image
            src="/alinx-logo.png"
            alt="A-LINX Building Technologies"
            width={120}
            height={40}
            style={{ width: "auto", height: "40px" }}
            className="nav-logo-img"
            priority
          />
        </a>
        <ul className="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#process">Process</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#team">Team</a></li>
        </ul>
        <a href="tel:2267247219" className="nav-cta">226-724-7219</a>
        <button
          className={`nav-hamburger${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      <nav className={`nav-mobile${mobileOpen ? " open" : ""}`}>
        <a href="#services"    onClick={close}>Services</a>
        <a href="#process"     onClick={close}>Process</a>
        <a href="#projects"    onClick={close}>Projects</a>
        <a href="#team"        onClick={close}>Team</a>
        <a href="tel:2267247219" className="mobile-cta" onClick={close}>226-724-7219</a>
      </nav>
    </>
  );
}

/* ─── STATS ─────────────────────────────────────── */
const STATS = [
  { value: "35",    unit: "%",  desc: "Faster Superstructure Build" },
  { value: "20",    unit: "%",  desc: "Lower Superstructure Cost" },
  { value: "±0.01", unit: "\"", desc: "Frame Height Precision" },
  { value: "50",    unit: "%",  desc: "Overall Schedule Reduction" },
];

function Stats() {
  return (
    <div className="stats-strip">
      {STATS.map((s) => (
        <div key={s.desc} className="stat-cell">
          <div className="stat-num">
            {s.value}<span className="stat-unit">{s.unit}</span>
          </div>
          <div className="stat-desc">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── SERVICES ──────────────────────────────────── */
function Services() {
  return (
    <section id="services" className="section">
      <div className="section-header reveal">
        <div className="label-row">
          <div className="label-line" />
          <span className="label-text">Our Solutions</span>
        </div>
        <h2 className="section-h2">Two Pathways.<br />One Standard.</h2>
        <p className="section-desc">
          From exterior panel systems to fully volumetric modules — A-LINX delivers
          factory precision for every project scale, single ADUs to 20-storey communities.
        </p>
      </div>

      <div className="services-grid">
        {/* Panelized */}
        <div className="svc-card svc-card--panelized reveal">
          <div className="svc-card-bg" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/panelized.jpg"
              alt=""
              className="svc-card-photo"
            />
          </div>
          <div className="svc-card-inner">
          <div className="svc-num">01 / PANELIZED</div>
          <h3 className="svc-h3">Panelized<br />Components</h3>
          <p className="svc-desc">
            Interior and fully-finished exterior structural panels — engineered for
            superstructure completion approximately 35% faster and costs typically 20%
            lower versus conventional methods.
          </p>
          <div className="svc-kpi">
            <span className="kpi-v">35%</span>
            <span className="kpi-l">Faster Completion</span>
          </div>
          <ul className="svc-list">
            <li>Pre-insulated exterior walls with air barrier and multiple finish options</li>
            <li>Floor assemblies: composite decks, hollow-core plank, open web joists</li>
            <li>Prefab load-bearing and wind-bearing structural panels</li>
            <li>Pre-installed windows, doors and mechanical openings</li>
            <li>Structural steel elements, lintels and slab shoring systems</li>
            <li>Complete shop drawings and cast-in-place cores</li>
          </ul>
          </div>
        </div>

        {/* Volumetric */}
        <div className="svc-card svc-card--volumetric reveal d1">
          <div className="svc-card-bg" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/volumetric.jpg?v=3"
              alt=""
              className="svc-card-photo svc-card-photo--zoom"
            />
          </div>
          <div className="svc-card-inner">
          <div className="svc-num">02 / VOLUMETRIC</div>
          <h3 className="svc-h3">Turnkey<br />Modular</h3>
          <p className="svc-desc">
            True volumetric structures via proprietary METALOQ technology — engineered
            to manufacturing-sector tolerances, scalable from single ADUs to 20-storey
            communities.
          </p>
          <div className="svc-kpi">
            <span className="kpi-v">±0.01&quot;</span>
            <span className="kpi-l">Frame Height Precision</span>
          </div>
          <ul className="svc-list">
            <li>Meets National Building Code of Canada across all project types</li>
            <li>Rapid deployment: urban, suburban, rural and remote locations</li>
            <li>Standardized systems enable province-to-province rollout</li>
            <li>In-house design, engineering, fabrication, transport and site build</li>
            <li>Single-source accountability with consistent, predictable timelines</li>
            <li>Flexible layouts and finishes without production delays</li>
          </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PROCESS PLACEHOLDER ──────────────────────── */
function Process() {
  return (
    <section id="process">
      <div className="label-row" style={{ position: "absolute", top: "2rem", left: "6%", zIndex: 1 }}>
        <div className="label-line" />
        <span className="label-text">Structural Components</span>
      </div>
      <div className="process-coming">
        <div className="process-coming-label">Coming Soon</div>
        <h2 className="process-coming-h2">Factory<br />Sequence</h2>
      </div>
    </section>
  );
}

/* ─── TECHNOLOGY ────────────────────────────────── */
function Technology() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fills = chartRef.current?.querySelectorAll<HTMLElement>(".wc-fill");
    if (!fills) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fills.forEach((el) => { el.style.width = (el.dataset.w ?? "0") + "%"; });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(chartRef.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="technology" className="section">
      <div className="tech-layout">
        {/* Left — video placeholder */}
        <div className="tech-placeholder reveal">
          <div className="tech-annot tr">
            <span className="tech-annot-key">Height Precision</span>±0.01&quot;
          </div>
          <div className="tech-annot bl">
            <span className="tech-annot-key">Length Precision</span>±0.03&quot;
          </div>
        </div>

        {/* Right — specs */}
        <div className="reveal d1">
          <div className="label-row">
            <div className="label-line" />
            <span className="label-text">Proprietary Technology</span>
          </div>
          <h2 className="section-h2">
            METALOQ<br />
            <span style={{ fontSize: "0.5em", color: "var(--text2)", fontWeight: 500, letterSpacing: "0.06em" }}>
              System
            </span>
          </h2>
          <p className="section-desc">
            Manufacturing-sector precision applied to building construction. Tolerances
            typically reserved for aerospace and automotive — now standard in every
            A-LINX structure.
          </p>

          <div className="spec-table">
            {[
              ["Frame Height Precision",  "±0.01\""],
              ["Frame Length Precision",  "±0.03\""],
              ["Certification Standard",  "CSA A277-16"],
              ["Maximum Building Height", "20 Storeys"],
              ["Primary Material",        "Light-Gauge Steel"],
              ["QA System",              "Third-Party Audited"],
            ].map(([name, val]) => (
              <div key={name} className="spec-row">
                <span className="spec-name">{name}</span>
                <span className="spec-val">{val}</span>
              </div>
            ))}
          </div>

          <div className="weight-chart" ref={chartRef}>
            <div className="wc-label-row">Floor System Weight (lbs/ft²)</div>
            {[
              { name: "ComSlab (A-LINX)", val: "55", w: "58", cls: "a" },
              { name: "Cast-in-Place",    val: "95", w: "100", cls: "b" },
              { name: "Precast",          val: "65", w: "68",  cls: "c" },
            ].map((row) => (
              <div key={row.name} className="wc-item">
                <div className="wc-top">
                  <span className="wc-name">{row.name}</span>
                  <span className="wc-val">{row.val}</span>
                </div>
                <div className="wc-track">
                  <div className={`wc-fill ${row.cls}`} data-w={row.w} style={{ width: 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── ADVANTAGES ────────────────────────────────── */
const ADVANTAGES = [
  { n: "01", title: "Parallel Workstreams",   text: "Factory fabrication and site preparation run simultaneously — eliminating sequential delays.", icon: (<svg viewBox="0 0 30 30" fill="none"><rect x="1" y="13" width="11" height="15" stroke="#7a9e4a" strokeWidth="1.5"/><rect x="17" y="5" width="11" height="23" stroke="#7a9e4a" strokeWidth="1.5"/><line x1="6" y1="1" x2="6" y2="13" stroke="#7a9e4a" strokeWidth="1" strokeDasharray="2 2"/></svg>) },
  { n: "02", title: "Reduced On-Site Labor",  text: "Fewer specialized trades on-site. Complex work is completed in controlled factory conditions.", icon: (<svg viewBox="0 0 30 30" fill="none"><circle cx="15" cy="10" r="5" stroke="#7a9e4a" strokeWidth="1.5"/><path d="M5 26c0-5 4.5-9 10-9s10 4 10 9" stroke="#7a9e4a" strokeWidth="1.5"/></svg>) },
  { n: "03", title: "Weather-Independent",    text: "Factory fabrication continues regardless of weather — reducing delays across all Canadian climates.", icon: (<svg viewBox="0 0 30 30" fill="none"><path d="M3 18L10 11L16 16L23 8" stroke="#7a9e4a" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 3Q9 7 7 11" stroke="#7a9e4a" strokeWidth="1" opacity="0.5"/></svg>) },
  { n: "04", title: "Single-Source",          text: "One point of contact manages design, engineering, fabrication, transport and site build.", icon: (<svg viewBox="0 0 30 30" fill="none"><rect x="7" y="7" width="16" height="16" stroke="#7a9e4a" strokeWidth="1.5"/><rect x="11" y="11" width="8" height="8" stroke="#c8a84e" strokeWidth="1"/></svg>) },
  { n: "05", title: "Design Flexibility",     text: "Standardized modules configured in countless ways — custom layouts without production delays.", icon: (<svg viewBox="0 0 30 30" fill="none"><rect x="3" y="3" width="10" height="10" stroke="#7a9e4a" strokeWidth="1.5"/><rect x="17" y="3" width="10" height="10" stroke="#7a9e4a" strokeWidth="1.5"/><rect x="3" y="17" width="10" height="10" stroke="#7a9e4a" strokeWidth="1.5"/><rect x="17" y="17" width="10" height="10" stroke="#7a9e4a" strokeWidth="0.75" strokeDasharray="2 2"/></svg>) },
  { n: "06", title: "Fully Integrated",       text: "Every component engineered to work together. In-house team delivers consistent quality at every stage.", icon: (<svg viewBox="0 0 30 30" fill="none"><path d="M15 3L27 9L27 21L15 27L3 21L3 9Z" stroke="#7a9e4a" strokeWidth="1.5"/></svg>) },
  { n: "07", title: "Precision Fabrication",  text: "Controlled conditions with continuous QC — zero tolerance for deviation from specifications.", icon: (<svg viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="10" stroke="#7a9e4a" strokeWidth="1.5"/><path d="M10 15L13 18L20 11" stroke="#7a9e4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  { n: "08", title: "Reduced Waste",          text: "Lean manufacturing and digital fabrication eliminates the overruns common to traditional job sites.", icon: (<svg viewBox="0 0 30 30" fill="none"><path d="M5 24L9 13L15 19L21 9L25 17" stroke="#7a9e4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  { n: "09", title: "Lean Manufacturing",     text: "Just-in-time procurement eliminates site storage requirements and costly material handling.", icon: (<svg viewBox="0 0 30 30" fill="none"><rect x="2" y="9" width="26" height="17" stroke="#7a9e4a" strokeWidth="1.5"/><line x1="2" y1="15" x2="28" y2="15" stroke="#7a9e4a" strokeWidth="0.75"/><line x1="10" y1="9" x2="10" y2="26" stroke="#7a9e4a" strokeWidth="0.75"/></svg>) },
  { n: "10", title: "Lighter Foundations",    text: "Light-gauge steel reduces overall weight — smaller foundation requirements and significant cost savings.", icon: (<svg viewBox="0 0 30 30" fill="none"><path d="M5 26L5 15L25 15L25 26" stroke="#7a9e4a" strokeWidth="1.5"/><path d="M1 15L15 5L29 15" stroke="#7a9e4a" strokeWidth="1.5" strokeLinecap="round"/></svg>) },
  { n: "11", title: "Limited Storage",        text: "Modules arrive ready for immediate installation — ideal for constrained urban sites.", icon: (<svg viewBox="0 0 30 30" fill="none"><rect x="3" y="19" width="24" height="8" stroke="#7a9e4a" strokeWidth="1.5"/><rect x="8" y="13" width="14" height="6" stroke="#7a9e4a" strokeWidth="1.5"/><rect x="12" y="7" width="6" height="6" stroke="#7a9e4a" strokeWidth="1.5"/></svg>) },
  { n: "12", title: "Expedited Erection",     text: "Precision modules crane into place at extraordinary speed — watertight superstructures in record time.", icon: (<svg viewBox="0 0 30 30" fill="none"><line x1="15" y1="27" x2="15" y2="5" stroke="#7a9e4a" strokeWidth="1.5"/><polyline points="7,13 15,5 23,13" stroke="#7a9e4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
];

const DELAY_CLASSES = ["", " d1", " d2", " d3"];

function Advantages() {
  return (
    <section id="advantages" className="section">
      <div className="section-header reveal">
        <div className="label-row">
          <div className="label-line" />
          <span className="label-text">The Modular Advantage</span>
        </div>
        <h2 className="section-h2">12 Reasons Builders<br />Choose A-LINX</h2>
      </div>
      <div className="adv-grid">
        {ADVANTAGES.map((a, i) => (
          <div key={a.n} className={`adv-card reveal${DELAY_CLASSES[i % 4]}`}>
            <div className="adv-num">{a.n}</div>
            <div className="adv-icon">{a.icon}</div>
            <div className="adv-title">{a.title}</div>
            <p className="adv-text">{a.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── STEEL ─────────────────────────────────────── */
function Steel() {
  return (
    <section id="steel" className="section">
      <div className="diag" />
      <div className="steel-layout">
        <div className="reveal">
          <div className="label-row">
            <div className="label-line" />
            <span className="label-text">Material Science</span>
          </div>
          <h2 className="section-h2">Light-Gauge<br />Steel</h2>
          <p className="section-desc">
            The structural backbone of every A-LINX project. Unmatched combination of
            strength, environmental responsibility and long-term durability.
          </p>
          <div className="steel-numbers">
            <div className="steel-num">
              <div className="sn-val">100<span style={{ fontSize: "0.55em", color: "var(--olive)" }}>%</span></div>
              <div className="sn-lbl">Recyclable</div>
            </div>
            <div className="steel-num">
              <div className="sn-val">0</div>
              <div className="sn-lbl">Moisture Expansion</div>
            </div>
            <div className="steel-num">
              <div className="sn-val">55</div>
              <div className="sn-lbl">lbs/ft² (ComSlab)</div>
            </div>
            <div className="steel-num">
              <div className="sn-val">A+</div>
              <div className="sn-lbl">Seismic Rating</div>
            </div>
          </div>
        </div>

        <div className="steel-features reveal d1">
          {[
            ["Highest Strength-to-Weight", "Maximum structural capacity with minimum material weight — enabling taller structures on lighter foundations."],
            ["Dimensionally Stable",        "Zero moisture expansion or contraction. No warping, shrinking or swelling — ever."],
            ["Non-Combustible",             "Steel does not burn. Superior fire resistance meeting and exceeding code requirements across all building classes."],
            ["100% Recyclable",             "Infinitely recyclable without loss of quality. The most environmentally responsible structural material available."],
            ["Seismic & Wind Resistant",    "Engineered for Canada's diverse climate zones — high ductility for exceptional seismic and wind performance."],
            ["Zero Maintenance Aging",      "Immune to rot, mold, insects and warping. Structural integrity maintained across decades of service."],
          ].map(([title, text]) => (
            <div key={title} className="sf">
              <div className="sf-title">{title}</div>
              <p className="sf-text">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PROJECTS ──────────────────────────────────── */
const PROJECTS = [
  { type: "Condominium",           name: "Midrise Urban Residential",    loc: "Toronto, ON · 12 Storeys",     tags: ["Modular", "108 Units"],        n: "01" },
  { type: "Retirement Community",  name: "Seniors Living Complex",       loc: "London, ON · 6 Storeys",       tags: ["Volumetric", "84 Suites"],     n: "02" },
  { type: "Memory Care",           name: "Specialized Care Facility",    loc: "Hamilton, ON · 4 Storeys",     tags: ["Panelized", "Long-Term Care"],  n: "03" },
  { type: "Mixed-Use Residential", name: "Transit-Oriented Development", loc: "Windsor, ON · 9 Storeys",      tags: ["Modular", "Mixed-Use"],        n: "04" },
  { type: "Affordable Housing",    name: "Community Housing Project",    loc: "Mississauga, ON · 7 Storeys",  tags: ["Volumetric", "Municipal"],     n: "05" },
  { type: "Rural Deployment",      name: "Remote-Site Housing",          loc: "Northern Ontario · 3 Storeys", tags: ["Panelized", "Remote"],         n: "06" },
];

function Projects() {
  return (
    <section id="projects" className="section">
      <div className="section-header reveal">
        <div className="label-row">
          <div className="label-line" />
          <span className="label-text">Completed Projects</span>
        </div>
        <h2 className="section-h2">Built Across<br />Ontario &amp; Beyond.</h2>
        <p className="section-desc">
          12 completed projects delivering modular precision for retirement communities,
          condominiums, memory care facilities and mixed-use residential developments.
        </p>
      </div>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div key={p.n} className={`proj-card reveal${DELAY_CLASSES[i % 3]}`} data-n={p.n}>
            <div className="proj-type">{p.type}</div>
            <div className="proj-name">{p.name}</div>
            <div className="proj-loc">{p.loc}</div>
            <div className="proj-tags">
              {p.tags.map((t) => <span key={t} className="proj-tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CERTS ─────────────────────────────────────── */
function Certs() {
  return (
    <div className="certs-strip reveal">
      {[
        "CSA A277 Certified Facility",
        "CSAA277-16 Modular Certification",
        "National Building Code Compliant",
        "Third-Party Audited QMS",
      ].map((c) => (
        <div key={c} className="cert">
          <span className="cert-tick">✓</span>{c}
        </div>
      ))}
    </div>
  );
}

/* ─── TEAM ──────────────────────────────────────── */
const TEAM = [
  { initials: "GG", name: "Greg Geml",       role: "General Manager",     bio: "25+ years in construction & manufacturing. 10+ years modular & offsite focus. Early leader at one of the largest steel modular platforms in the Western Hemisphere." },
  { initials: "DM", name: "Design Manager",  role: "Design & Engineering", bio: "Oversees all architectural and structural design coordination, ensuring modular intent is realized from concept through shop drawings." },
  { initials: "PM", name: "Project Manager", role: "Project Delivery",     bio: "Coordinates timelines, client communication and cross-functional delivery across fabrication, logistics and site erection teams." },
  { initials: "QC", name: "QC Manager",      role: "CSA Quality Control",  bio: "Maintains CSA A277 certification standards and manages the third-party audited quality management system across all production stages." },
];

function Team() {
  return (
    <section id="team" className="section">
      <div className="section-header reveal">
        <div className="label-row">
          <div className="label-line" />
          <span className="label-text">Leadership</span>
        </div>
        <h2 className="section-h2">Decades of<br />Modular Expertise.</h2>
        <p className="section-desc">
          Deep roots in construction, manufacturing and large-scale residential
          development across North America.
        </p>
      </div>
      <div className="team-grid">
        {TEAM.map((m, i) => (
          <div key={m.initials} className={`team-card reveal${DELAY_CLASSES[i]}`}>
            <div className="team-avatar">{m.initials}</div>
            <div className="team-name">{m.name}</div>
            <div className="team-role">{m.role}</div>
            <p className="team-bio">{m.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA ───────────────────────────────────────── */
function CTA() {
  return (
    <section id="cta">
      <div className="cta-inner reveal">
        <div className="cta-eyebrow">Start Your Project</div>
        <h2 className="cta-h2">
          Build Faster.<br /><span>Build Smarter.</span>
        </h2>
        <p className="cta-sub">
          Tell us about your project. Our team will show you how factory-precision
          modular construction transforms your timeline and budget.
        </p>
        <div className="cta-buttons">
          <a href="mailto:connect@alinx.build" className="btn-primary">connect@alinx.build</a>
          <a href="tel:2267247219" className="btn-ghost">226-724-7219</a>
        </div>
        <div className="cta-offices">
          <div className="office">
            <div className="office-type">Head Office</div>
            <div className="office-addr">5175 Concession Road 8<br />Oldcastle (Windsor), ON N0R 1L0</div>
          </div>
          <div className="office">
            <div className="office-type">Cambridge</div>
            <div className="office-addr">375 Boxwood Drive<br />Cambridge, ON N3E 0A7</div>
          </div>
          <div className="office">
            <div className="office-type">Mississauga</div>
            <div className="office-addr">5900 Explorer Drive<br />Mississauga, ON L4W 5L2</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ────────────────────────────────────── */
function Footer() {
  return (
    <footer>
      <div className="footer-brand">A<span>-</span>LINX</div>
      <ul className="footer-links">
        <li><a href="#services">Services</a></li>
        <li><a href="#process">Process</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#team">Team</a></li>
      </ul>
      <div className="footer-copy">© 2025 A-LINX Building Technologies</div>
    </footer>
  );
}

/* ─── SCROLL REVEAL ─────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── PAGE ──────────────────────────────────────── */
export default function Home() {
  useScrollReveal();

  return (
    <>
      <Nav />
      <ScrollScrubHero />
      <Stats />
      <Services />
      <Process />
      <Advantages />
      <Steel />
      <Projects />
      <Certs />
      <Team />
      <CTA />
      <Footer />
    </>
  );
}
