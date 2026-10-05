"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { brandInk, brandTint, type LabTool } from "../shared/catalog";
import ToolGlyph from "../shared/ToolGlyph";
import { ATTRACTOR, PULL, TILE, cq, px, py, type FieldSpot } from "./geometry";

export type TileMode = "idle" | "dim" | "candidate" | "chosen" | "used";

const LOOK: Record<TileMode, { opacity: number; scale: number }> = {
  idle: { opacity: 0.62, scale: 1 },
  dim: { opacity: 0.22, scale: 0.86 },
  candidate: { opacity: 1, scale: 1.14 },
  chosen: { opacity: 1, scale: 1.34 },
  used: { opacity: 0.95, scale: 1 },
};

/**
 * One tool in the field. A need pulls its candidates part-way toward the
 * attractor (magnetism), the chosen one further; everything else dims and
 * shrinks back. `scan` lights the tile once at its turn in the sweep.
 */
export default function FieldTile({
  spot,
  tool,
  mode,
  pulled,
  scan,
  moving,
  drifting,
  showName,
}: {
  spot: FieldSpot;
  tool: LabTool;
  mode: TileMode;
  pulled: number;
  scan: { delay: number; key: string } | null;
  moving: boolean;
  drifting: boolean;
  showName: boolean;
}) {
  const dx = (ATTRACTOR.x - spot.x) * PULL * pulled;
  const dy = (ATTRACTOR.y - spot.y) * PULL * pulled;
  const lit = mode === "candidate" || mode === "chosen";
  const t = moving ? { type: "spring" as const, stiffness: 170, damping: 20 } : { duration: 0 };

  return (
    <motion.div
      className="absolute"
      style={{ left: px(spot.x), top: py(spot.y), width: cq(TILE), height: cq(TILE), marginLeft: cq(-TILE / 2), marginTop: cq(-TILE / 2), zIndex: lit ? 3 : 1 }}
      initial={false}
      animate={{ x: `${(dx / TILE) * 100}%`, y: `${(dy / TILE) * 100}%`, ...LOOK[mode] }}
      transition={t}
    >
      <motion.div
        className="relative h-full w-full"
        animate={drifting ? { y: ["0%", "-7%", "0%"] } : { y: "0%" }}
        transition={drifting ? { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: spot.drift } : { duration: 0.4 }}
      >
        <div
          className="flex h-full w-full items-center justify-center rounded-[30%] border transition-[background-color,border-color,box-shadow,color] duration-500 [border-color:var(--bc)]"
          style={{
            color: lit ? brandInk(tool, 55) : "var(--muted-dark)",
            backgroundColor: lit ? brandTint(tool, mode === "chosen" ? 26 : 14) : "rgba(var(--surface-overlay), 0.04)",
            "--bc": lit || mode === "used" ? brandInk(tool, 50) : "var(--border-glass-hover)",
            boxShadow: mode === "chosen" ? `0 0 ${cq(28)} ${brandTint(tool, 45)}` : "none",
          } as CSSProperties}
        >
          <ToolGlyph tool={tool} className="h-[48%] w-[48%]" />
        </div>
        {scan && (
          <motion.span
            key={scan.key}
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[14%] rounded-[34%] border-2 border-brand-cyan"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={moving ? { opacity: [0, 1, 0], scale: [0.9, 1.05, 1.1] } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: scan.delay, ease: "easeOut" }}
          />
        )}
        {mode === "used" && (
          <span
            aria-hidden="true"
            className="absolute -right-[8%] -top-[8%] h-[24%] w-[24%] rounded-full border-2 border-background bg-brand-emerald"
          />
        )}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-full mt-[18%] -translate-x-1/2 whitespace-nowrap font-semibold text-foreground"
          style={{ fontSize: `max(12px, ${cq(13)})` }}
          initial={false}
          animate={{ opacity: showName ? 1 : 0, y: showName ? 0 : -4 }}
          transition={moving ? { duration: 0.35 } : { duration: 0 }}
        >
          {tool.label}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
