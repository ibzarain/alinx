"use client";

import { useState } from "react";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/panelized", label: "Panelized" },
  { href: "/volumetric", label: "Volumetric" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
  { href: "/careers", label: "Careers" },
] as const;

const BROCHURES = [
  {
    title: "Corporate Overview",
    alt: "A-Linx Overview Brochure",
    image: "/images/brochures/A-Linx-Overview.webp",
    pdf: "/assets/brochures/A-Linx-Overview.pdf",
  },
  {
    title: "Panelized Construction",
    alt: "A-Linx Panelized Brochure",
    image: "/images/brochures/A-Linx-Panelized-Brochure.webp",
    pdf: "/assets/brochures/A-Linx-Panelized-Brochure.pdf",
  },
];

export default function SiteFooter() {
  const [brochuresOpen, setBrochuresOpen] = useState(false);

  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">A<span>-</span>LINX</div>
        <div className="footer-nav-col">
          <ul className="footer-links">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={`footer-acc-trigger${brochuresOpen ? " is-open" : ""}`}
                onClick={() => setBrochuresOpen((o) => !o)}
                aria-expanded={brochuresOpen}
              >
                Brochures
                <span className="footer-acc-chevron" aria-hidden />
              </button>
            </li>
          </ul>

          <div className={`footer-brochures-panel${brochuresOpen ? " is-open" : ""}`}>
            <div className="footer-brochures-grid">
              {BROCHURES.map((b) => (
                <a
                  key={b.title}
                  href={b.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-brochure-card"
                >
                  <div className="footer-brochure-cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.image} alt={b.alt} loading="lazy" />
                  </div>
                  <span className="footer-brochure-label">{b.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-sustainability">
        <h4 className="footer-sustainability-title">Our Commitment to Sustainability</h4>
        <p className="footer-sustainability-text">
          Environmentally responsible and resource-efficient construction practices are core
          principles of our business, guiding everything we do from planning to design,
          construction, operation, maintenance, fabrication and waste management. Sustainable
          construction is not only ethical but practical. Reducing our overall environmental
          impacts offers immediate and long-term advantages to our clients and the community.
        </p>
      </div>

      <div className="footer-copy">
        © <span className="a-linx-word">A-Linx</span> Building Technologies 2026
      </div>
    </footer>
  );
}
