"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { CaseId } from "../shared/cases";
import { FOCUS_SCALE, PANEL_POS } from "./data";
import { ShotFails, ShotWhy, type HealingCopy } from "./ShotsA";
import ShotAfter from "./ShotAfter";
import ShotFix from "./ShotFix";

/* Frame and panel geometry in em (the art's font-size is set from the stage). */
export const FRAME = { w: 56, h: 28 } as const;
const PAD = 1;
const GAP = 1;
const PW = (FRAME.w - 2 * PAD - GAP) / 2;
const PH = (FRAME.h - 2 * PAD - GAP) / 2;
const centre = (i: number, size: number, total: number) => (PAD + size / 2 + i * (size + GAP)) / total;

export const SHOT_COLOR: BrandKey[] = ["rose", "amber", "cyan", "emerald"];

/**
 * The storyboard under a camera: four panels on one canvas, and a dolly that
 * pushes in on the focused shot (focus 0 = the whole board). The camera moves
 * the canvas, never the panels, so every shot keeps its place on the board.
 */
export default function Camera({
  t,
  caseId,
  focus,
  titles,
  running,
}: {
  t: HealingCopy;
  caseId: CaseId;
  focus: number;
  titles: string[];
  running: boolean;
}) {
  const at = focus > 0 ? PANEL_POS[focus - 1] : null;
  const s = at ? FOCUS_SCALE : 1;
  const x = at ? `${(0.5 - centre(at.col, PW, FRAME.w)) * s * 100}%` : "0%";
  const y = at ? `${(0.5 - centre(at.row, PH, FRAME.h)) * s * 100}%` : "0%";
  const escalated = caseId === "login";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.2em] border border-glass bg-foreground/[0.02]">
      <motion.div
        className="absolute inset-0 grid grid-cols-2 grid-rows-2"
        style={{ padding: `${PAD}em`, gap: `${GAP}em` }}
        initial={false}
        animate={{ scale: s, x, y }}
        transition={{ duration: running ? 1.15 : 0, ease: [0.65, 0, 0.35, 1] }}
      >
        {PANEL_POS.map((p, i) => {
          const k = escalated && i >= 2 ? "rose" : SHOT_COLOR[i];
          const on = focus === i + 1;
          return (
            <motion.section
              key={i}
              className="relative flex min-h-0 flex-col overflow-hidden rounded-[1em] border px-[1em] pb-[0.8em] pt-[0.7em]"
              style={{
                gridColumn: p.col + 1,
                gridRow: p.row + 1,
                background: `linear-gradient(150deg, ${tint(k, 9)}, color-mix(in srgb, var(--background) 88%, transparent) 60%)`,
                borderColor: on ? tint(k, 60) : "var(--border-glass)",
                boxShadow: on ? `0 0 3em ${tint(k, 18)}` : "none",
              }}
              initial={false}
              animate={{ opacity: focus === 0 || on ? 1 : 0.28 }}
              transition={{ duration: running ? 0.6 : 0 }}
            >
              <header className="mb-[0.3em] flex items-center gap-[0.55em]">
                <span
                  className="flex h-[1.5em] w-[1.5em] items-center justify-center rounded-full font-mono text-[0.85em] font-bold"
                  style={{ background: BRAND_VAR[k], color: "var(--background)" }}
                >
                  {i + 1}
                </span>
                <span className="font-semibold text-foreground">{titles[i]}</span>
              </header>
              <div className="min-h-0 flex-1">
                {i === 0 && <ShotFails t={t} caseId={caseId} />}
                {i === 1 && <ShotWhy t={t} caseId={caseId} />}
                {i === 2 && <ShotFix t={t} caseId={caseId} live={running && on} />}
                {i === 3 && <ShotAfter t={t} caseId={caseId} />}
              </div>
            </motion.section>
          );
        })}
      </motion.div>

      {/* viewfinder corners: fixed to the lens, not the board */}
      {(["left-[0.5em] top-[0.5em] border-l-2 border-t-2", "right-[0.5em] top-[0.5em] border-r-2 border-t-2", "bottom-[0.5em] right-[0.5em] border-b-2 border-r-2", "bottom-[0.5em] left-[0.5em] border-b-2 border-l-2"] as const).map((pos) => (
        <span key={pos} aria-hidden className={`pointer-events-none absolute h-[1.4em] w-[1.4em] border-foreground/40 ${pos}`} />
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 60%, color-mix(in srgb, var(--background) 55%, transparent))" }}
      />
    </div>
  );
}
