"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { StylisedTag, frame } from "../shared/Stage";
import { AGENTS, H, STATEMENT, W, printed, sumLines } from "./log";

/* The right of V3: the day's statement, kept by the record as it prints -
 * total spend, runs, failures caught, sign-offs, and spend per agent. */

const { place, fs } = frame(W, H);
const BASE = { runs: 196, failures: 2, approvals: 3 };
const spendOf = (i: number, s: number) => AGENTS[i].baseSpend + sumLines(printed(s), (l) => (l.agent === i ? l.cost : 0));
const maxSpend = (s: number) => Math.max(...AGENTS.map((_, i) => spendOf(i, s)));

function Stat({ label, value, color }: { label: string; value: MotionValue<string>; color?: string }) {
  return (
    <div className="flex flex-col justify-center rounded-xl border border-glass bg-foreground/[0.03] px-[0.7em]">
      <motion.span className="font-mono font-bold tabular-nums leading-none text-foreground" style={{ fontSize: "1.75em", color }}>{value}</motion.span>
      <span className="mt-[0.35em] leading-tight text-foreground/75" style={{ fontSize: "max(12px, 0.8em)" }}>{label}</span>
    </div>
  );
}

function AgentBar({ i, clock, dim }: { i: number; clock: MotionValue<number>; dim: boolean }) {
  const name = useTranslation().t.observeSection.agents[AGENTS[i].id];
  const width = useTransform(clock, (s) => `${(spendOf(i, s) / maxSpend(s)) * 100}%`);
  const value = useTransform(clock, (s) => `$${spendOf(i, s).toFixed(2)}`);
  const c = BRAND_VAR[AGENTS[i].brand];
  return (
    <div className="transition-opacity duration-300" style={{ opacity: dim ? 0.3 : 1 }}>
      <div className="flex items-baseline justify-between" style={{ fontSize: "max(12px, 0.85em)" }}>
        <span className="font-medium text-foreground/85">{name}</span>
        <motion.span className="font-mono tabular-nums text-foreground/80">{value}</motion.span>
      </div>
      <div className="mt-[0.25em] h-[0.45em] rounded-full bg-foreground/[0.07]">
        <motion.div className="h-full rounded-full" style={{ width, backgroundColor: c, boxShadow: `0 0 10px color-mix(in srgb, ${c} 45%, transparent)` }} />
      </div>
    </div>
  );
}

export default function Statement({ clock, agent }: { clock: MotionValue<number>; agent: number | null }) {
  const c = useTranslation().t.featuresLab.observe.v3;
  const spend = useTransform(clock, (s) => `$${AGENTS.reduce((sum, _, i) => sum + spendOf(i, s), 0).toFixed(2)}`);
  const runs = useTransform(clock, (s) => String(BASE.runs + printed(s)));
  const failures = useTransform(clock, (s) => String(BASE.failures + sumLines(printed(s), (l) => (l.stamp === "failed" ? 1 : 0))));
  const approvals = useTransform(clock, (s) => String(BASE.approvals + sumLines(printed(s), (l) => (l.stamp === "approved" ? 1 : 0))));

  return (
    <div className="flex flex-col" style={{ ...place(STATEMENT.x, 0, STATEMENT.w, H), ...fs(17, 14) }}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-foreground" style={{ fontSize: "1.2em" }}>{c.statement.title}</span>
        <StylisedTag style={{ fontSize: "max(12px, 0.7em)" }} />
      </div>
      <span className="mt-[0.9em] font-mono uppercase tracking-wider text-foreground/70" style={{ fontSize: "max(12px, 0.75em)" }}>{c.statement.spend}</span>
      <motion.span className="font-mono font-extrabold tabular-nums leading-none text-brand-emerald" style={{ fontSize: "3.2em" }}>{spend}</motion.span>
      <div className="mt-[1em] grid grid-cols-3 gap-[0.5em]" style={{ height: "5.2em" }}>
        <Stat label={c.statement.runs} value={runs} />
        <Stat label={c.statement.failures} value={failures} color={BRAND_VAR.rose} />
        <Stat label={c.statement.approvals} value={approvals} color={BRAND_VAR.amber} />
      </div>
      <span className="mt-[1.3em] font-mono uppercase tracking-wider text-foreground/70" style={{ fontSize: "max(12px, 0.75em)" }}>{c.statement.byAgent}</span>
      <div className="mt-[0.6em] flex flex-1 flex-col justify-between pb-[0.4em]">
        {AGENTS.map((a, i) => (
          <AgentBar key={a.id} i={i} clock={clock} dim={agent !== null && agent !== i} />
        ))}
      </div>
    </div>
  );
}
