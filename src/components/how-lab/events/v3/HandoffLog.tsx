"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { DESKS, LEGS, PHASE_MS } from "./geometry";

const colorOf = (id: string) => {
  const desk = DESKS.find((d) => d.id === id);
  return desk ? BRAND_VAR[desk.brand] : BRAND_VAR.cyan;
};
/** Simulated time a leg starts, in seconds. */
const startOf = (i: number) => PHASE_MS.slice(0, 2 * i).reduce((a, b) => a + b, 0) / 1000;

/**
 * What the hub saw: one row per hand-off, written as it happens - who passed
 * what to whom, and when. The last line is the point: nothing in it was you.
 */
export default function HandoffLog({ phase, run }: { phase: number; run: boolean }) {
  const copy = useTranslation().t.howLab.events.v3;
  const name = (id: string) => (id === "source" ? copy.from : id === "sink" ? copy.to : copy.desks[id as keyof typeof copy.desks]);
  return (
    <div className="flex flex-col justify-center gap-4">
      <p className="font-mono text-sm uppercase tracking-[0.14em] text-muted">{copy.logTitle}</p>
      <ol className="flex flex-col gap-3">
        {LEGS.map((l, i) => {
          const shown = phase >= 2 * i;
          return (
            <motion.li
              key={l.carry}
              initial={false}
              animate={{ opacity: shown ? 1 : 0.4, x: shown ? 0 : -6 }}
              transition={{ duration: run ? 0.35 : 0 }}
              className="grid grid-cols-[3.4rem_minmax(0,1fr)] items-baseline gap-x-3 border-l-2 pl-3"
              style={{ borderColor: shown ? colorOf(l.from) : "var(--border-glass)" }}
            >
              <span className="font-mono text-sm tabular-nums text-muted">+{startOf(i).toFixed(1)}s</span>
              <span className="flex flex-col">
                <span className="flex flex-wrap items-center gap-x-1.5 text-base font-semibold text-foreground">
                  {name(l.from)}
                  <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
                  {name(l.to)}
                </span>
                <span className="text-base text-muted">{copy.capsules[l.carry]}</span>
              </span>
            </motion.li>
          );
        })}
      </ol>
      <p className="flex items-baseline gap-2 border-t border-glass pt-3 font-mono">
        <span className="text-3xl font-semibold text-brand-cyan">0</span>
        <span className="text-base text-muted">{copy.byYou}</span>
      </p>
    </div>
  );
}
