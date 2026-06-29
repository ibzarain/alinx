import type { ActivePiece, Material, PlacedCell } from "@/lib/steel-city-grid";

/** One floor slab or module that falls as a single piece */
export type CityDrop = {
  targetX: number;
  targetY: number;
  shape: { dx: number; dy: number }[];
  materials: Material[];
};

export type FallingDrop = {
  drop: CityDrop;
  piece: ActivePiece;
};

type FloorPlan = Material[];

/**
 * A-Linx construction phases — left to right mirrors the reference cross-section:
 * finished charcoal → stone → transition → steel frame → sheathing
 */
type FacadePhase =
  | "charcoal"
  | "stone"
  | "transition"
  | "sheathing"
  | "frame";

type BuildingSpec = {
  width: number;
  facade: FacadePhase;
  heightRatio: number;
};

const GAP = 2;

/** Bottom share of each tower already on site before animation */
export const PREBUILT_FRACTION = 1 / 3;

function prebuiltFloorCount(totalFloors: number): number {
  return Math.max(1, Math.floor(totalFloors * PREBUILT_FRACTION));
}

const BUILDING_SPECS: BuildingSpec[] = [
  { width: 4, facade: "charcoal", heightRatio: 0.72 },
  { width: 3, facade: "stone", heightRatio: 0.85 },
  { width: 5, facade: "transition", heightRatio: 0.78 },
  { width: 3, facade: "frame", heightRatio: 1 },
  { width: 4, facade: "sheathing", heightRatio: 0.9 },
];

function fillWidth(width: number, material: Material): Material[] {
  return Array.from({ length: width }, () => material);
}

function edgeWindowRow(
  width: number,
  edge: Material,
  center: Material
): Material[] {
  return Array.from({ length: width }, (_, i) =>
    i === 0 || i === width - 1 ? edge : center
  );
}

/** Finished dark charcoal facade — storefront base, balconies, lit windows */
function charcoalFloor(width: number, level: number): Material[] {
  if (level === 0) {
    return Array.from({ length: width }, (_, i) =>
      i === 0 || i === width - 1 ? "charcoal" : "storefront"
    );
  }
  if (level % 4 === 3) {
    return Array.from({ length: width }, (_, i) => {
      if (i === 0) return "balcony";
      if (i === width - 1) return "charcoal";
      return "window-lit";
    });
  }
  return edgeWindowRow(width, "charcoal", level % 2 === 0 ? "window-lit" : "window");
}

/** Light stone cladding with warm interior glow */
function stoneFloor(width: number, level: number): Material[] {
  if (level === 0) {
    return edgeWindowRow(width, "stone", "storefront");
  }
  if (level % 3 === 2) {
    return Array.from({ length: width }, (_, i) =>
      i === 1 ? "balcony" : i % 2 === 0 ? "stone" : "window-lit"
    );
  }
  return edgeWindowRow(width, "stone", "window-lit");
}

/** Mid-build: sheathing with emerging finished panels */
function transitionFloor(width: number, level: number): Material[] {
  if (level === 0) return fillWidth(width, "foundation");
  if (level < 2) return fillWidth(width, "steel-frame");
  if (level % 3 === 0) {
    return Array.from({ length: width }, (_, i) =>
      i === 0 || i === width - 1 ? "stone" : "sheathing"
    );
  }
  return Array.from({ length: width }, (_, i) =>
    i % 2 === 0 ? "sheathing" : "window"
  );
}

/** Wrapped in lime-green WRB panels */
function sheathingFloor(width: number, level: number): Material[] {
  if (level === 0) return fillWidth(width, "foundation");
  if (level === 1) return fillWidth(width, "steel-frame");
  return Array.from({ length: width }, (_, i) =>
    i % 3 === 1 ? "window" : "sheathing"
  );
}

/** Raw LGS stud frame */
function frameFloor(width: number, _level: number): Material[] {
  return fillWidth(width, "steel-frame");
}

function floorForFacade(
  facade: FacadePhase,
  width: number,
  level: number
): Material[] {
  switch (facade) {
    case "charcoal":
      return charcoalFloor(width, level);
    case "stone":
      return stoneFloor(width, level);
    case "transition":
      return transitionFloor(width, level);
    case "sheathing":
      return sheathingFloor(width, level);
    case "frame":
      return frameFloor(width, level);
  }
}

export function expandBuildingFloors(
  spec: BuildingSpec,
  buildRows: number
): FloorPlan[] {
  const floorCount = Math.min(
    buildRows,
    Math.max(4, Math.round(buildRows * spec.heightRatio))
  );
  const floors: FloorPlan[] = [];

  floors.push(fillWidth(spec.width, "foundation"));

  for (let level = 0; level < floorCount - 2; level++) {
    floors.push(floorForFacade(spec.facade, spec.width, level));
  }

  floors.push(fillWidth(spec.width, "roof"));
  return floors;
}

function floorToDrop(
  originCol: number,
  baseRow: number,
  floorIndex: number,
  floor: Material[]
): CityDrop {
  const targetY = baseRow - floorIndex;
  return {
    targetX: originCol,
    targetY,
    shape: floor.map((_, dx) => ({ dx, dy: 0 })),
    materials: [...floor],
  };
}

function floorToRandomDrops(
  originCol: number,
  baseRow: number,
  floorIndex: number,
  floor: Material[]
): CityDrop[] {
  if (floor.length <= 2) {
    return [floorToDrop(originCol, baseRow, floorIndex, floor)];
  }

  const drops: CityDrop[] = [];
  let x = 0;
  while (x < floor.length) {
    const remaining = floor.length - x;
    const maxChunk = Math.min(3, remaining);
    const chunk =
      remaining <= maxChunk
        ? remaining
        : 1 + Math.floor(Math.random() * maxChunk);
    drops.push(
      floorToDrop(
        originCol + x,
        baseRow,
        floorIndex,
        floor.slice(x, x + chunk)
      )
    );
    x += chunk;
  }
  return drops;
}

