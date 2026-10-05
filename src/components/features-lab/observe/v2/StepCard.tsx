"use client";

import { AnimatePresence, motion, useTransform, type MotionValue } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR } from "@/lib/brand-theme";
import { StylisedTag, frame } from "../shared/Stage";
import { CARD, H, W, type Run } from "./runs";
import StepIcon from "./StepIcon";
import { fmtCost, fmtS, fmtTokens, stepColor } from "./look";

/* The deepest level of V2: the step in focus, as a card - what it was, how it
 * ended, what it took and cost - and where its time sits in the whole run. */

const { place, fs } = frame(W, H);

/** The step's outcome; while the playhead is still on (or before) it, it reads as running (or queued). */
function StatusChip({ run, focus, t, final, color }: { run: Run; focus: number; t: MotionValue<number>; final: string; color: string }) {
  const c = useTranslation().t.featuresLab.observe.v2.status;
  const st = run.steps[focus];
  const label = useTransform(t, (v) => {
    const sec = v * run.total;
    if (v >= 1 || sec >= st.at + st.dur) return final;
    return sec < st.at ? c.queued : c.running;
  });
  return (
    <motion.span className="rounded-full px-[0.7em] py-[0.15em] font-bold" style={{ color, backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)` }}>
      {label}
    </motion.span>
  );
}

export default function StepCard({ run, focus, pinned, still, t }: { run: Run; focus: number; pinned: boolean; still: boolean; t: MotionValue<number> }) {
  const c = useTranslation().t.featuresLab.observe.v2;
  const words = c.runs[run.id];
  const steps = words.steps as Record<string, string>;
  const notes = words.notes as Record<string, string>;
  const st = run.steps[focus];
  const col = stepColor(st);
  const status = st.status === "ok" && st.kind === "trigger" ? null : c.status[st.status];
  const stats = [
    { k: c.stats.duration, v: fmtS(st.dur) },
    { k: c.stats.cost, v: fmtCost(st.cost) },
    { k: c.stats.tokens, v: fmtTokens(st.tokens) },
  ];

  return (
    <div
      className="flex flex-col rounded-[1.25em] border border-glass bg-background/85 p-[1.3em] backdrop-blur-sm"
      style={{ ...place(CARD.x, CARD.y, CARD.w, CARD.h), ...fs(16, 14), boxShadow: `0 0 50px color-mix(in srgb, ${col} 16%, transparent), inset 0 1px 0 color-mix(in srgb, ${col} 35%, transparent)` }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${run.id}-${st.key}`}
          initial={{ opacity: 0, y: still ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: still ? 0 : -6 }}
          transition={{ duration: still ? 0 : 0.25 }}
          className="flex min-h-0 flex-1 flex-col pb-[1.2em]"
        >
          <div className="flex flex-wrap items-center gap-[0.5em] font-mono uppercase tracking-wider" style={{ fontSize: "max(12px, 0.8em)" }}>
            <span className="rounded-full border border-glass px-[0.7em] py-[0.15em] text-foreground/80">{c.kinds[st.kind]}</span>
            {status && <StatusChip run={run} focus={focus} t={t} final={status} color={col} />}
          </div>
          <div className="mt-[0.9em] flex items-center gap-[0.7em]">
            <span className="flex h-[3em] w-[3em] shrink-0 items-center justify-center rounded-xl" style={{ color: col, backgroundColor: `color-mix(in srgb, ${col} 16%, transparent)` }}>
              <StepIcon st={st} className="h-[1.6em] w-[1.6em]" />
            </span>
            <span className="font-bold leading-tight text-foreground" style={{ fontSize: "1.55em" }}>{steps[st.key]}</span>
          </div>
          <span className="mt-[0.5em] font-mono text-foreground/70" style={{ fontSize: "max(12px, 0.85em)" }}>
            {c.position.replace("{i}", String(focus + 1)).replace("{n}", String(run.steps.length)).replace("{t}", fmtS(st.at))}
          </span>
          <p className="my-auto border-l-[3px] py-[0.2em] pl-[0.8em] leading-snug text-foreground/90" style={{ fontSize: "1.3em", borderColor: col }}>
            {notes[st.key]}
          </p>
          <dl className="grid grid-cols-3 gap-[0.5em]">
            {stats.map((s) => (
              <div key={s.k} className="rounded-xl border border-glass bg-foreground/[0.03] px-[0.7em] py-[0.6em]">
                <dt className="text-foreground/70" style={{ fontSize: "max(12px, 0.8em)" }}>{s.k}</dt>
                <dd className="mt-[0.15em] font-mono font-bold tabular-nums text-foreground" style={{ fontSize: "1.4em" }}>{s.v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </AnimatePresence>

      <div>
        <div className="mb-[0.4em] flex items-baseline justify-between text-foreground/70" style={{ fontSize: "max(12px, 0.8em)" }}>
          <span className="font-mono uppercase tracking-wider">{c.timeByStep}</span>
          <span className="font-mono">{fmtS(run.total)}</span>
        </div>
        <div className="flex h-[0.8em] gap-[2px] overflow-hidden rounded-full">
          {run.steps.map((s, i) => (
            <span
              key={s.key}
              className="h-full transition-opacity duration-300"
              style={{ flexGrow: Math.max(0.15, s.dur), backgroundColor: stepColor(s), opacity: i === focus ? 1 : 0.3 }}
            />
          ))}
        </div>
        <div className="mt-[0.7em] flex items-center justify-between gap-[0.6em]">
          <span className="text-foreground/75" style={{ fontSize: "max(12px, 0.85em)", color: pinned ? BRAND_VAR.cyan : undefined }}>{pinned ? c.hintPinned : c.hintFollow}</span>
          <StylisedTag style={{ fontSize: "max(12px, 0.75em)" }} className="shrink-0" />
        </div>
      </div>
    </div>
  );
}
