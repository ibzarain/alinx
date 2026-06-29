"use client";

import { useEffect } from "react";
import PageHead from "@/components/PageHead";
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

export default function CareersPage() {
  useScrollReveal();

  return (
    <div className="pnl-page">
      <section className="page-hero-band" data-nav-theme="dark">
        <div className="pnl-container">
          <PageHead title="Careers" theme="dark" />
        </div>
      </section>
      <section className="pnl-block pnl-block--light careers-page-body">
        <div className="pnl-container">
          <p className="careers-page-message reveal">Please check back later</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
