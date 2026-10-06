"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { ToolMark, frame } from "./shared/Stage";
import { AGENTS, H, LH, LINES, N, PRINT, STEP_S, TAPE, W, lineTime, paperPos, type Stamp } from "./log";

/* The record of V3: a paper tape rising out of the printer, one line per run
 * (time, tool, what it did, what it cost). Failures, recoveries and sign-offs
 * are stamped onto their line as it comes out. */

const { place, fs } = frame(W, H);
const STAMP: Record<Stamp, string> = { failed: BRAND_VAR.rose, retried: BRAND_VAR.emerald, approved: BRAND_VAR.emerald, needsYou: BRAND_VAR.amber };
const pct = (v: number) => `${(v / TAPE.h) * 100}%`;

function TapeLine({ j, copy, clock, dim }: { j: number; copy: number; clock: MotionValue<number>; dim: boolean }) {
  const c = useTranslation().t.featuresSections.observe.v3;
  const line = LINES[j];
  const abs = (s: number) => (Math.floor(Math.floor(s / STEP_S) / N) + copy) * N + j;
  const time = useTransform(clock, (s) => lineTime(abs(s)));
  const since = useTransform(clock, (s) => (s - abs(s) * STEP_S - PRINT * STEP_S) / 0.4);
  const scale = useTransform(since, (v) => 1.7 - 0.7 * Math.min(1, Math.max(0, v)));
  const opacity = useTransform(since, (v) => Math.min(1, Math.max(0, v * 2.5)));
  const brand = BRAND_VAR[AGENTS[line.agent].brand];
  return (
    <div
      className="absolute left-0 flex items-center gap-[0.6em] border-b border-dashed border-foreground/15 pl-[0.8em] pr-[1em]"
      style={{ width: `${(TAPE.w / (TAPE.w + TAPE.margin)) * 100}%`, top: pct(TAPE.h + (j + copy * N) * LH), height: pct(LH), opacity: dim ? 0.22 : 1, transition: "opacity 300ms" }}
    >
      <span className="h-[1.3em] w-[3px] shrink-0 rounded-full" style={{ backgroundColor: brand }} />
      <motion.span className="w-[3.1em] shrink-0 font-mono text-foreground/70" style={{ fontSize: "max(12px, 0.85em)" }}>{time}</motion.span>
      <ToolMark icon={line.tool} className="h-[1.05em] w-[1.05em] shrink-0 text-foreground/85" />
      <span className="min-w-0 flex-1 whitespace-nowrap text-foreground">{c.lines[line.key]}</span>
      <span className="font-mono tabular-nums text-foreground/85">${line.cost.toFixed(2)}</span>
      {line.stamp && (
        <motion.span
          className="absolute top-1/2 whitespace-nowrap rounded-md border-2 px-[0.4em] font-mono font-bold uppercase tracking-wide"
          style={{ left: `calc(100% + ${(14 / TAPE.w) * 100}%)`, color: STAMP[line.stamp], borderColor: STAMP[line.stamp], backgroundColor: `color-mix(in srgb, ${STAMP[line.stamp]} 12%, var(--background))`, fontSize: "max(12px, 0.8em)", y: "-50%", rotate: -6, scale, opacity }}
        >
          {c.stamps[line.stamp]}
        </motion.span>
      )}
    </div>
  );
}

export default function Tape({ clock, agent }: { clock: MotionValue<number>; agent: number | null }) {
  const y = useTransform(clock, (s) => `${(-paperPos(s) * LH * 100) / TAPE.h}%`);
  const fade = "linear-gradient(to bottom, transparent 0%, black 22%)";
  return (
    <div className="overflow-hidden" style={{ ...place(TAPE.x, 0, TAPE.w + TAPE.margin, TAPE.h), ...fs(16, 14), maskImage: fade, WebkitMaskImage: fade }}>
      <div
        className="absolute inset-y-0 left-0 border-x border-glass"
        style={{
          width: `${(TAPE.w / (TAPE.w + TAPE.margin)) * 100}%`,
          background: "linear-gradient(to right, color-mix(in srgb, var(--foreground) 5%, var(--background)), color-mix(in srgb, var(--foreground) 9%, var(--background)) 50%, color-mix(in srgb, var(--foreground) 5%, var(--background)))",
          boxShadow: "0 0 40px color-mix(in srgb, var(--brand-emerald) 10%, transparent)",
        }}
      />
      <motion.div className="absolute inset-0" style={{ y }}>
        {[-1, 0].map((copy) =>
          LINES.map((l, j) => <TapeLine key={`${copy}-${j}`} j={j} copy={copy} clock={clock} dim={agent !== null && l.agent !== agent} />),
        )}
      </motion.div>
    </div>
  );
}
