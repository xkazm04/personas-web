"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { frame } from "../shared/Stage";
import { AXIS_Y, BAR, H, HEAD_H, LABEL_X, PANEL, ROWS_Y, W, barScale, rowH, runCost, type Run } from "./runs";
import StepIcon from "./StepIcon";
import { fmtCost, fmtS, stepColor } from "./look";

/* The words of V2's trace: the clickable path (fleet > run > step), the run's
 * running cost and time, the seconds axis, and one button per step row. */

const { place, fs } = frame(W, H);
const crumb = "cursor-pointer rounded-md px-[0.3em] transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan";

/** A seconds label on the axis; it steps aside while the playhead's own clock passes it. */
function Tick({ sec, run, t }: { sec: number; run: Run; t: MotionValue<number> }) {
  const opacity = useTransform(t, (v) => Math.min(1, Math.abs(v * run.total - sec) * barScale(run) / 75));
  return (
    <motion.span className="font-mono text-foreground/70" style={{ ...place(BAR.x0 + sec * barScale(run) - 20, AXIS_Y - 12, 40), ...fs(12, 12), textAlign: "center", opacity }}>
      {sec}s
    </motion.span>
  );
}

export default function WaterfallWords({ run, ri, t, focus, pinned, onPin, onFleet, onReplay }: {
  run: Run;
  ri: number;
  t: MotionValue<number>;
  focus: number;
  pinned: number | null;
  onPin: (i: number) => void;
  onFleet: () => void;
  onReplay: () => void;
}) {
  const c = useTranslation().t.featuresLab.observe.v2;
  const agents = useTranslation().t.observeSection.agents;
  const words = c.runs[run.id];
  const steps = words.steps as Record<string, string>;
  const k = barScale(run);
  const rh = rowH(run);
  const total = runCost(run);
  const spent = useTransform(t, (v) => fmtCost(run.steps.filter((st) => st.at + st.dur <= v * run.total + 0.001).reduce((s, st) => s + st.cost, 0)));
  const clock = useTransform(t, (v) => fmtS(v * run.total));
  const headLeft = useTransform(t, (v) => `${((BAR.x0 + v * run.total * k - 30) / W) * 100}%`);
  const ticks = Array.from({ length: Math.floor(run.total) + 1 }, (_, s) => s).filter((s) => run.total < 5 || s % 2 === 0);

  return (
    <>
      <div className="flex items-center gap-[0.2em] font-semibold text-foreground/75" style={{ ...place(PANEL.x + 14, PANEL.y + 10, 520, HEAD_H - 20), ...fs(16, 14) }}>
        <button type="button" onClick={onFleet} className={crumb}>{c.fleet}</button>
        <ChevronRight className="h-[1em] w-[1em] shrink-0 opacity-60" aria-hidden />
        <button type="button" onClick={onReplay} className={`${crumb} whitespace-nowrap`}>
          {agents[run.agent]} <span className="font-mono font-normal text-foreground/70">{words.id}</span>
        </button>
        <ChevronRight className="h-[1em] w-[1em] shrink-0 opacity-60" aria-hidden />
        <span className="whitespace-nowrap text-brand-cyan">{steps[run.steps[focus].key]}</span>
      </div>
      <div className="flex items-baseline justify-end gap-[0.9em] font-mono tabular-nums" style={{ ...place(PANEL.x + 520, PANEL.y + 10, PANEL.w - 540, HEAD_H - 20), ...fs(16, 14) }}>
        <span className="text-foreground/70">{c.stats.cost}</span>
        <span className="font-bold text-foreground">
          <motion.span>{spent}</motion.span>
          <span className="text-foreground/60"> / {fmtCost(total)}</span>
        </span>
      </div>

      {ticks.map((s) => (
        <Tick key={`${ri}-${s}`} sec={s} run={run} t={t} />
      ))}
      <motion.span className="rounded-md bg-brand-cyan px-[0.35em] text-center font-mono font-bold text-background" style={{ position: "absolute", top: `${((AXIS_Y - 13) / H) * 100}%`, left: headLeft, width: `${(60 / W) * 100}%`, ...fs(13, 12) }}>
        {clock}
      </motion.span>

      {run.steps.map((st, i) => {
              const on = i === focus;
        return (
          <button
            key={`${run.id}-${st.key}`}
            type="button"
            aria-pressed={pinned === i}
            onClick={() => onPin(i)}
            className={`flex cursor-pointer items-center gap-[0.6em] rounded-lg px-[0.5em] text-left transition-colors hover:bg-foreground/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${on ? "text-foreground" : "text-foreground/80"}`}
            style={{ ...place(LABEL_X - 8, ROWS_Y + i * rh + 2, BAR.x0 - LABEL_X - 4, rh - 4), ...fs(16, 14) }}
          >
            <span className="flex h-[1.5em] w-[1.5em] shrink-0 items-center justify-center rounded-md" style={{ color: stepColor(st), backgroundColor: `color-mix(in srgb, ${stepColor(st)} 14%, transparent)` }}>
              <StepIcon st={st} className="h-[0.95em] w-[0.95em]" />
            </span>
            <span className={`whitespace-nowrap ${on ? "font-semibold" : ""}`}>{steps[st.key]}</span>
          </button>
        );
      })}
    </>
  );
}
