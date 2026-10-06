import type { CSSProperties } from "react";

/** Percent placement of a design-unit box inside the art (`W` x `H` units). */
export const place =
  ({ W, H }: { W: number; H: number }) =>
  (b: { x: number; y: number; w?: number; h?: number }): CSSProperties => ({
    left: `${(b.x / W) * 100}%`,
    top: `${(b.y / H) * 100}%`,
    width: b.w === undefined ? undefined : `${(b.w / W) * 100}%`,
    height: b.h === undefined ? undefined : `${(b.h / H) * 100}%`,
  });
