"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import type { FieldLight } from "./light";

/**
 * The field itself — the only thing in this section that carries elapsed time.
 *
 * There is no clock, no timeline and no sky here. There is one light centre
 * that drifts across the field and three brand tints crossfading against each
 * other on it: amber while you are still around, purple while you are not,
 * cyan as you come back. Every layer changes on the same tick, and every layer
 * carries a CSS transition longer than a tick, so 26 samples of the curve read
 * as one continuous evening.
 *
 * The light centre moves by TRANSFORM (percent of the field's own box), never
 * by `left`/`top` — the field is full-bleed and a moving light must never cost
 * a layout pass.
 *
 * Reduced motion drops the transitions and the drift: the pinned tick's light
 * is simply the light, painted once.
 */

const FADE = "transition-opacity duration-[1600ms] ease-linear";
const DRIFT = { duration: 2.4, ease: "linear" } as const;

/** A full-field colour wash. Night settles from above, both ends of the day
 *  come up off the ground — which is what makes the field read as a place. */
function Wash({
  gradient,
  opacity,
  reduced,
}: {
  gradient: string;
  opacity: number;
  reduced: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${reduced ? "" : FADE}`}
      style={{ background: gradient, opacity }}
    />
  );
}

export function Field({
  light,
  dusk,
  seamY,
  reduced,
  children,
}: {
  light: FieldLight;
  dusk: number;
  seamY: number;
  reduced: boolean;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* How dark it has got. Sits under every coloured layer so deepening the
          field never dims the work running in it. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-background ${reduced ? "" : FADE}`}
        style={{ opacity: dusk }}
      />

      <Wash
        gradient={`linear-gradient(to top, ${tint("amber", 20)}, transparent 58%)`}
        opacity={light.warm}
        reduced={reduced}
      />
      <Wash
        gradient={`linear-gradient(to bottom, ${tint("purple", 22)}, transparent 68%)`}
        opacity={light.deep}
        reduced={reduced}
      />
      <Wash
        gradient={`linear-gradient(to top, ${tint("cyan", 18)}, transparent 62%)`}
        opacity={light.dawn}
        reduced={reduced}
      />

      {/* The light centre — one soft mass, three tints crossfading on it, no
          disc and no edge anywhere. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ x: `${light.x}%`, y: `${light.y}%` }}
        transition={reduced ? { duration: 0 } : DRIFT}
      >
        <div className="absolute left-0 top-0 h-[95%] w-[120%] -translate-x-1/2 -translate-y-1/2">
          {(
            [
              ["amber", 30, light.warm],
              ["purple", 34, light.deep],
              ["cyan", 28, light.dawn],
            ] as const
          ).map(([key, alpha, opacity]) => (
            <div
              key={key}
              className={`absolute inset-0 ${reduced ? "" : FADE}`}
              style={{
                background: `radial-gradient(closest-side, ${tint(key, alpha)}, transparent 72%)`,
                opacity,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* The ground: everything below the seam settles a shade heavier than the
          sky, which is what lets the glass panels sit ON something. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-background"
        style={{ top: `${seamY}%`, opacity: 0.32 }}
      />

      {/* The seam — one hairline, and one glow that takes the hour's colour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{ top: `${seamY}%`, backgroundColor: "var(--border-glass)" }}
      />
      {(
        [
          ["amber", light.ground * light.warm * 2.2],
          ["cyan", light.ground * Math.max(light.dawn, light.deep * 0.35) * 2.2],
        ] as const
      ).map(([key, opacity]) => (
        <div
          key={key}
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 h-px ${reduced ? "" : FADE}`}
          style={{
            top: `${seamY}%`,
            backgroundColor: tint(key, 80),
            boxShadow: `0 0 18px ${tint(key, 45)}`,
            opacity: Math.min(1, opacity),
          }}
        />
      ))}

      {/* Scrim the title owns, so the section's words never fight the light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[32%] bg-background"
        style={{
          opacity: 0.55,
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
        }}
      />

      {children}
    </div>
  );
}
