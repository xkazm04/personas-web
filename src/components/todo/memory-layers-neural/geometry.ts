import type { Category } from "../memoryShared";

export const HUB_SIZE = 560;
export const HUB_CX = HUB_SIZE / 2;
export const HUB_CY = HUB_SIZE / 2;
export const HUB_RADIUS = 46;
export const ARM_OUTER = 230;
export const NODE_RADIUS = 10;

/** Each category is an arm pointing NW / NE / SW / SE so they don't overlap header */
export const ARM_ANGLES: Record<Category, number> = {
  learning: -135,
  preference: -45,
  technical: 135,
  constraint: 45,
};

export function angleToXY(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: HUB_CX + Math.cos(rad) * r,
    y: HUB_CY + Math.sin(rad) * r,
  };
}
