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
          <h1 className="pnl-hero-title">Careers</h1>
        </div>
      </div>
    </section>
  );
}

export default function CareersPage() {
  useScrollReveal();

  return (
    <div className="pnl-page">
      <Nav />
      <Hero />
      <section className="pnl-block pnl-block--light careers-page-body">
        <div className="pnl-container">
          <p className="careers-page-message reveal">Please check back later</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
