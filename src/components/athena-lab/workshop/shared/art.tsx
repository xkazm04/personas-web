"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";

/**
 * The aspect-locked art box every workshop variant draws in.
 *
 * One coordinate system for everything: viewBox units. The SVG layer reads
 * them natively (uniform scale - no stretched strokes, so `pathLength` draws
 * are exact), and the HTML layer reads them through `frame(w, h)` as percent
 * positions and container-relative font sizes, so type grows with the art on
 * a big monitor instead of floating small in it.
 *
 * On the desktop stage the box is `data-stage-art`: as wide as the stage
 * allows but never taller than the slot (stage.css, `--art-ar`). Below the
 * stage it is simply full width at its own aspect ratio - variants hand in a
 * portrait geometry there.
 */
export function ArtBox({
  w,
  h,
  label,
  className = "",
  measureRef,
  children,
}: {
  w: number;
  h: number;
  label: string;
  className?: string;
  /** From `useStretch`: lets the variant measure the slot this box sits in. */
  measureRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div
      ref={measureRef}
      data-stage-art
      role="group"
      aria-label={label}
      className={`relative mx-auto w-full ${className}`}
      style={{ "--art-ar": w / h } as CSSProperties}
    >
      <div className="relative w-full [container-type:inline-size]" style={{ aspectRatio: `${w} / ${h}` }}>
        {children}
      </div>
    </div>
  );
}

/** Position + type helpers for an art box of `w` x `h` viewBox units. */
export function frame(w: number, h: number) {
  const px = (v: number) => `${(v / w) * 100}%`;
  const py = (v: number) => `${(v / h) * 100}%`;
  return {
    /** An absolute box (top-left anchored) in viewBox units. */
    box: (x: number, y: number, bw?: number, bh?: number): CSSProperties => ({
      position: "absolute",
      left: px(x),
      top: py(y),
      width: bw === undefined ? undefined : px(bw),
      height: bh === undefined ? undefined : py(bh),
    }),
    /** A point (for centred, translate(-50%,-50%) children). */
    at: (x: number, y: number): CSSProperties => ({ position: "absolute", left: px(x), top: py(y) }),
    /** A size in viewBox units, never below `min` px. */
    len: (n: number, min = 0): string => `max(${min}px, calc(${n} * 100cqw / ${w}))`,
    /** A font size of `n` viewBox units, never below `min` px. */
    fs: (n: number, min: number): CSSProperties => ({ fontSize: `max(${min}px, calc(${n} * 100cqw / ${w}))` }),
  };
}

export type Frame = ReturnType<typeof frame>;

/**
 * A real brand mark from `public/tools`, painted through a CSS mask so it
 * takes a theme token instead of the file's own fill (the marks there are
 * `currentColor` SVGs, which an <img> would render black).
 */
export function Glyph({
  src,
  color,
  size,
  className = "",
}: {
  src: string;
  color: string;
  size: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
