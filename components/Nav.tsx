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

function NavLink({ href, label }: { href: string; label: string }) {
  const lineRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef<LineState>({ left: 0, width: 0 });
  const animRef = useRef<Animation | null>(null);
  const segRef = useRef<{ from: LineState; to: LineState }>({
    from: { left: 0, width: 0 },
    to: { left: 0, width: 0 },
  });

  const applyState = (state: LineState) => {
    const line = lineRef.current;
    if (!line) return;
    line.style.left = `${state.left}%`;
    line.style.width = `${state.width}%`;
  };

  const readState = (): LineState => {
    const anim = animRef.current;
    if (anim && anim.playState === "running") {
      const timing = (anim.effect as KeyframeEffect).getComputedTiming();
      const progress = typeof timing.progress === "number" ? timing.progress : 0;
      const { from, to } = segRef.current;
      return {
        left: from.left + (to.left - from.left) * progress,
        width: from.width + (to.width - from.width) * progress,
      };
    }
    return stateRef.current;
  };

  const runAnim = (from: LineState, to: LineState) => {
    const line = lineRef.current;
    if (!line) return;

    animRef.current?.cancel();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const distance =
      Math.max(Math.abs(to.width - from.width), Math.abs(to.left - from.left)) / 100;
    const duration = reducedMotion ? 0 : NAV_LINE_MS * distance;

    if (duration <= 0) {
      stateRef.current = to;
      applyState(to);
      animRef.current = null;
      return;
    }

    segRef.current = { from, to };
    const anim = line.animate(
      [
        { left: `${from.left}%`, width: `${from.width}%` },
        { left: `${to.left}%`, width: `${to.width}%` },
      ],
      { duration, fill: "forwards", easing: NAV_LINE_EASING }
    );
    anim.onfinish = () => {
      if (to.left === 100) {
        const hidden = { left: 0, width: 0 };
        stateRef.current = hidden;
        applyState(hidden);
      } else {
        stateRef.current = to;
      }
      animRef.current = null;
    };
    animRef.current = anim;
  };

  const onEnter = () => {
    const current = readState();
    const from = { left: 0, width: current.width };

    if (current.left > 0) {
      stateRef.current = from;
      applyState(from);
    }

    runAnim(from, { left: 0, width: 100 });
  };

  const onLeave = () => {
    const current = readState();
    if (current.width <= 0) return;

    runAnim(current, { left: 100, width: current.width });
  };

  return (
    <Link
      href={href}
      className="nav-link"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {label}
      <span className="nav-link-clip" aria-hidden="true">
        <span ref={lineRef} className="nav-link-line" />
      </span>
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
