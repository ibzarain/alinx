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
          <h1 className="pnl-hero-title">Get in Touch</h1>
        </div>
      </div>
    </section>
  );
}

function ContactBody() {
  return (
    <section id="contact" className="contact-page-body">
      <div className="cta-inner reveal">
        <p className="contact-page-lead">
          <span className="a-linx-word">A-Linx</span> Building Technologies
        </p>
        <div className="cta-contact-lines">
          <a href="tel:2267247219">226-724-7219</a>
          <a href="mailto:connect@alinx.build">connect@alinx.build</a>
        </div>
        <div className="cta-offices">
          <div className="office">
            <div className="office-type">HEAD OFFICE</div>
            <div className="office-addr">
              5175 Concession Road 8,<br />
              Oldcastle (Windsor), ON<br />
              N0R 1L0
            </div>
          </div>
          <div className="office">
            <div className="office-type">SALES OFFICES</div>
            <div className="office-addr">
              375 Boxwood Drive,<br />
              Cambridge, ON,<br />
              N3E 0A7
            </div>
          </div>
          <div className="office">
            <div className="office-addr">
              5900 Explorer Drive,<br />
              Mississauga, ON<br />
              L4W 5L2
            </div>
          </div>
        </div>
        <div className="cta-socials">
          <a
            href="https://www.instagram.com/alinx_buildtech/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="A-Linx on Instagram"
            className="cta-social-link"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icons/Instagram_Glyph_Black.svg" alt="" />
          </a>
          <a
            href="https://www.linkedin.com/company/a-linxbuildtech/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="A-Linx on LinkedIn"
            className="cta-social-link"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icons/InBug-Black.png" alt="" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ContactPage() {
  useScrollReveal();

  return (
    <div className="pnl-page">
      <Nav />
      <Hero />
      <ContactBody />
      <SiteFooter />
    </div>
  );
}
