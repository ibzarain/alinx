/** Matches `.pnl-block--dark` background grid in globals.css */
export const CITY_GRID = 56;

export const ROAD_ROWS = 0;

/** A-Linx panelized construction block types */
export type Material =
  | "steel-frame"
  | "sheathing"
  | "charcoal"
  | "stone"
  | "window"
  | "window-lit"
  | "balcony"
  | "storefront"
  | "foundation"
  | "roof";

export type PlacedCell = { material: Material };

export type ActivePiece = {
  shape: { dx: number; dy: number }[];
  x: number;
  y: number;
  materials: Material[];
};

export function gridDims(width: number, height: number) {
  const cols = Math.max(8, Math.ceil(width / CITY_GRID));
  const rows = Math.max(10, Math.ceil(height / CITY_GRID));
  return { cols, rows };
}

export function buildingRows(rows: number) {
  return Math.max(1, rows - ROAD_ROWS);
}

export function createEmptyGrid(cols: number, buildRows: number) {
  return Array.from({ length: buildRows }, () =>
    Array.from({ length: cols }, (): PlacedCell | null => null)
  );
}
