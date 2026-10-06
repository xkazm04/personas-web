"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { HUES } from "../shared/cast";
import type { Errand } from "./data";
import { routePoints, type WorldLayout } from "./layout";

/**
 * One teammate - a small drawn figure in its own colour, a visor and a glow.
 * It steps onto her pad when its job exists, waits there with the others for
 * Start, then FOLLOWS its route out (keyframes through the same points the
 * route line is drawn from, so it never cuts a corner), hovers at the tool
 * while the work runs, and follows the route home the moment it is done.
 */

const S = 26;

function Figure({ hue }: { hue: (typeof HUES)[number] }) {
  return (
    <svg width={S} height={S + 4} viewBox="0 0 26 30" aria-hidden="true" style={{ filter: `drop-shadow(0 0 6px ${tint(hue, 70)})` }}>
      <rect x="3" y="2" width="20" height="24" rx="10" fill={tint(hue, 30)} stroke={BRAND_VAR[hue]} strokeWidth="2" />
      <rect x="7" y="8" width="12" height="6" rx="3" fill={BRAND_VAR[hue]} />
      <ellipse cx="13" cy="29" rx="7" ry="1.5" fill={tint(hue, 40)} />
    </svg>
  );
}

export default function Courier({
  i,
  layout,
  errand,
  reduced,
}: {
  i: number;
  layout: WorldLayout;
  errand: Errand;
  reduced: boolean;
}) {
  const pts = useMemo(() => routePoints(layout, i), [layout, i]);
  const slot = layout.slots[i];
  const end = pts[pts.length - 1];
  const off = (p: { x: number; y: number }) => ({ x: p.x - S / 2, y: p.y - S });

  let target: { x: number | number[]; y: number | number[] };
  if (errand === "out") target = { x: pts.map((p) => off(p).x), y: pts.map((p) => off(p).y) };
  else if (errand === "back") target = { x: [...pts].reverse().map((p) => off(p).x), y: [...pts].reverse().map((p) => off(p).y) };
  else if (errand === "there") target = off(end);
  else target = off(slot);

  const shown = errand !== "absent";
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0"
      initial={false}
      animate={{ ...target, opacity: shown ? 1 : 0, scale: shown ? 1 : 0.3 }}
      transition={
        reduced
          ? { duration: 0 }
          : errand === "out" || errand === "back"
            ? { duration: 0.85, ease: "easeInOut" }
            : { ...SPRING_POP, opacity: { duration: 0.3 } }
      }
      aria-hidden="true"
    >
      {/* Hovering at work; standing still on the pad */}
      <motion.div
        animate={errand === "there" && !reduced ? { y: [0, -5, 0] } : { y: 0 }}
        transition={errand === "there" && !reduced ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <Figure hue={HUES[i]} />
      </motion.div>
    </motion.div>
  );
}
