"use client";

import SteelCityDefs, { materialFill } from "@/components/SteelCityDefs";
import { CITY_GRID, gridDims, type Material } from "@/lib/steel-city-grid";
import { useEffect, useRef } from "react";

type BeltItem = {
  x: number;
  w: number;
  h: number;
  materials: Material[][];
  belt: number;
};

const BELT_SPEED = 0.00011;
const SPAWN_GAP = 3.2;
const BELT_COUNT = 2;

const PANEL_TEMPLATES: { w: number; h: number; materials: Material[][] }[] = [
  {
    w: 4,
    h: 2,
    materials: [
      ["steel-frame", "steel-frame", "window", "steel-frame"],
      ["steel-frame", "sheathing", "sheathing", "steel-frame"],
    ],
  },
  {
    w: 3,
    h: 2,
    materials: [
      ["sheathing", "window-lit", "sheathing"],
      ["sheathing", "sheathing", "sheathing"],
    ],
  },
  {
    w: 5,
    h: 1,
    materials: [["charcoal", "window", "window-lit", "window", "charcoal"]],
  },
  {
    w: 3,
    h: 3,
    materials: [
      ["stone", "window-lit", "stone"],
      ["stone", "window", "stone"],
      ["foundation", "foundation", "foundation"],
    ],
  },
  {
    w: 4,
    h: 2,
    materials: [
      ["steel-frame", "steel-frame", "steel-frame", "steel-frame"],
      ["sheathing", "sheathing", "sheathing", "sheathing"],
    ],
  },
];

function beltBaseRow(belt: number, rows: number) {
  return rows - 2 - belt * 4;
}

function panelRects(item: BeltItem, rows: number, opacity: number) {
  const baseY = beltBaseRow(item.belt, rows);
  let html = "";
  for (let r = 0; r < item.h; r++) {
    for (let c = 0; c < item.w; c++) {
      const col = item.x + c;
      const row = baseY - item.h + r;
      const x = col * CITY_GRID;
      const y = row * CITY_GRID;
      html += `<rect x="${x}" y="${y}" width="${CITY_GRID}" height="${CITY_GRID}" fill="${materialFill(item.materials[r][c])}" opacity="${opacity}" />`;
    }
  }
  return html;
}

function beltMarkup(cols: number, belt: number, rows: number, tickOffset: number) {
  const y = beltBaseRow(belt, rows) * CITY_GRID;
  const h = CITY_GRID * 0.35;
  let html = `<rect x="0" y="${y}" width="${cols * CITY_GRID}" height="${h}" fill="rgba(20,30,18,0.55)" />`;
  for (let c = -1; c <= cols; c++) {
    const x = c * CITY_GRID + (tickOffset % CITY_GRID);
    html += `<rect x="${x}" y="${y + h * 0.25}" width="${CITY_GRID * 0.12}" height="${h * 0.5}" fill="rgba(122,158,74,0.35)" rx="1" />`;
  }
  return html;
}

export default function SteelConveyorBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const beltsRef = useRef<SVGGElement>(null);
  const panelsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const beltsLayer = beltsRef.current;
    const panelsLayer = panelsRef.current;
    if (!wrap || !svg || !beltsLayer || !panelsLayer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let visible = true;
    let cols = 0;
    let rows = 0;
    let items: BeltItem[] = [];
    let tickOffset = 0;
    let lastTs = 0;
    let spawnTimers = [0, 0];
    let prevCols = 0;
    let prevRows = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(wrap);

    function spawnOnBelt(belt: number) {
      const template =
        PANEL_TEMPLATES[Math.floor(Math.random() * PANEL_TEMPLATES.length)];
      const rightmost = items
        .filter((i) => i.belt === belt)
        .reduce((max, i) => Math.max(max, i.x + i.w), -SPAWN_GAP);
      items.push({
        x: Math.min(-template.w - 1, rightmost + SPAWN_GAP * (0.6 + Math.random() * 0.5)),
        w: template.w,
        h: template.h,
        materials: template.materials,
        belt,
      });
    }

    function reset() {
      items = [];
      spawnTimers = [0, 0];
      for (let b = 0; b < BELT_COUNT; b++) {
        spawnOnBelt(b);
        spawnOnBelt(b);
      }
      render();
    }

    function render() {
      let beltsHtml = "";
      for (let b = 0; b < BELT_COUNT; b++) {
        beltsHtml += beltMarkup(cols, b, rows, tickOffset);
      }
      beltsLayer!.innerHTML = beltsHtml;

      let panelsHtml = "";
      for (const item of items) {
        panelsHtml += panelRects(item, rows, 0.72);
      }
      panelsLayer!.innerHTML = panelsHtml;
    }

    function layout() {
      const rect = wrap!.getBoundingClientRect();
      const dims = gridDims(rect.width, rect.height);
      const sizeChanged = dims.cols !== prevCols || dims.rows !== prevRows;

      cols = dims.cols;
      rows = dims.rows;

      const svgW = cols * CITY_GRID;
      const svgH = rows * CITY_GRID;
      svg!.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
      svg!.style.width = `${svgW}px`;
      svg!.style.height = `${svgH}px`;

      if (sizeChanged) {
        prevCols = cols;
        prevRows = rows;
        reset();
      }
    }

    function tick(ts: number) {
      raf = requestAnimationFrame(tick);
      if (!visible || reducedMotion) return;

      const dt = lastTs ? Math.min(ts - lastTs, 32) : 0;
      lastTs = ts;

      tickOffset += dt * 0.15;

      for (let b = 0; b < BELT_COUNT; b++) {
        spawnTimers[b] += dt;
        const beltItems = items.filter((i) => i.belt === b);
        const trailing = beltItems.reduce((max, i) => Math.max(max, i.x + i.w), -999);
        if (trailing < cols * 0.35 && spawnTimers[b] > 900 + b * 400) {
          spawnOnBelt(b);
          spawnTimers[b] = 0;
        }
      }

      items = items
        .map((item) => ({ ...item, x: item.x + dt * BELT_SPEED * cols }))
        .filter((item) => item.x < cols + item.w + 2);

      render();
    }

    layout();
    reset();

    if (!reducedMotion) {
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      lastTs = 0;
      layout();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={wrapRef} className="steel-conveyor-bg" aria-hidden>
      <svg
        ref={svgRef}
        className="steel-conveyor-svg"
        preserveAspectRatio="xMinYMin meet"
      >
        <SteelCityDefs />
        <g ref={beltsRef} className="steel-conveyor-belts" />
        <g ref={panelsRef} className="steel-conveyor-panels" />
      </svg>
    </div>
  );
}
