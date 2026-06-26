"use client";

import { useEffect } from "react";
import PageHead from "@/components/PageHead";
import SiteFooter from "@/components/SiteFooter";

const DELAY_CLASSES = ["", " d1", " d2", " d3"];

const PROJECTS = [
  { name: "42 Mill St.", image: "/images/projects/42-Mill-St.jpg", pdf: "/assets/projects/42-Mill-St.pdf" },
  { name: "140 Thomas Condominium", image: "/images/projects/140-Thomas-Condo.jpg", pdf: "/assets/projects/140-Thomas.pdf" },
  { name: "Cambridge Retirement", image: "/images/projects/Cambridge-Retirement.jpg", pdf: "/assets/projects/Cambridge-Retirement.pdf" },
  { name: "Kingsville Condominium", image: "/images/projects/Kingsville-Condo.jpg", pdf: "/assets/projects/Kingsville-Condominium.pdf" },
  { name: "Milton Retirement", image: "/images/projects/Milton-Retirement.jpg", pdf: "/assets/projects/Milton-Retirement.pdf" },
  { name: "Pretty River Retirement", image: "/images/projects/Pretty-River-Retirement.jpg", pdf: "/assets/projects/Pretty-River-Retirement.pdf" },
  { name: "Ressam Gardens Memory Care", image: "/images/projects/Ressam-Gardens.jpg", pdf: "/assets/projects/Ressam-Gardens-Memory-Care.pdf" },
  { name: "Silver Maple Apartments", image: "/images/projects/Silver-Maple.jpg", pdf: "/assets/projects/Silver-Maple-Apartments.pdf" },
  { name: "St. Thomas Retirement", image: "/images/projects/St-Thomas-Retirement.jpg", pdf: "/assets/projects/St-Thomas-Retirement.pdf" },
  { name: "The Hive on Pelissier", image: "/images/projects/The-Hive.jpg", pdf: "/assets/projects/The-Hive-on-Pelissier.pdf" },
  { name: "Union Midrise Condominium", image: "/images/projects/Union-Midrise.jpg", pdf: "/assets/projects/Union-Midrise-Condominium.pdf" },
  { name: "Westview Park Place", image: "/images/projects/Westview-Park.jpg", pdf: "/assets/projects/Westview-Park-Place.pdf" },
];

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

export default function ProjectsPage() {
  useScrollReveal();

  return (
    <div className="pnl-page">
      <section className="page-hero-band" data-nav-theme="dark">
        <div className="pnl-container">
          <PageHead title="Projects" theme="dark" />
        </div>
      </section>
      <section id="projects-grid" className="pnl-block pnl-block--light">
        <div className="pnl-container">
          <div className="projects-photo-grid projects-photo-grid--page">
            {PROJECTS.map((p, i) => (
              <a
                key={p.name}
                href={p.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className={`proj-photo-card reveal${DELAY_CLASSES[i % 4]}`}
              >
                <div className="proj-photo-wrap">
                  <div className="proj-photo-crop">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} loading="lazy" />
                  </div>
                  <span className="proj-photo-pdf" aria-hidden>PDF</span>
                </div>
                <div className="proj-photo-name">{p.name}</div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
