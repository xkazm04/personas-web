"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { DESKS, boxFaces, cable, deskIn, hubOut, iso, poly } from "./iso";
import { FACE } from "./palette";

/**
 * One agent's desk: a block with a screen at its back edge. It RISES out of
 * its spot on the floor (scaleY from the floor line, so nothing above it
 * moves), and once the floor is started its screen lights and writes lines —
 * the agent at work. Under reduced motion it simply stands, screen on.
 */

const LINES = [0.95, 0.62, 0.8, 0.5] as const;

export function Desk({
  i,
  up,
  running,
  live,
  reduced,
}: {
  i: number;
  up: boolean;
  running: boolean;
  live: boolean;
  reduced: boolean;
}) {
  const k = DESKS[i];
  const f = boxFaces(k.x, k.y, k.w, k.d, k.h);
  const base = iso({ x: k.x + k.w / 2, y: k.y + k.d / 2 });
  const sx = k.x + 0.22;
  const sw = k.w - 0.44;
  const sy = k.y + 0.16;
  const screen = poly([
    { x: sx, y: sy, z: k.h },
    { x: sx + sw, y: sy, z: k.h },
    { x: sx + sw, y: sy, z: k.h + 1.1 },
    { x: sx, y: sy, z: k.h + 1.1 },
  ]);
  if (!up) return null;
  return (
    <motion.g
      style={{ transformBox: "view-box", transformOrigin: `${base.x}px ${base.y}px` }}
      initial={reduced ? false : { scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: 0.3 }}
    >
      <polygon points={f.left} fill={FACE.left} stroke="var(--border-glass-hover)" />
      <polygon points={f.right} fill={FACE.right} stroke="var(--border-glass-hover)" />
      <polygon points={f.top} fill={tint("cyan", 12)} stroke={tint("cyan", 45)} />
      <polygon
        points={screen}
        fill={running ? tint("cyan", 20) : "var(--background)"}
        stroke={running ? BRAND_VAR.cyan : tint("cyan", 40)}
        strokeWidth={1.4}
        style={{ transition: reduced ? undefined : "fill 600ms, stroke 600ms" }}
      />
      {running &&
        LINES.map((len, j) => {
          const z = k.h + 0.88 - j * 0.2;
          const a = iso({ x: sx + 0.2, y: sy, z });
          const b = iso({ x: sx + 0.2 + (sw - 0.4) * len, y: sy, z });
          return (
            <motion.line
              key={j}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={BRAND_VAR.cyan}
              strokeWidth={2.2}
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0, opacity: 0.4 }}
              animate={
                live
                  ? { pathLength: [0, 1, 1], opacity: [0.4, 0.95, 0.4] }
                  : { pathLength: 1, opacity: 0.8 }
              }
              transition={
                live
                  ? { duration: 2.4, repeat: Infinity, delay: i * 0.5 + j * 0.35, ease: "easeInOut" }
                  : { duration: 0 }
              }
            />
          );
        })}
    </motion.g>
  );
}

/** The cable from the hub to a desk, drawn as the desk rises. */
export function DeskCable({ i, reduced }: { i: number; reduced: boolean }) {
  return (
    <motion.path
      d={cable(hubOut(i), deskIn(i))}
      fill="none"
      stroke={tint("cyan", 70)}
      strokeWidth={2.2}
      strokeLinecap="round"
      style={{ filter: `drop-shadow(0 0 4px ${tint("cyan", 50)})` }}
      initial={reduced ? false : { pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, ease: "easeInOut", delay: 0.15 }}
    />
  );
}
