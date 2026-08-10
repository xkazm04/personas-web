"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { DUST, FRAY, RIM, SPARK, soft } from "./palette";

/**
 * The edge of a light: its rim, its sparks, the film that settles on it, and
 * the thin mark that says she has an eye on it.
 *
 * The rim is drawn TWICE, whole and come-apart, crossfading against each other
 * on the health ramp — so a cared-for project's edge frays open rather than
 * being swapped for a broken one. It is the same morph the report's frame uses
 * one layer up, at a tenth of the size.
 *
 * Everything is in the light's own 100x100 space, so one component serves every
 * size in the constellation.
 */

/** Where the sparks sit. Authored — an even ring reads as a loading spinner. */
const SPARKS = [
  { x: 50, y: 8 },
  { x: 88, y: 39 },
  { x: 68, y: 90 },
  { x: 16, y: 71 },
] as const;

export default function LightRim({
  color,
  health,
  lit,
  alive,
  dusty,
  watching,
  tween,
  reduced,
}: {
  color: string;
  health: number;
  lit: boolean;
  alive: boolean;
  dusty: boolean;
  watching: boolean;
  /** Shared duration class so colour and luminance slide together. */
  tween: string;
  reduced: boolean;
}) {
  const uid = useId();
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      <defs>
        <pattern id={`${uid}-dust`} width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="rgba(var(--surface-overlay), 0.42)" />
          <circle cx="6.5" cy="6" r="0.6" fill="rgba(var(--surface-overlay), 0.3)" />
        </pattern>
      </defs>

      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        strokeWidth="1.6"
        className={`transition-[stroke,opacity] ${tween}`}
        style={{ stroke: soft(color, RIM[health]), opacity: lit ? 1 - FRAY[health] : 0 }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="5 11"
        className={`transition-[stroke,opacity] ${tween}`}
        style={{
          stroke: soft(color, RIM[health]),
          opacity: lit ? FRAY[health] : 0,
          transformBox: "view-box",
          transformOrigin: "50px 50px",
        }}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={reduced ? undefined : { duration: 54, repeat: Infinity, ease: "linear" }}
      />

      {SPARKS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r="1.9"
          className={`transition-[fill,opacity] ${tween}`}
          style={{ fill: soft(color, 78), opacity: alive ? SPARK[health] * (1 - i * 0.14) : 0 }}
        />
      ))}

      <circle
        cx="50"
        cy="50"
        r="47.5"
        fill="none"
        strokeWidth="0.8"
        strokeDasharray="1.4 5"
        className={`transition-opacity ${tween}`}
        style={{ stroke: tint("cyan", 60), opacity: watching ? 1 : 0 }}
      />

      {dusty && (
        <circle
          cx="50"
          cy="50"
          r="44"
          className={`transition-opacity ${tween}`}
          style={{ fill: `url(#${uid}-dust)`, opacity: DUST[health] }}
        />
      )}
    </svg>
  );
}
