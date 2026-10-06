"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { Scene } from "./data";
import type { V1Layout } from "./layout";

/**
 * The ground and the line - everything in the yard that is drawn rather than
 * built. One SVG in the art box's own viewBox, uniformly scaled, so the line
 * is one weight on every edge and its draw is a true single stroke.
 *
 * What the live section said by omission it now also says with light: the
 * ground inside the line is lit (a floor glow and a brighter grid), the ground
 * outside is the page's own dark. The line is a crisp core over a soft bloom,
 * with a post at each corner. It is drawn once, clockwise, and never redrawn;
 * one bright pass runs it end to end; where her reach meets it, it flares and
 * stays brighter. In the closing stillness it is the only thing that breathes.
 */
const BREATH = { duration: 4.4, repeat: Infinity, ease: "easeInOut" } as const;

export default function Ground({ scene, g, reduced }: { scene: Scene; g: V1Layout; reduced: boolean }) {
  const id = useId().replace(/:/g, "");
  const { x, y, w, h } = g.fence;
  const line = `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  const posts = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  const s = g.stop;
  const flare =
    g.stopAxis === "y"
      ? { x1: s.x, y1: s.y - 90, x2: s.x, y2: s.y + 90 }
      : { x1: s.x - 90, y1: s.y, x2: s.x + 90, y2: s.y };
  const fade = (on: boolean, d = 0.8) => ({
    initial: false as const,
    animate: { opacity: on ? 1 : 0 },
    transition: { duration: reduced ? 0 : d },
  });

  return (
    <svg
      viewBox={`0 0 ${g.W} ${g.H}`}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-floor`} cx="32%" cy="22%" r="85%">
          <stop offset="0%" stopColor={tint("cyan", 16)} />
          <stop offset="60%" stopColor={tint("cyan", 5)} />
          <stop offset="100%" stopColor={tint("cyan", 2)} />
        </radialGradient>
        <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.3" fill={tint("cyan", 26)} />
        </pattern>
        <filter id={`${id}-bloom`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id={`${id}-flare`} gradientUnits="userSpaceOnUse" {...flare}>
          <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity="0" />
          <stop offset="50%" stopColor={BRAND_VAR.cyan} stopOpacity="1" />
          <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* The ground you opened, lit - and only that ground */}
      <motion.g {...fade(scene.lit, 1.2)}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-floor)`} />
        <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-grid)`} />
      </motion.g>

      {/* The line before you drew it: same rect, so what follows is a morph */}
      <motion.path d={line} fill="none" stroke={tint("cyan", 24)} strokeWidth={1.5} strokeDasharray="6 8" {...fade(!scene.drawn, 0.5)} />

      <motion.g
        initial={false}
        animate={{ opacity: reduced ? 1 : scene.calm ? [1, 0.7, 1] : 1 }}
        transition={reduced ? { duration: 0 } : scene.calm ? BREATH : { duration: 0.6 }}
      >
        <motion.path d={line} fill="none" stroke={tint("cyan", 45)} strokeWidth={9} filter={`url(#${id}-bloom)`} {...fade(scene.lit, 1)} />
        <motion.path
          d={line}
          fill="none"
          stroke={tint("cyan", 80)}
          strokeWidth={2}
          strokeLinejoin="miter"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: scene.drawn ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 1.3, ease: "easeInOut" }}
        />
        {posts.map(([px, py], i) => (
          <motion.rect
            key={i}
            x={px - 5}
            y={py - 5}
            width={10}
            height={10}
            fill={BRAND_VAR.cyan}
            initial={false}
            animate={{ opacity: scene.lit ? 1 : 0, scale: scene.lit ? 1 : 0.2 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : i * 0.08 }}
          />
        ))}

        {/* It holds: one pass, end to end, said once */}
        {scene.sweep && !reduced && (
          <motion.path
            d={line}
            fill="none"
            stroke={BRAND_VAR.cyan}
            strokeWidth={5}
            strokeLinecap="round"
            initial={{ pathLength: 0.07, pathOffset: 0, opacity: 0 }}
            animate={{ pathOffset: 0.93, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.7, ease: "linear" }}
          />
        )}

        {/* Where she touched it, it flares - and stays brighter */}
        <motion.line {...flare} stroke={`url(#${id}-flare)`} strokeWidth={5} strokeLinecap="round" {...fade(scene.stopped, 0.5)} />
      </motion.g>

      {/* Her reach - the one stroke that travels, and it ends at the line */}
      <motion.path
        d={g.reach}
        fill="none"
        stroke={tint("cyan", 55)}
        strokeWidth={2}
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: scene.reaching ? 1 : 0, opacity: scene.stopped ? 0.55 : 1 }}
        transition={reduced ? { duration: 0 } : { pathLength: { duration: 0.7, ease: "easeOut" }, opacity: { duration: 0.6 } }}
      />
      {scene.stopped && !reduced && (
        <motion.circle
          cx={s.x}
          cy={s.y}
          fill="none"
          stroke={tint("cyan", 60)}
          strokeWidth={2}
          initial={{ r: 4, opacity: 0 }}
          animate={{ r: 40, opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      )}
      <motion.circle cx={s.x} cy={s.y} r={7} fill={BRAND_VAR.cyan} {...fade(scene.stopped, 0.4)} />
    </svg>
  );
}
