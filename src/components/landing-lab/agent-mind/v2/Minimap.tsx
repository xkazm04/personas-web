"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { MindRun } from "../shared/useMindRun";
import { WORLD, type Camera, type WNode } from "./world";

const MW = 132;
const K = MW / WORLD.w;

/**
 * The whole plan in miniature, with the camera's viewfinder on it: while the
 * camera is close on one beat, this is where the visitor sees what is out of
 * frame and how far along the run is.
 */
export default function Minimap({ run, nodes, cam, view }: { run: MindRun; nodes: WNode[]; cam: Camera; view: { w: number; h: number } }) {
  const s = cam.scale || 1;
  const vf = { x: (-cam.x / s) * K, y: (-cam.y / s) * K, w: (view.w / s) * K, h: (view.h / s) * K };
  const mh = WORLD.h * K;
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-dark">{run.lab.wholePlan}</span>
      <svg width={MW} height={mh} className="overflow-hidden rounded-md border border-glass bg-[rgba(var(--surface-overlay),0.03)]" aria-hidden>
        {nodes.map((n) => {
          const st = run.phase === "idle" ? "pending" : run.statusOf(n.beat);
          return (
            <circle
              key={n.id}
              cx={n.x * K}
              cy={n.y * K}
              r={st === "active" ? 3.5 : 2.5}
              fill={st === "pending" ? "var(--text-secondary)" : BRAND_VAR[st === "done" ? "emerald" : n.brand]}
            />
          );
        })}
        <motion.rect
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity={0.7}
          strokeWidth={1}
          rx={2}
          initial={false}
          animate={{ x: Math.max(vf.x, 0.5), y: Math.max(vf.y, 0.5), width: Math.min(vf.w, MW - 1), height: Math.min(vf.h, mh - 1) }}
          transition={run.reduced ? { duration: 0 } : { duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
    </div>
  );
}
