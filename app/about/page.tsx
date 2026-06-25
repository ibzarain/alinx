"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

const DELAY_CLASSES = ["", " d1", " d2", " d3"];

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

const GREG_BIO = {
  paragraphs: [
    "Greg is a construction and modular manufacturing professional with over 25 years of experience, including 10+ years focused on modular and offsite construction. He has a strong background in delivering large-scale projects across residential, hospitality, care, and industrial sectors, with a focus on integrating manufacturing and construction processes.",
    "His extensive experience in modular manufacturing operations includes early involvement in the development of one of the largest steel modular manufacturing platforms in the Western Hemisphere. He contributed to product design and system development during the establishment of that operation, with a focus on aligning structural systems and building components with scalable factory production.",
    "His experience in modular project delivery includes",
    "Greg also brings a practical, operations-focused perspective that is grounded in both construction delivery and factory-based manufacturing, supporting the implementation of scalable modular building programs.",
  ],
  bullets: [
    "coordination of design, manufacturing, and site execution",
    "managing production planning, installation sequencing, and constructability",
    "providing comprehensive support for efficient and predictable outcomes across a range of building types.",
    "CSAA277-16 modular certification, including implementation, compliance, and operational oversight of certified manufacturing facilities",
    "familiarity with regulatory requirements, inspection processes, and quality control systems required to maintain compliant modular production environments.",
  ],
};

const TEAM = [
  { name: "Greg Geml", role: "General Manager", photo: "/images/portraits/Greg-Geml.jpg", hasBio: true },
  { name: "Ghantous El Tayar", role: "Design Manager", photo: "/images/portraits/Ghantous-El-Tayar.jpg", elTayar: true },
  { name: "Spyro Georgakopoulos", role: "Project Manager", photo: "/images/portraits/Spyro-Georgakopoulos.jpg" },
  { name: "Dante Ladouceur", role: "Operations Manager (CSA)", photo: "/images/portraits/Dante-Ladouceur.jpg" },
  { name: "Will Wiebe", role: "QC Manager (CSA)", photo: "/images/portraits/Will-Wiebe.jpg" },
  { name: "Ryan Lamarque", role: "Technical Designer", photo: "/images/portraits/Ryan-Lamarque.jpg" },
  { name: "Chris Iorio", role: "Estimator", photo: "/images/portraits/Chris-Iorio.jpg" },
];

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
          <h1 className="pnl-hero-title">About us</h1>
        </div>
      </div>
      <a href="#about-us" className="pnl-scroll-cue" aria-label="Scroll to explore">
        <span className="pnl-scroll-cue-line" />
      </a>
    </section>
  );
}

function AboutCopy() {
  return (
    <section id="about-us" className="pnl-block pnl-block--light">
      <div className="pnl-container">
        <div className="home-about-copy reveal">
          <p>
            <span className="a-linx-word">A-Linx</span> is a fully integrated builder of modular
            structures and panelized systems. The market-leading precision of our engineering and
            factory fabrication allow your project to advance with previously unthinkable speed,
            accuracy and economy.
          </p>
          <p>
            Alinx operates as a fully certified CSA A277 facility, demonstrating our commitment to
            the highest standards of quality, consistency, and compliance in prefabricated
            construction. This certification ensures that all components manufactured in our
            controlled environment meet rigorous building code requirements through a third-party
            audited quality management system. For our clients, this means greater confidence in
            product performance, improved construction efficiency, and streamlined approvals on
            every project.
          </p>
        </div>
      </div>
    </section>
  );
}

function Team() {
  const [bioOpen, setBioOpen] = useState(false);

  return (
    <section id="team" className="section">
      <div className="section-header reveal">
        <h2 className="section-h2">Meet the Team</h2>
      </div>
      <div className="team-portrait-grid">
        {TEAM.map((m, i) => (
          <div key={m.name} className={`team-portrait-card reveal${DELAY_CLASSES[i % 4]}`}>
            <div className="team-portrait-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.photo} alt={m.name} loading="lazy" />
            </div>
            <div className="team-portrait-name">
              {m.elTayar ? (
                <>Ghantous <span className="a-linx-word">El Tayar</span></>
              ) : (
                m.name
              )}
            </div>
            <div className="team-portrait-role">{m.role}</div>
            {m.hasBio && (
              <button
                type="button"
                className="team-read-bio"
                onClick={() => setBioOpen((o) => !o)}
                aria-expanded={bioOpen}
              >
                Read Bio
              </button>
            )}
          </div>
        ))}
      </div>

      {bioOpen && (
        <div className="team-bio-panel reveal in" id="greg-bio">
          <h3 className="team-bio-title">
            Greg Geml
            <br />
            General Manager
          </h3>
          <p>{GREG_BIO.paragraphs[0]}</p>
          <p>{GREG_BIO.paragraphs[1]}</p>
          <p>{GREG_BIO.paragraphs[2]}</p>
          <ul>
            {GREG_BIO.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{GREG_BIO.paragraphs[3]}</p>
        </div>
      )}
    </section>
  );
}

export default function AboutPage() {
  useScrollReveal();

  return (
    <div className="pnl-page">
      <Hero />
      <AboutCopy />
      <Team />
      <SiteFooter />
    </div>
  );
}
