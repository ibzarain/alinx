import { easeInOut } from "./ease";

export type ScrollTransition = {
  fromIndex: number;
  toIndex: number;
  /** Eased blend for the incoming step (0 = from only, 1 = to only). */
  blend: number;
};

/**
 * Map overall scroll progress (0–1) to one of `stepCount - 1` transitions.
 * Each transition uses ease-in-out on its local segment.
 */
export function mapScrollToTransition(
  progress: number,
  stepCount: number
): ScrollTransition {
  const steps = Math.max(2, stepCount);
  const segments = steps - 1;
  const p = Math.min(1, Math.max(0, progress));
  const scaled = p * segments;
  const fromIndex = Math.min(Math.floor(scaled), segments - 1);
  const local = scaled - fromIndex;

  return {
    fromIndex,
    toIndex: fromIndex + 1,
    blend: easeInOut(local),
  };
}
