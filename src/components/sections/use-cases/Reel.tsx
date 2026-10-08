"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { TOOLS, brandInk, brandTint, type LabCase } from "./shared/catalog";
import ToolGlyph from "./shared/ToolGlyph";
import { PAYLINE_ROW, ROWS, stops, stripOf, yFor } from "./reels";

export type ReelState = "waiting" | "need" | "consider" | "spinning" | "locked";

/** Cell height in cqw of the art box. */
export const CELL = 6.7;
const SPIN_EASE = [0.2, 0.72, 0.3, 1.05] as const;

/**
 * One reel: the need it answers on top, a window of five cells over a strip
 * of its candidate tools. On its turn the reel winds up, spins and stops with
 * the chosen tool on the payline, where it lights in its brand colour.
 */
export default function Reel({ c, state, label, moving, spinMs }: { c: LabCase; state: ReelState; label: string; moving: boolean; spinMs: number }) {
  const strip = stripOf(c);
  const { start, end } = stops(c);
  const chosen = TOOLS[c.chosen];
  const locked = state === "locked";
  const live = state === "consider" || state === "spinning";
  const spinning = state === "spinning" && moving;
  const at = locked || state === "spinning" ? end : start;
  const transition = spinning
    ? { duration: spinMs / 1000, ease: SPIN_EASE }
    : { duration: moving && locked ? 0.4 : 0 };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <motion.p
        className="flex items-end justify-center text-center font-semibold leading-tight"
        style={{ height: "4.6cqw", fontSize: "max(14px, 1.3cqw)", paddingBottom: "0.8cqw" }}
        initial={false}
        animate={{ opacity: state === "waiting" ? 0 : 1, y: state === "waiting" ? 6 : 0, color: live || state === "need" ? "var(--brand-cyan)" : "var(--foreground)" }}
        transition={{ duration: moving ? 0.35 : 0 }}
      >
        {label}
      </motion.p>
      <motion.div
        className="relative overflow-hidden rounded-[1.1cqw] border [border-color:var(--bc)]"
        style={{
          height: `${ROWS * CELL}cqw`,
          backgroundColor: "rgba(var(--surface-overlay), 0.035)",
          "--bc": live ? "var(--brand-cyan)" : locked ? brandInk(chosen, 45) : "var(--border-glass-hover)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
        } as CSSProperties}
        initial={false}
        animate={{ opacity: state === "waiting" ? 0.45 : 1, scale: live ? 1.03 : 1 }}
        transition={{ duration: moving ? 0.4 : 0 }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 border-y transition-colors duration-500 [border-color:var(--pc)]"
          style={{
            top: `${PAYLINE_ROW * CELL}cqw`,
            height: `${CELL}cqw`,
            backgroundColor: locked ? brandTint(chosen, 20) : live ? tint("cyan", 8) : "transparent",
            "--pc": locked ? brandInk(chosen, 55) : live ? "var(--brand-cyan)" : "transparent",
          } as CSSProperties}
        />
        <motion.div
          className="relative"
          initial={false}
          animate={{ y: yFor(at, strip.length), filter: spinning ? ["blur(0px)", "blur(1.6px)", "blur(0px)"] : "blur(0px)" }}
          transition={spinning ? { ...transition, filter: { duration: spinMs / 1000, times: [0, 0.35, 1] } } : transition}
        >
          {strip.map((key, i) => {
            const win = locked && i === end;
            return (
              <div key={i} className="relative flex flex-col items-center justify-center" style={{ height: `${CELL}cqw` }}>
                <ToolGlyph
                  tool={TOOLS[key]}
                  className="transition-colors duration-500"
                  style={{ width: "2.9cqw", height: "2.9cqw", color: win ? brandInk(chosen, 60) : live ? "var(--foreground)" : "var(--muted-dark)" }}
                />
                {win && (
                  <span className="mt-[0.35cqw] whitespace-nowrap font-semibold text-foreground" style={{ fontSize: "max(12px, 1.05cqw)" }}>
                    {chosen.label}
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
