"use client";

import { useEffect, useState } from "react";
import GregBioModal from "@/components/GregBioModal";
import PageHead from "@/components/PageHead";
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

const TEAM = [
  { name: "Greg Geml", role: "General Manager", photo: "/images/portraits/Greg-Geml.jpg", hasBio: true },
  { name: "Ghantous El Tayar", role: "Design Manager", photo: "/images/portraits/Ghantous-El-Tayar.jpg", elTayar: true },
  { name: "Spyro Georgakopoulos", role: "Project Manager", photo: "/images/portraits/Spyro-Georgakopoulos.jpg" },
  { name: "Dante Ladouceur", role: "Operations Manager (CSA)", photo: "/images/portraits/Dante-Ladouceur.jpg" },
  { name: "Will Wiebe", role: "QC Manager (CSA)", photo: "/images/portraits/Will-Wiebe.jpg" },
  { name: "Ryan Lamarque", role: "Technical Designer", photo: "/images/portraits/Ryan-Lamarque.jpg" },
  { name: "Chris Iorio", role: "Estimator", photo: "/images/portraits/Chris-Iorio.jpg" },
];

export default function AboutPage() {
  const [bioOpen, setBioOpen] = useState(false);
  useScrollReveal();

  return (
    <div className="pnl-page">
      <section className="page-hero-band" data-nav-theme="dark">
        <div className="pnl-container">
          <PageHead title="Meet the Team" theme="dark" />
        </div>
      </section>

      <section id="about-team" className="pnl-block pnl-block--light">
        <div className="pnl-container">
          <div className="team-portrait-grid team-portrait-grid--page">
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
                    onClick={() => setBioOpen(true)}
                    aria-haspopup="dialog"
                  >
                    Read Bio
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <GregBioModal open={bioOpen} onClose={() => setBioOpen(false)} />
      <SiteFooter />
    </div>
  );
}
