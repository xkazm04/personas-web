import type { ReactNode } from "react";

/**
 * The one entry point for hand-built SVG scenes: a fixed viewBox that fills its
 * parent, hidden from assistive tech unless a `title` is given. Fills inside a scene
 * come from `@/lib/brand-theme` (`BRAND_VAR`, `tint`) via `style`, and text from
 * `<Label>`, so theming and translation hold without per-scene discipline.
 *
 * Escape hatch: a scene that needs something the kernel does not model can still
 * render its own children freely; this only fixes the frame.
 */
export function Scene({
  width,
  height,
  title,
  children,
}: {
  width: number;
  height: number;
  /** Already-translated accessible name. Omit for purely decorative art. */
  title?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {children}
    </svg>
  );
}

/** Stop of a brand gradient: colour is a CSS variable, so it re-themes. */
export function brandStop(color: string, opacity: number) {
  return { stopColor: color, stopOpacity: opacity } as const;
}
