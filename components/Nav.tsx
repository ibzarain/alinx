"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const heroEl =
        document.getElementById("hero") ??
        document.querySelector(".pnl-hero, .inner-hero");
      const heroShowing = heroEl
        ? heroEl.getBoundingClientRect().bottom > 72
        : false;
      setOverHero(heroShowing);
      setScrolled(!heroShowing);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  const close = () => setMobileOpen(false);

  return (
    <>
      <nav className={`site-nav${scrolled ? " scrolled" : ""}${overHero ? " nav-over-hero" : ""}`}>
        <Link href="/" className="nav-logo">
          <Image
            src="/alinx-logo.png"
            alt="A-LINX Building Technologies"
            width={120}
            height={40}
            style={{ width: "auto", height: "40px" }}
            className="nav-logo-img"
            priority
          />
        </Link>
        <ul className="nav-links">
          <li><Link href="/panelized">Panelized</Link></li>
          <li><Link href="/volumetric">Volumetric</Link></li>
          <li><a href="/#projects">Projects</a></li>
          <li><a href="/#team">Team</a></li>
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
        <Link href="/panelized" onClick={close}>Panelized</Link>
        <Link href="/volumetric" onClick={close}>Volumetric</Link>
        <a href="/#projects" onClick={close}>Projects</a>
        <a href="/#team"     onClick={close}>Team</a>
        <a href="tel:2267247219" className="mobile-cta" onClick={close}>226-724-7219</a>
      </nav>
    </>
  );
}
