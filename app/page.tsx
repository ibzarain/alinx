"use client";

import { useEffect } from "react";
import Link from "next/link";
import ScrollExpandKeyBenefits from "@/components/ScrollExpandKeyBenefits";
import ScrollScrubHero from "@/components/ScrollScrubHero";
import SiteFooter from "@/components/SiteFooter";
import SteelTetrisBackground from "@/components/SteelTetrisBackground";

const DELAY = ["", " d1", " d2", " d3"];

const STEEL_PILLARS = [
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
  {
    title: "Faster and predictable",
    points: [
      "Factory production shortens build schedules by thirty to fifty per cent",
      "On site assembly completed in days",
      "Immune to lumber price swings and weather delays",
    ],
  },
];

const STEEL_RESULT = [
  "Faster to build",
  "Stronger and safer",
  "More sustainable",
  "Built for scale in any community",
];

function SourceList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className={`pnl-source-list${dark ? " pnl-source-list--dark" : ""}`}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function Services() {
  return (
    <section id="services" className="pnl-block pnl-block--cream">
      <div className="pnl-container">
        <div className="section-header reveal">
          <h2 className="section-h2">
            Explore two distinctly<br />innovative service divisions
          </h2>
          <p className="section-desc home-intro">
            <span className="a-linx-word">A-Linx</span> is a fully integrated builder of modular
            structures and panelized systems. The market-leading precision of our engineering and
            factory fabrication allow your project to advance with previously unthinkable speed,
            accuracy and economy.
          </p>
        </div>
      </div>

      <div className="services-grid">
        <div className="svc-card svc-card--panelized reveal">
          <div className="svc-card-bg" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/panelized.jpg" alt="" className="svc-card-photo" />
          </div>
          <div className="svc-card-inner">
            <h3 className="svc-h3">Panelized<br />Components</h3>
            <p className="svc-desc">
              <span className="a-linx-word">A-Linx</span> is a comprehensive supplier of
              panelized interior and fully-finished exterior structural panels.
            </p>
            <Link href="/panelized" className="svc-explore-link">
              <span className="btn-green-label">Explore Panelized</span>
            </Link>
          </div>
        </div>

        <div className="svc-card svc-card--volumetric reveal d1">
          <div className="svc-card-bg" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/volumetric.jpg?v=3" alt="" className="svc-card-photo svc-card-photo--zoom" />
          </div>
          <div className="svc-card-inner">
            <h3 className="svc-h3">Turnkey<br />Modular</h3>
            <p className="svc-desc">
              Using Metaloq technology, <span className="a-linx-word">A-Linx</span> delivers
              modular structures built to the world&apos;s tightest tolerances.
              <br />
              Volumetric is finally a practical option.
            </p>
            <Link href="/volumetric" className="svc-explore-link">
              <span className="btn-green-label">Explore Volumetric</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


function LightGaugeSteel() {
  return (
    <section className="pnl-block pnl-block--dark pnl-block--tetris" id="light-gauge-steel">
      <SteelTetrisBackground />
      <div className="pnl-container">
        <h2 className="section-h2 pnl-section-h2 pnl-section-h2--light reveal">
          LIGHT GAUGE STEEL: A FUTURE-PROOF ADVANTAGE
        </h2>

        <div className="key-benefits-grid">
          {STEEL_PILLARS.map((p, i) => (
            <article key={p.title} className={`key-benefit-card reveal${DELAY[i % 2]}`}>
              <div className="key-benefit-card__glass" aria-hidden />
              <div className="key-benefit-card__inner">
                <h3 className="key-benefit-title">{p.title}</h3>
                <SourceList items={p.points} dark />
              </div>
            </article>
          ))}

          <article className="key-benefit-card key-benefit-card--wide reveal d2">
            <div className="key-benefit-card__glass" aria-hidden />
            <div className="key-benefit-card__inner">
              <h3 className="key-benefit-title">
                The Result: a repeatable and adaptable building solution that is:
              </h3>
              <SourceList items={STEEL_RESULT} dark />
            </div>
          </article>
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

function Closing() {
  return (
    <section className="pnl-block pnl-block--light">
      <div className="pnl-container">
        <div className="vol-closing-card reveal">
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
        <div className="vol-closing-card vol-closing-card--spaced reveal d1">
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

export default function Home() {
  useScrollReveal();

  return (
    <>
      <ScrollScrubHero />
      <div className="pnl-page">
        <Services />
        <ScrollExpandKeyBenefits />
        <LightGaugeSteel />
        <Closing />
        <SiteFooter />
      </div>
    </>
  );
}
