"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_PROBE_Y = 36;

const DARK_NAV_ZONE_SELECTOR = [
  '[data-nav-theme="dark"]',
  "#hero",
  ".stats-strip",
  "#technology",
  ".page-hero-band",
  "footer",
  ".pnl-hero",
  ".inner-hero",
  ".pnl-block--dark",
  ".dark-feature-section",
  ".pnl-band",
  ".pnl-stats-wrap",
].join(",");

const NAV_LINKS = [
  { href: "/panelized", label: "Panelized" },
  { href: "/volumetric", label: "Volumetric" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
] as const;

function zoneCoversNavProbe(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top <= NAV_PROBE_Y && rect.bottom > NAV_PROBE_Y;
}

function isOverDarkZone(): boolean {
  if (
    Array.from(document.querySelectorAll('[data-nav-theme="light"]')).some(
      zoneCoversNavProbe
    )
  ) {
    return false;
  }
  return Array.from(document.querySelectorAll(DARK_NAV_ZONE_SELECTOR)).some(
    zoneCoversNavProbe
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useLayoutEffect(() => {
    document.documentElement.classList.remove("nav-over-dark-initial");

    const update = () => {
      setOverDark(isOverDarkZone());
      setScrolled(window.scrollY > 8);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  const close = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`site-nav${scrolled ? " scrolled" : ""}${overDark ? " nav-over-dark" : ""}`}
      >
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
          {NAV_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <a href="tel:2267247219" className="nav-cta">
          226-724-7219
        </a>
        <button
          className={`nav-hamburger${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <nav className={`nav-mobile${mobileOpen ? " open" : ""}`}>
        {NAV_LINKS.map((item) => (
          <Link key={item.href} href={item.href} onClick={close}>
            {item.label}
          </Link>
        ))}
        <a href="tel:2267247219" className="mobile-cta" onClick={close}>
          226-724-7219
        </a>
      </nav>
    </>
  );
}
