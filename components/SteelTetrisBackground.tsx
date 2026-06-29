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
/** Shared fall speed — all pieces move at the same rate */
const FALL_MS_PER_ROW = 165;
const PLACED_OPACITY = 0.58;
const FINAL_OPACITY = 0.68;

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

export default function SteelTetrisBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const placedRef = useRef<SVGGElement>(null);
  const streamsRef = useRef<SVGGElement>(null);

  useEffect(() => {
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

    function renderPlaced(opacity = PLACED_OPACITY) {
      placedLayer!.innerHTML = gridRects(grid, opacity);
    }

    function renderFalling() {
      let html = "";
      for (const { piece } of active) {
        html += pieceRects(piece, 0.86);
      }
      streamsLayer!.innerHTML = html;
    }

    function showFinalCity() {
      grid = createEmptyGrid(cols, buildRows);
      placeFinalCity(grid, cols, buildRows);
      active = [];
      queue = [];
      streamsLayer!.innerHTML = "";
      renderPlaced(FINAL_OPACITY);
    }

    function finishCity() {
      complete = true;
      showFinalCity();
      cancelAnimationFrame(raf);
    }

    function startSequence() {
      if (complete) {
        showFinalCity();
        return;
      }

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
        item.piece.y += dt / FALL_MS_PER_ROW;
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

    function layout() {
      const rect = wrap!.getBoundingClientRect();
      const dims = gridDims(rect.width, rect.height);
      const sizeChanged = dims.cols !== prevCols || dims.rows !== prevRows;

      cols = dims.cols;
      rows = dims.rows;
      buildRows = buildingRows(rows);

      const svgW = cols * CITY_GRID;
      const svgH = rows * CITY_GRID;
      svg!.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
      svg!.style.width = `${svgW}px`;
      svg!.style.height = `${svgH}px`;

      if (sizeChanged) {
        prevCols = cols;
        prevRows = rows;
        cancelAnimationFrame(raf);
        startSequence();
      }
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

    layout();

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
    <div ref={wrapRef} className="steel-tetris-bg" aria-hidden>
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
