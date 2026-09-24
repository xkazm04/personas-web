"use client";

import { motion } from "framer-motion";
import { CircleCheck, RotateCcw } from "lucide-react";
import { BRAND_VAR, STATE_COLORS, tint } from "@/lib/brand-theme";
import { BARS, DONE_STEP, PERSONA, RESULT, STAGES, TOTAL_MS, formatMs } from "./CommandCenterIllustration.persona-card.data";
import { stageState, type StageState } from "./CommandCenterIllustration.persona-card.run";

const RUNNING = BRAND_VAR.blue;

/** The app's PipelineDots: one dot per stage, emerald done, blue in flight. */
function PipelineDots({ step }: { step: number }) {
  return (
    <span aria-hidden className="flex items-center gap-1">
      {STAGES.map((s, i) => {
        const state = stageState(step, i);
        return (
          <span
            key={s.key}
            className={`h-2 w-2 rounded-full${state === "active" ? " motion-safe:animate-pulse" : ""}`}
            style={{
              background: state === "done" ? STATE_COLORS.success : state === "active" ? RUNNING : "rgba(var(--surface-overlay), 0.14)",
            }}
          />
        );
      })}
    </span>
  );
}

/** One row of the app's execution waterfall (StageBar), reduced. */
function StageRow({ index, state }: { index: number; state: StageState }) {
  const stage = STAGES[index];
  const bar = BARS[index];
  return (
    <li className="grid h-[14px] grid-cols-[120px_1fr_40px] items-center gap-2">
      <span className="truncate text-xs leading-none text-muted">
        <span aria-hidden className="mr-1.5 font-mono text-muted-dark">{index + 1}</span>
        {stage.label}
      </span>
      <span aria-hidden className="relative h-2 rounded-full bg-white/[0.04]">
        <motion.span
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${bar.left}%`,
            width: `${bar.width}%`,
            minWidth: 3,
            originX: 0,
            background: `linear-gradient(90deg, ${tint("cyan", 55)}, ${BRAND_VAR.cyan})`,
          }}
          initial={false}
          animate={{ scaleX: state === "pending" ? 0 : 1 }}
          transition={state === "active" ? { duration: stage.beat / 1000, ease: "linear" } : { duration: 0 }}
        />
      </span>
      <span
        className="text-right font-mono text-xs leading-none tabular-nums text-muted-dark transition-opacity duration-200"
        style={{ opacity: state === "done" ? 1 : 0 }}
      >
        {formatMs(stage.ms)}
      </span>
    </li>
  );
}

export function RunPanel({ step, reduced, onReplay }: { step: number; reduced: boolean; onReplay: () => void }) {
  const done = step >= DONE_STEP;
  const activeStage = STAGES[step - 1];
  const runningLine = step === 0 ? `Trigger fired: ${PERSONA.trigger}` : (activeStage?.simple ?? "");

  return (
    <div className="rounded-xl border border-glass bg-white/[0.02] px-3 py-2">
      <div className="flex h-5 items-center gap-2">
        <span className="text-xs font-medium text-foreground/85">Latest run</span>
        <PipelineDots step={step} />
        <span className="ml-auto flex items-center gap-1.5 text-xs">
          {done ? (
            <>
              <CircleCheck aria-hidden className="h-3.5 w-3.5" style={{ color: STATE_COLORS.success }} />
              <span className="text-foreground/85">Completed</span>
              <span className="font-mono tabular-nums text-muted">{formatMs(TOTAL_MS)}</span>
            </>
          ) : (
            <span style={{ color: RUNNING }}>Running</span>
          )}
          {!reduced && (
            <button
              type="button"
              onClick={onReplay}
              disabled={!done}
              aria-label="Replay this run"
              title="Replay this run"
              className="ml-1 grid h-5 w-5 place-items-center rounded-md border border-glass text-muted transition-opacity duration-200 hover:border-glass-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 disabled:pointer-events-none"
              style={{ opacity: done ? 1 : 0 }}
            >
              <RotateCcw aria-hidden className="h-3 w-3" />
            </button>
          )}
        </span>
      </div>

      <ol aria-label="Execution stages, in order" className="mt-1.5 flex flex-col gap-[2px]">
        {STAGES.map((s, i) => (
          <StageRow key={s.key} index={i} state={stageState(step, i)} />
        ))}
      </ol>

      {/* Result line; the running line and the result share one reserved box. */}
      <div className="relative mt-1.5 h-[18px] border-t border-glass pt-1.5">
        <p
          className="absolute inset-x-0 top-1.5 flex items-center gap-1.5 truncate text-xs leading-none text-foreground/85 transition-opacity duration-300"
          style={{ opacity: done ? 1 : 0 }}
          aria-hidden={!done}
        >
          <CircleCheck aria-hidden className="h-3 w-3 shrink-0" style={{ color: STATE_COLORS.success }} />
          {RESULT.join(" · ")}
        </p>
        <p
          className="absolute inset-x-0 top-1.5 truncate font-mono text-xs leading-none text-muted transition-opacity duration-200"
          style={{ opacity: done ? 0 : 1 }}
          aria-hidden={done}
        >
          {runningLine}
        </p>
      </div>
    </div>
  );
}