function shuffleDrops<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function planToDrops(
  originCol: number,
  baseRow: number,
  floors: FloorPlan[],
  fromFloorIndex = 0
): CityDrop[] {
  const drops: CityDrop[] = [];
  floors.forEach((floor, floorIndex) => {
    if (floorIndex < fromFloorIndex) return;
    const isRoof = floorIndex === floors.length - 1;
    const isGround = floorIndex === 0;
    const modules =
      !isRoof && !isGround && floor.length > 2
        ? floorToRandomDrops(originCol, baseRow, floorIndex, floor)
        : [floorToDrop(originCol, baseRow, floorIndex, floor)];
    drops.push(...modules);
  });
  return drops;
}

function placeFloorsOnGrid(
  grid: (PlacedCell | null)[][],
  originCol: number,
  baseRow: number,
  cols: number,
  floors: FloorPlan[],
  fromFloorIndex: number,
  toFloorIndex: number
) {
  for (let floorIndex = fromFloorIndex; floorIndex < toFloorIndex; floorIndex++) {
    const floor = floors[floorIndex];
    const row = baseRow - floorIndex;
    floor.forEach((material, dx) => {
      const col = originCol + dx;
      if (row >= 0 && row < grid.length && col >= 0 && col < cols) {
        grid[row][col] = { material };
      }
    });
  }
}

export function layoutBuildingOrigins(cols: number) {
  const totalWidth = BUILDING_SPECS.reduce(
    (sum, spec, i) =>
      sum + spec.width + (i < BUILDING_SPECS.length - 1 ? GAP : 0),
    0
  );
  const startCol = Math.max(1, Math.floor((cols - totalWidth) / 2));
  const origins: number[] = [];
  let cursor = startCol;
  for (const spec of BUILDING_SPECS) {
    origins.push(cursor);
    cursor += spec.width + GAP;
  }
  return origins;
}

export function buildCityDropQueue(cols: number, buildRows: number): CityDrop[] {
  const baseRow = buildRows - 1;
  const origins = layoutBuildingOrigins(cols);
  const all: CityDrop[] = [];

  BUILDING_SPECS.forEach((spec, i) => {
    const origin = origins[i];
    if (origin + spec.width > cols) return;
    const floors = expandBuildingFloors(spec, buildRows);
    const prebuilt = prebuiltFloorCount(floors.length);
    all.push(...planToDrops(origin, baseRow, floors, prebuilt));
  });

  return shuffleDrops(all);
}

/** Piece can lock only when the row directly beneath is already built */
export function dropHasSupport(
  grid: (PlacedCell | null)[][],
  drop: CityDrop
): boolean {
  for (const cell of drop.shape) {
    const cx = drop.targetX + cell.dx;
    const cy = drop.targetY + cell.dy;
    const below = cy + 1;
    if (below >= grid.length) continue;
    if (!grid[below][cx]) return false;
  }
  return true;
}

/** Seed the bottom third of every tower before drops begin */
export function placePrebuiltCity(
  grid: (PlacedCell | null)[][],
  cols: number,
  buildRows: number
) {
  const baseRow = buildRows - 1;
  const origins = layoutBuildingOrigins(cols);

  BUILDING_SPECS.forEach((spec, i) => {
    const origin = origins[i];
    if (origin + spec.width > cols) return;
    const floors = expandBuildingFloors(spec, buildRows);
    const prebuilt = prebuiltFloorCount(floors.length);
    placeFloorsOnGrid(grid, origin, baseRow, cols, floors, 0, prebuilt);
  });
}

export function dropToActive(drop: CityDrop, buildRows: number): ActivePiece {
  const fallDistance =
    Math.max(3, Math.min(buildRows, drop.targetY + 2)) +
    Math.random() * 5;
  return {
    shape: drop.shape,
    x: drop.targetX,
    y: drop.targetY - fallDistance,
    materials: drop.materials,
  };
}

export function isDropLocked(drop: CityDrop, piece: ActivePiece): boolean {
  return piece.y >= drop.targetY;
}

export function lockDrop(
  grid: (PlacedCell | null)[][],
  drop: CityDrop
) {
  drop.shape.forEach((cell, i) => {
    const cx = drop.targetX + cell.dx;
    const cy = drop.targetY + cell.dy;
    if (cy >= 0 && cy < grid.length && cx >= 0 && cx < grid[0].length) {
      grid[cy][cx] = { material: drop.materials[i] };
    }
  });
}

export function placeFinalCity(
  grid: (PlacedCell | null)[][],
  cols: number,
  buildRows: number
) {
  const baseRow = buildRows - 1;
  const origins = layoutBuildingOrigins(cols);

  BUILDING_SPECS.forEach((spec, i) => {
    const origin = origins[i];
    if (origin + spec.width > cols) return;
    const floors = expandBuildingFloors(spec, buildRows);
    placeFloorsOnGrid(grid, origin, baseRow, cols, floors, 0, floors.length);
  });
}

export function dropsOverlap(a: CityDrop, b: CityDrop): boolean {
  const aCols = new Set(a.shape.map((c) => a.targetX + c.dx));
  const bCols = new Set(b.shape.map((c) => b.targetX + c.dx));
  for (const col of aCols) {
    if (bCols.has(col)) return true;
  }
  return false;
}
