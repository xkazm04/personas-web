"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import TravelLayer from "./TravelLayer";
import { STOPS } from "./data";
import type { Point } from "./layout";

/**
 * The two layers that make her journey visible, new in this evolution of
 * "The Glide":
 *
 *   Spotlight  a wide, soft pool of light that follows her across the canvas
 *              on a lazier spring than the orb, so the part of the app she is
 *              explaining is the lit part — and the light arrives a breath
 *              after she does.
 *   RouteTrace a light streak along the leg she is flying (it draws behind
 *              her and fades once she lands, so it never sits over the UI),
 *              and a pin left at each stop that lights when the choice made
 *              there commits. By the end the four lit pins are the route.
 *
 * The trace is drawn in the canvas's own pixel space (measured), not in a
 * stretched 0-100 box, so the stroke keeps one weight on every screen and the
 * draw-in (pathLength) stays exact.
 */

const LIGHT_SPRING = { type: "spring", stiffness: 26, damping: 14, mass: 1.1 } as const;

export function Spotlight({ at, reduced }: { at: Point; reduced: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <TravelLayer x={at.x} y={at.y} spring={reduced ? { duration: 0 } : LIGHT_SPRING}>
        <span
          className="absolute left-0 top-0 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(closest-side, ${tint("cyan", 11)}, ${tint("cyan", 4)} 55%, transparent)` }}
        />
      </TravelLayer>
    </div>
  );
}

/** Width/height of a box in its own CSS pixels, kept current. */
function useBoxSize() {
  const ref = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** A gentle arc between two points: the control point sits off the chord's
 *  midpoint, always bowing upward, the way a thrown thing travels. */
function arc(a: Point, b: Point): string {
  const mx = (a.x + b.x) / 2;
  const my = Math.max(2, (a.y + b.y) / 2 - Math.max(18, Math.abs(b.x - a.x) * 0.16));
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function RouteTrace({
  flown,
  committed,
  compact,
  reduced,
}: {
  /** How many legs she has set off on (0-4). */
  flown: number;
  /** One per stop: has the choice made there committed? */
  committed: boolean[];
  compact: boolean;
  reduced: boolean;
}) {
  const [ref, { w, h }] = useBoxSize();
  // The trace starts at the first stop: the leg from her dock is a flight to
  // work, not part of the route the two of you build.
  const pct = STOPS.map((s) => (compact ? s.orbCompact : s.orb));
  const pts = pct.map((p) => ({ x: (p.x / 100) * w, y: (p.y / 100) * h }));
  const legs = pts.slice(1).map((p, i) => arc(pts[i], p));
  return (
    <>
      <svg
        ref={ref}
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
        viewBox={`0 0 ${Math.max(w, 1)} ${Math.max(h, 1)}`}
        aria-hidden="true"
      >
        {w > 0 &&
          legs.map((d, i) =>
            // Only the leg into the stop she is working draws, and only while
            // she crosses it: keyed by leg, so it plays once per arrival.
            i + 2 === flown && !reduced ? (
              <motion.path
                key={d}
                d={d}
                fill="none"
                stroke={tint("cyan", 60)}
                strokeWidth="2"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 5px ${tint("cyan", 50)})` }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                transition={{ pathLength: { duration: 0.9, ease: "easeInOut" }, opacity: { duration: 2, times: [0, 0.1, 0.55, 1] } }}
              />
            ) : null,
          )}
      </svg>
      {/* Pins: one per stop, left behind where she hovered */}
      {pct.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute z-[6] -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          aria-hidden="true"
        >
          <span
            className={`block h-2.5 w-2.5 rounded-full border ${reduced ? "" : "duration-500 transition-[background-color,box-shadow,border-color]"}`}
            style={{
              borderColor: committed[i] ? BRAND_VAR.cyan : tint("cyan", 30),
              backgroundColor: committed[i] ? BRAND_VAR.cyan : "transparent",
              boxShadow: committed[i] ? brandShadow("cyan", 12, 70) : "none",
            }}
          />
        </span>
      ))}
    </>
  );
}

/** Segmented progress rail — one segment per walkthrough stop.
 *  (CSS transitions, not framer springs — color-mix values don't tween.) */
export function ProgressRail({ rail, reduced }: { rail: boolean[]; reduced: boolean }) {
  return (
    <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
      {rail.map((filled, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${reduced ? "" : "transition-all duration-500"}`}
          style={{
            backgroundColor: filled ? BRAND_VAR.cyan : tint("cyan", 12),
            boxShadow: filled ? brandShadow("cyan", 10, 45) : undefined,
          }}
        />
      ))}
    </div>
  );
}
