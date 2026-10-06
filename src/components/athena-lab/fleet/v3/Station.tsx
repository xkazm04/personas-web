"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { HUES, TOOLS, type Task } from "../shared/cast";
import ToolMark from "../shared/ToolMark";
import type { Station as StationGeom } from "./layout";

/**
 * One of your tools, as a place in her world: a lit island wearing the tool's
 * real mark, standing on its own shadow. It sits dim until a job needs it;
 * lights in the colour of the teammate sent there; a ring closes round it as
 * the work gets done at its own pace; and what the work found appears under
 * it. Placed by its centre, so nothing here animates layout.
 */
export default function Station({
  i,
  geom,
  isle,
  labelW,
  task,
  routed,
  busy,
  work,
  done,
  reduced,
}: {
  i: number;
  geom: StationGeom;
  isle: number;
  labelW: number;
  task: Task;
  routed: boolean;
  busy: boolean;
  work: number;
  done: boolean;
  reduced: boolean;
}) {
  const hue = HUES[i];
  const ring = isle + 7;
  const size = (ring + 4) * 2;
  return (
    <div className="absolute" style={{ left: geom.at.x, top: geom.at.y }}>
      {/* Ground shadow - the island stands on the stage, it does not float on it */}
      <span
        className="absolute -translate-x-1/2 rounded-[50%] blur-md"
        style={{ top: isle * 0.7, width: isle * 2.2, height: isle * 0.7, backgroundColor: "color-mix(in srgb, var(--background), black 60%)" }}
        aria-hidden="true"
      />
      <motion.span
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{ width: isle * 3, height: isle * 3, backgroundColor: tint(hue, 22) }}
        initial={false}
        animate={{ opacity: busy ? (reduced ? 0.8 : [0.5, 1, 0.5]) : done ? 0.6 : 0 }}
        transition={busy && !reduced ? { duration: 1.6, repeat: Infinity } : { duration: 0.5 }}
        aria-hidden="true"
      />
      <span
        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-[border-color,background-color,box-shadow,opacity] duration-500"
        style={{
          width: isle * 2,
          height: isle * 2,
          opacity: routed ? 1 : 0.5,
          borderColor: routed ? tint(hue, done ? 70 : 45) : "rgba(var(--surface-overlay), 0.16)",
          background: `radial-gradient(circle at 35% 28%, rgba(var(--surface-overlay), 0.12), ${routed ? tint(hue, 10) : "rgba(var(--surface-overlay), 0.03)"} 70%)`,
          boxShadow: done ? brandShadow(hue, 26, 40) : "inset 0 1px 0 rgba(var(--surface-overlay), 0.12)",
        }}
      >
        <ToolMark name={TOOLS[i]} className="text-foreground" style={{ width: isle * 0.8, height: isle * 0.8 }} />
      </span>
      {/* The work, closing round it */}
      <svg
        className="absolute -translate-x-1/2 -translate-y-1/2 overflow-visible"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={ring}
          fill="none"
          stroke={BRAND_VAR[hue]}
          strokeWidth={4}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 4px ${tint(hue, 60)})` }}
          initial={false}
          animate={{ pathLength: work, opacity: work > 0 ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.9, ease: "linear" }}
        />
      </svg>

      <div
        className="absolute flex -translate-x-1/2 flex-col items-center gap-0.5 text-center transition-opacity duration-500"
        style={{ top: ring + 8, width: labelW, opacity: routed ? 1 : 0.55 }}
      >
        <span className="text-base font-medium leading-snug text-foreground">{task.title}</span>
        {done ? (
          <motion.span
            className="flex items-center gap-1 whitespace-nowrap text-base font-semibold"
            style={{ color: BRAND_VAR[hue] }}
            initial={reduced ? false : { opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {task.found}
          </motion.span>
        ) : (
          <span className="whitespace-nowrap font-mono text-sm text-muted-dark">{task.scope}</span>
        )}
      </div>
    </div>
  );
}
