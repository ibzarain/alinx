"use client";

import SteelCityDefs, { materialFill } from "@/components/SteelCityDefs";
import {
  buildCityDropQueue,
  dropToActive,
  isDropLocked,
  lockDrop,
  placeFinalCity,
  placePrebuiltCity,
  dropsOverlap,
  dropHasSupport,
  type CityDrop,
  type FallingDrop,
} from "@/lib/steel-city-blueprint";
import {
  buildingRows,
  CITY_GRID,
  createEmptyGrid,
  gridDims,
  type ActivePiece,
  type PlacedCell,
} from "@/lib/steel-city-grid";
import { useEffect, useRef } from "react";

const MAX_CONCURRENT = 8;
const SPAWN_GAP_MIN = 70;
const SPAWN_GAP_MAX = 320;

type TetrisVariant = "dark" | "light";

const TUNE: Record<
  TetrisVariant,
  { placed: number; final: number; falling: number; fallMs: number }
> = {
  dark: { placed: 0.58, final: 0.68, falling: 0.86, fallMs: 165 },
  light: { placed: 0.5, final: 0.62, falling: 0.72, fallMs: 175 },
};

function cellRect(col: number, row: number, material: string, opacity: number) {
  const x = col * CITY_GRID;
  const y = row * CITY_GRID;
  return `<rect x="${x}" y="${y}" width="${CITY_GRID}" height="${CITY_GRID}" fill="${materialFill(material)}" opacity="${opacity}" />`;
}

function pieceRects(piece: ActivePiece, opacity: number) {
  return piece.shape
    .map((block, i) => {
      const col = piece.x + block.dx;
      const row = piece.y + block.dy;
      if (row < -2.5) return "";
      const x = col * CITY_GRID;
      const y = row * CITY_GRID;
      return `<rect x="${x}" y="${y}" width="${CITY_GRID}" height="${CITY_GRID}" fill="${materialFill(piece.materials[i])}" opacity="${opacity}" />`;
    })
    .join("");
}

function gridRects(grid: (PlacedCell | null)[][], opacity: number) {
  let html = "";
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const cell = grid[r][c];
      if (cell) html += cellRect(c, r, cell.material, opacity);
    }
  }
  return html;
}

function canSpawn(drop: CityDrop, active: FallingDrop[]): boolean {
  return !active.some(
    (f) =>
      f.piece.y < f.drop.targetY + 4 &&
      dropsOverlap(drop, f.drop)
  );
}

export default function SteelTetrisBackground({
  variant = "dark",
}: {
  variant?: TetrisVariant;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const placedRef = useRef<SVGGElement>(null);
  const streamsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const tune = TUNE[variant];
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const placedLayer = placedRef.current;
    const streamsLayer = streamsRef.current;
    if (!wrap || !svg || !placedLayer || !streamsLayer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let visible = true;
    let cols = 0;
    let rows = 0;
    let buildRows = 0;
    let grid: (PlacedCell | null)[][] = [];
    let queue: CityDrop[] = [];
    let active: FallingDrop[] = [];
    let lastTs = 0;
    let spawnTimer = 0;
    let nextSpawnGap = SPAWN_GAP_MIN + Math.random() * (SPAWN_GAP_MAX - SPAWN_GAP_MIN);
    let complete = false;
    let prevCols = 0;
    let prevRows = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(wrap);

    function renderPlaced(opacity = tune.placed) {
      placedLayer!.innerHTML = gridRects(grid, opacity);
    }

    function renderFalling() {
      let html = "";
      for (const { piece } of active) {
        html += pieceRects(piece, tune.falling);
      }
      streamsLayer!.innerHTML = html;
    }

    function showFinalCity() {
      grid = createEmptyGrid(cols, buildRows);
      placeFinalCity(grid, cols, buildRows);
      active = [];
      queue = [];
      streamsLayer!.innerHTML = "";
      renderPlaced(tune.final);
    }

    function finishCity() {
      complete = true;
      showFinalCity();
      cancelAnimationFrame(raf);
    }

    function resetAndStart() {
      complete = false;
      cancelAnimationFrame(raf);
      lastTs = 0;
      spawnTimer = 0;
      startSequence();
    }

    function startSequence() {
      active = [];
      grid = createEmptyGrid(cols, buildRows);
      placePrebuiltCity(grid, cols, buildRows);
      queue = buildCityDropQueue(cols, buildRows);
      spawnTimer = 0;
      renderPlaced();

      if (reducedMotion || queue.length === 0) {
        finishCity();
        return;
      }

      raf = requestAnimationFrame(tick);
    }

    function trySpawn(dt: number) {
      if (complete || active.length >= MAX_CONCURRENT || queue.length === 0) return;

      spawnTimer += dt;
      if (spawnTimer < nextSpawnGap) return;

      const spawnable = queue.filter(
        (drop) => canSpawn(drop, active) && dropHasSupport(grid, drop)
      );
      if (spawnable.length === 0) return;

      const drop =
        spawnable[Math.floor(Math.random() * spawnable.length)];
      queue.splice(queue.indexOf(drop), 1);
      active.push({
        drop,
        piece: dropToActive(drop, buildRows),
      });
      spawnTimer = 0;
      nextSpawnGap =
        SPAWN_GAP_MIN + Math.random() * (SPAWN_GAP_MAX - SPAWN_GAP_MIN);
    }

    function tickFalling(dt: number) {
      for (const item of active) {
        if (isDropLocked(item.drop, item.piece)) continue;
        item.piece.y += dt / tune.fallMs;
      }

      const locking = active.filter((item) => isDropLocked(item.drop, item.piece));
      if (locking.length > 0) {
        for (const item of locking) {
          lockDrop(grid, item.drop);
        }
        active = active.filter((item) => !isDropLocked(item.drop, item.piece));
        renderPlaced();
      }

      if (queue.length === 0 && active.length === 0) {
        finishCity();
        return;
      }

      renderFalling();
    }

    function tick(ts: number) {
      if (complete) return;
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const dt = lastTs ? Math.min(ts - lastTs, 32) : 0;
      lastTs = ts;

      tickFalling(dt);
      trySpawn(dt);
    }

    function applyLayout(width: number, height: number) {
      if (width < 1 || height < 1) return;

      const dims = gridDims(width, height);
      const sizeChanged = dims.cols !== prevCols || dims.rows !== prevRows;

      cols = dims.cols;
      rows = dims.rows;
      buildRows = buildingRows(rows);

      const svgW = cols * CITY_GRID;
      const svgH = rows * CITY_GRID;
      svg!.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
      svg!.style.width = "100%";
      svg!.style.height = "100%";

      if (sizeChanged) {
        prevCols = cols;
        prevRows = rows;
        resetAndStart();
      }
    }

    const ro = new ResizeObserver(([entry]) => {
      applyLayout(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(wrap);

    const rect = wrap.getBoundingClientRect();
    applyLayout(rect.width, rect.height);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      ro.disconnect();
    };
  }, [variant]);

  return (
    <div ref={wrapRef} className={`steel-tetris-bg steel-tetris-bg--${variant}`} aria-hidden>
      <svg
        ref={svgRef}
        className="steel-tetris-svg"
        preserveAspectRatio="xMinYMin meet"
      >
        <SteelCityDefs />
        <g ref={placedRef} className="steel-city-placed" />
        <g ref={streamsRef} className="steel-city-streams" />
      </svg>
    </div>
  );
}
