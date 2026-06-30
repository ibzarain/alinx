"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

const NAV_PROBE_Y = 36;
const NAV_LINE_MS = 400;
const NAV_LINE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

type LineState = { left: number; width: number };

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

type Wave = {
  id: number;
  el: HTMLSpanElement;
  anim: Animation | null;
  phase: "enter" | "exit";
};

function readElState(el: HTMLSpanElement, clip: HTMLSpanElement): LineState {
  const clipWidth = clip.clientWidth;
  if (clipWidth <= 0) return { left: 0, width: 0 };

  const elRect = el.getBoundingClientRect();
  const clipRect = clip.getBoundingClientRect();
  return {
    left: ((elRect.left - clipRect.left) / clipWidth) * 100,
    width: (elRect.width / clipWidth) * 100,
  };
}

function animDistance(from: LineState, to: LineState) {
  return Math.max(
    Math.abs(to.width - from.width),
    Math.abs(to.left - from.left)
  ) / 100;
}

function NavLink({ href, label }: { href: string; label: string }) {
  const clipRef = useRef<HTMLSpanElement>(null);
  const wavesRef = useRef<Wave[]>([]);
  const idRef = useRef(0);

  useLayoutEffect(() => {
    return () => {
      for (const wave of wavesRef.current) {
        wave.anim?.cancel();
        wave.el.remove();
      }
      wavesRef.current = [];
    };
  }, []);

  const removeWave = (wave: Wave) => {
    wave.anim?.cancel();
    wave.el.remove();
    wavesRef.current = wavesRef.current.filter((w) => w.id !== wave.id);
  };

  const runWaveAnim = (
    wave: Wave,
    from: LineState,
    to: LineState,
    onDone?: () => void
  ) => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const distance = animDistance(from, to);
    const duration = reducedMotion ? 0 : NAV_LINE_MS * Math.max(distance, 0.12);

    wave.el.style.left = `${from.left}%`;
    wave.el.style.width = `${from.width}%`;

    if (duration <= 0) {
      wave.el.style.left = `${to.left}%`;
      wave.el.style.width = `${to.width}%`;
      onDone?.();
      return;
    }

    wave.anim?.cancel();
    const anim = wave.el.animate(
      [
        { left: `${from.left}%`, width: `${from.width}%` },
        { left: `${to.left}%`, width: `${to.width}%` },
      ],
      { duration, fill: "forwards", easing: NAV_LINE_EASING }
    );
    wave.anim = anim;
    anim.onfinish = () => {
      wave.el.style.left = `${to.left}%`;
      wave.el.style.width = `${to.width}%`;
      wave.anim = null;
      onDone?.();
    };
  };

  const spawnEnterWave = () => {
    const clip = clipRef.current;
    if (!clip) return;

    const link = clip.parentElement;
    const waveColor = link ? getComputedStyle(link).color : "";

    const el = document.createElement("span");
    el.className = "nav-link-wave";
    el.style.left = "0%";
    el.style.width = "0%";
    if (waveColor) el.style.backgroundColor = waveColor;
    clip.appendChild(el);

    const wave: Wave = { id: ++idRef.current, el, anim: null, phase: "enter" };
    wavesRef.current.push(wave);

    runWaveAnim(wave, { left: 0, width: 0 }, { left: 0, width: 100 });
  };

  const exitWave = (wave: Wave) => {
    if (wave.phase === "exit") return;
    wave.phase = "exit";

    const clip = clipRef.current;
    if (!clip) return;

    if (wave.anim) {
      wave.anim.commitStyles();
      wave.anim.cancel();
      wave.anim = null;
    }

    const from = readElState(wave.el, clip);
    if (from.width <= 0.5) {
      removeWave(wave);
      return;
    }

    runWaveAnim(wave, from, { left: 100, width: from.width }, () =>
      removeWave(wave)
    );
  };

  const onEnter = () => {
    spawnEnterWave();
  };

  const onLeave = () => {
    for (const wave of [...wavesRef.current]) {
      if (wave.phase === "enter") exitWave(wave);
    }
  };

  return (
    <Link
      href={href}
      className="nav-link"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {label}
      <span ref={clipRef} className="nav-link-clip" aria-hidden="true" />
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const update = () => {
      setOverDark(isOverDarkZone());
      setScrolled(window.scrollY > 8);
    };

    update();
    setReady(true);
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
        className={`site-nav${ready ? " nav-ready" : ""}${scrolled ? " scrolled" : ""}${overDark ? " nav-over-dark" : ""}`}
      >
        <Link href="/" className="nav-logo">
          <Image
            src="/alinx-logo.png"
            alt="A-LINX Building Technologies"
            width={120}
            height={40}
            style={{ width: "auto", height: "auto", maxHeight: "40px" }}
            className="nav-logo-img"
            priority
          />
        </Link>
        <ul className="nav-links">
          {NAV_LINKS.map((item) => (
            <li key={item.href}>
              <NavLink href={item.href} label={item.label} />
            </li>
          ))}
        </ul>
        <a href="tel:2267247219" className="nav-cta">
          <span className="btn-green-label">226-724-7219</span>
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
          <span className="btn-green-label">226-724-7219</span>
        </a>
      </nav>
    </>
  );
}
