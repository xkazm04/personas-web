"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { frame } from "../shared/Stage";
import { H, PANEL, RUNS, STRIP, STRIP_RUNS, W, stripX, type Outcome } from "./runs";

/* The top level of V2: today's runs as a strip of capsules (height = duration,
 * colour = outcome). Three can be opened; the open one throws a lit wedge down
 * onto its trace, so the zoom from the fleet into one run reads as one move. */

const { place, fs } = frame(W, H);
export const OUTCOME: Record<Outcome, string> = { ok: BRAND_VAR.emerald, failed: BRAND_VAR.rose, review: BRAND_VAR.amber };

export default function FleetStrip({ run, onOpen, still }: { run: number; onOpen: (i: number) => void; still: boolean }) {
  const c = useTranslation().t.featuresLab.observe.v2;
  const agents = useTranslation().t.observeSection.agents;
  const x = stripX(RUNS[run].slot);
  const wedge = `M${x - 9} ${STRIP.base + 6} L${x + 9} ${STRIP.base + 6} L${PANEL.x + PANEL.w} ${PANEL.y} L${PANEL.x} ${PANEL.y} Z`;

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden fill="none">
        <defs>
          <linearGradient id="ob2-wedge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BRAND_VAR.cyan} stopOpacity={0.3} />
            <stop offset="1" stopColor={BRAND_VAR.cyan} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <motion.path initial={false} animate={{ d: wedge }} transition={{ duration: still ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }} fill="url(#ob2-wedge)" />
        <line x1={STRIP.x0} x2={STRIP.x1} y1={STRIP.base + 1} y2={STRIP.base + 1} stroke="var(--foreground)" strokeOpacity={0.14} />
        {STRIP_RUNS.map((r, i) => {
          const open = RUNS.findIndex((rr) => rr.slot === i);
          const sel = open === run;
          return (
            <g key={i}>
              {open >= 0 && <circle cx={stripX(i)} cy={STRIP.base - r.h - 9} r={sel ? 4 : 3} fill={sel ? "var(--foreground)" : OUTCOME[r.outcome]} />}
            <rect
              x={stripX(i) - (open >= 0 ? 5 : 3.5)}
              y={STRIP.base - r.h}
              width={open >= 0 ? 10 : 7}
              height={r.h}
              rx={4}
              fill={OUTCOME[r.outcome]}
              fillOpacity={sel ? 1 : open >= 0 ? 0.8 : 0.42}
              stroke={sel ? "var(--foreground)" : "none"}
              strokeWidth={1.5}
            />
            </g>
          );
        })}
      </svg>

      <div className="flex flex-col leading-tight" style={{ ...place(0, STRIP.y - 4, STRIP.x0 - 16), ...fs(16, 14) }}>
        <span className="font-bold text-foreground">{c.today}</span>
        <span className="font-mono text-foreground/75">{c.runsToday.replace("{n}", "214")}</span>
      </div>
      <div className="flex items-center justify-end gap-[1.1em] font-mono text-foreground/75" style={{ ...place(STRIP.x0, 0, STRIP.x1 - STRIP.x0), ...fs(13, 12) }}>
        {(["ok", "failed", "review"] as const).map((k) => (
          <span key={k} className="flex items-center gap-[0.4em]">
            <span className="h-[0.7em] w-[0.7em] rounded-full" style={{ backgroundColor: OUTCOME[k] }} />
            {c.legend[k]}
          </span>
        ))}
      </div>
      {RUNS.map((r, i) => {
        const cx = stripX(r.slot);
        return (
          <button
            key={r.id}
            type="button"
            aria-pressed={i === run}
            aria-label={c.openRun.replace("{name}", agents[r.agent])}
            title={agents[r.agent]}
            onClick={() => onOpen(i)}
            className="cursor-pointer rounded-lg transition-colors hover:bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
            style={place(cx - 14, STRIP.base - 54, 28, 60)}
          />
        );
      })}
    </>
  );
}
