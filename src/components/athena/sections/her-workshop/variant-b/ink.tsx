"use client";

import { type CSSProperties } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { isFlat, type Cable, type Leg } from "./layout";

/**
 * The loom — the wiring that makes five different benches one control surface.
 *
 * Every run in here is an axis-aligned hairline box, never a path in a viewBox.
 * That is the whole reason this file exists instead of an SVG thread layer: a
 * `viewBox` with no aspect lock draws a vertical run thicker than a horizontal
 * one, and a scene arguing "one console, one weight of cable" cannot afford
 * that. These are boxes, so every cable is the same hairline at every viewport,
 * and every one of them grows, glows and carries signal on the compositor.
 *
 * Direction is the grammar. A cable GROWS from the desk outward when its bench
 * is wired in — she reaches out and plugs the thing in — and afterwards the
 * signal always travels the other way, inward, because a report is something
 * coming home. A cable with no signal on it is a bench with nothing to report,
 * and that is a state this section deliberately shows.
 */

/** Cable weight. One value, every run, every viewport. */
const LINE = "1px";
/** How much of a leg the travelling signal occupies, and the transform that
 *  therefore carries it end to end (the `Sheen` trick: percentages of self). */
const CHIP = 20;
const TRAVEL = ((100 - CHIP) / CHIP) * 100;
/** One leg's worth of travel. Two legs make a whole cable. */
const LEG_S = 0.55;

function geom(leg: Leg) {
  const flat = isFlat(leg);
  return {
    flat,
    /** Is the desk end at the higher coordinate? Decides which way the signal
     *  runs and which end the cable grows from. */
    onward: flat ? leg.x2 > leg.x1 : leg.y2 > leg.y1,
    box: {
      left: `${Math.min(leg.x1, leg.x2)}%`,
      top: `${Math.min(leg.y1, leg.y2)}%`,
      width: flat ? `${Math.abs(leg.x2 - leg.x1)}%` : LINE,
      height: flat ? LINE : `${Math.abs(leg.y2 - leg.y1)}%`,
    } as CSSProperties,
  };
}

/** One straight run: the line itself, plus whatever is riding it. */
function Run({
  leg,
  wired,
  delay,
  live,
  period,
  spark,
  offset,
  breathing,
  reduced,
}: {
  leg: Leg;
  wired: boolean;
  delay: number;
  live: boolean;
  period: number;
  spark: boolean;
  /** Where in the cable this leg sits, so a signal crosses the elbow in order. */
  offset: number;
  breathing: boolean;
  reduced: boolean;
}) {
  const { flat, onward, box } = geom(leg);
  const origin = flat
    ? onward
      ? "right center"
      : "left center"
    : onward
      ? "center bottom"
      : "center top";
  const to = `${onward ? TRAVEL : -TRAVEL}%`;
  const move = flat ? { x: ["0%", to] } : { y: ["0%", to] };
  const chip: CSSProperties = flat
    ? {
        height: 3,
        width: `${CHIP}%`,
        top: -1,
        left: onward ? 0 : undefined,
        right: onward ? undefined : 0,
      }
    : {
        width: 3,
        height: `${CHIP}%`,
        left: -1,
        top: onward ? 0 : undefined,
        bottom: onward ? undefined : 0,
      };

  return (
    <div className="pointer-events-none absolute" style={box}>
      <motion.span
        className="absolute inset-0"
        style={{ backgroundColor: tint("cyan", 34), transformOrigin: origin }}
        initial={reduced ? false : flat ? { scaleX: 0 } : { scaleY: 0 }}
        animate={{
          ...(flat ? { scaleX: wired ? 1 : 0 } : { scaleY: wired ? 1 : 0 }),
          opacity: breathing && !reduced ? [0.6, 1, 0.6] : 1,
        }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                default: { duration: 0.5, ease: "easeOut", delay: wired ? delay : 0 },
                opacity: breathing
                  ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.4 },
              }
        }
      />
      {wired && (live || spark) && !reduced && (
        <motion.span
          className="absolute rounded-full"
          style={{
            ...chip,
            backgroundColor: BRAND_VAR.cyan,
            filter: `drop-shadow(0 0 3px ${tint("cyan", 70)})`,
          }}
          initial={{ opacity: 0 }}
          animate={{ ...move, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: LEG_S,
            ease: "linear",
            delay: offset * LEG_S,
            ...(live ? { repeat: Infinity, repeatDelay: Math.max(period - LEG_S, 0.2) } : {}),
          }}
        />
      )}
    </div>
  );
}

/** A whole cable — its legs grow desk-end first, and a signal crosses them
 *  bench-end first. Same wire, two directions, two different claims. */
export function Wire({
  cable,
  wired,
  live,
  period,
  spark,
  breathing = false,
  reduced,
}: {
  cable: Cable;
  wired: boolean;
  live: boolean;
  period: number;
  spark: boolean;
  breathing?: boolean;
  reduced: boolean;
}) {
  const last = cable.length - 1;
  return (
    <>
      {cable.map((leg, k) => (
        <Run
          key={k}
          leg={leg}
          wired={wired}
          delay={(last - k) * 0.22}
          live={live}
          period={period}
          spark={spark}
          offset={k}
          breathing={breathing}
          reduced={reduced}
        />
      ))}
    </>
  );
}
