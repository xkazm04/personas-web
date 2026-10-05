"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { beat } from "../shared/motion";
import { frame } from "../shared/Frame";
import { H, LEDGER, PH, RETRIES, RUNS, W, rowAnchor, rowY, runAt } from "./schedule";

/* The HTML half of V2's right column: one button per run (pick one to see the
 * memory as it stood after that run) and the phase words that travel with the
 * current run. */

const { place, fs } = frame(W, H);
const activeRun = (p: number) => Math.min(RUNS, Math.max(1, Math.ceil(p)));

function Row({ k, p, onPick }: { k: number; p: MotionValue<number>; onPick: (k: number) => void }) {
  const c = useTranslation().t.featuresLab.memory.v2;
  const n = RETRIES[k - 1];
  const opacity = useTransform(p, (v) => (v > k - 1 ? 1 : 0.6));
  const result = useTransform(p, (v) => beat(v, k - 1 + PH.run[0], k - 1 + PH.run[1]));
  const on = useTransform(p, (v) => activeRun(v) === k);
  const bg = useTransform(on, (o) => (o ? tint("cyan", 12) : tint("cyan", 0)));
  const border = useTransform(on, (o) => (o ? tint("cyan", 60) : "var(--color-glass)"));
  return (
    <motion.button
      type="button"
      onClick={() => onPick(k)}
      aria-label={c.pick.replace("{n}", String(k))}
      className="absolute flex items-center justify-between gap-3 whitespace-nowrap rounded-2xl border px-5 text-left transition-colors hover:border-glass-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
      style={{ ...place(LEDGER.x, rowY(k), LEDGER.w), height: `${(LEDGER.rowH / H) * 100}%`, opacity, backgroundColor: bg, borderColor: border }}
    >
      <span className="font-bold tracking-tight text-foreground" style={fs(22, 16)}>
        {c.run.replace("{n}", String(k))}
      </span>
      <motion.span className="flex items-center gap-1.5" style={{ opacity: result }}>
        {n > 0 ? (
          <>
            <span className="flex gap-1" aria-hidden>
              {Array.from({ length: n }, (_, i) => (
                <span key={i} className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BRAND_VAR.rose }} />
              ))}
            </span>
            <span className="font-semibold" style={{ ...fs(17, 14), color: BRAND_VAR.rose }}>
              {n === 1 ? c.oneRetry : c.retries.replace("{n}", String(n))}
            </span>
          </>
        ) : (
          <>
            <Check className="h-4 w-4" style={{ color: BRAND_VAR.emerald }} aria-hidden />
            <span className="font-semibold" style={{ ...fs(17, 14), color: BRAND_VAR.emerald }}>
              {c.firstTry}
            </span>
          </>
        )}
      </motion.span>
    </motion.button>
  );
}

function PhaseWord({ p, phase, label, color }: { p: MotionValue<number>; phase: "recall" | "learn"; label: string; color: string }) {
  const [s, e] = PH[phase];
  const opacity = useTransform(p, (v) => {
    const { f } = runAt(v);
    return v >= RUNS ? 0 : Math.sin(beat(f, s, e + 0.08) * Math.PI);
  });
  const top = useTransform(p, (v) => `${((rowAnchor(runAt(v).k).y - (phase === "recall" ? 40 : -14)) / H) * 100}%`);
  return (
    <motion.span
      aria-hidden
      className="absolute whitespace-nowrap font-mono font-semibold uppercase tracking-[0.16em]"
      style={{ left: `${(800 / W) * 100}%`, top, opacity, color, ...fs(15, 12) }}
    >
      {label}
    </motion.span>
  );
}

export default function Ledger({ p, onPick }: { p: MotionValue<number>; onPick: (k: number) => void }) {
  const c = useTranslation().t.featuresLab.memory.v2;
  return (
    <>
      {Array.from({ length: RUNS }, (_, i) => (
        <Row key={i} k={i + 1} p={p} onPick={onPick} />
      ))}
      <PhaseWord p={p} phase="recall" label={c.recall} color={BRAND_VAR.purple} />
      <PhaseWord p={p} phase="learn" label={c.learn} color={BRAND_VAR.emerald} />
    </>
  );
}
