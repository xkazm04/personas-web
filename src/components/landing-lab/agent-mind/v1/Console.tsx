"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import TerminalChrome from "@/components/TerminalChrome";
import { RunTimer } from "@/components/sections/playground-split/components/RunClock";
import { useIsVisible } from "@/hooks/useIsVisible";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { BEATS, type MindRun } from "../shared/useMindRun";
import { BEAT_BRAND } from "../shared/beats";
import EditorPane from "./EditorPane";
import MindGraph from "./MindGraph";
import FocusCaption from "./FocusCaption";
import Beam from "./Beam";

const statusKey = (run: MindRun) => (run.isRunning ? "running" : run.phase === "done" ? "done" : "idle");

/** The two-pane console of the live section, lit and layered. */
export default function Console({ run }: { run: MindRun }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useIsVisible(ref) && !run.reduced;
  const idle = run.phase === "idle";
  return (
    <div
      ref={ref}
      className="relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-glass-hover"
      style={{
        background: "color-mix(in srgb, var(--background) 94%, var(--brand-cyan))",
        boxShadow: `0 1px 0 rgba(var(--surface-overlay),0.08) inset, 0 40px 100px -40px ${tint("cyan", 35)}, 0 24px 60px -30px color-mix(in srgb, var(--background) 90%, transparent)`,
      }}
    >
      {/* Beat rail: the live progress bar, cut into the six beats. */}
      <div className="flex gap-1 px-1 pt-1" role="progressbar" aria-label={run.copy.progressLabel} aria-valuemin={0} aria-valuemax={BEATS.length} aria-valuenow={idle ? 0 : run.step + (run.stepDone ? 1 : 0)}>
        {BEATS.map((b, i) => {
          const st = idle ? "pending" : run.statusOf(i);
          return (
            <div key={b} className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(var(--surface-overlay),0.06)]">
              <motion.div
                className="h-full origin-left rounded-full"
                style={{ background: st === "done" ? BRAND_VAR.emerald : BRAND_VAR[BEAT_BRAND[b]], boxShadow: st === "active" ? `0 0 10px ${tint(BEAT_BRAND[b], 70)}` : "none" }}
                initial={false}
                animate={{ scaleX: st === "done" ? 1 : st === "active" ? 0.7 : 0 }}
                transition={run.reduced ? { duration: 0 } : { duration: st === "active" ? 0.6 : 0.25, ease: "easeOut" }}
              />
            </div>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="flex min-h-0 flex-col border-b border-glass lg:border-b-0 lg:border-r">
          <TerminalChrome title="prompt-editor" status={run.copy.editorStatus[statusKey(run)]} className="px-4 py-2.5" />
          <EditorPane run={run} />
        </div>
        <div className="flex min-h-0 flex-col">
          <TerminalChrome
            title="agent-mind"
            status={run.copy.mindStatus[statusKey(run)]}
            info={idle ? undefined : <RunTimer startedAt={run.startedAt} running={run.isRunning} totalMs={run.totalMs} done={run.phase === "done"} />}
            className="px-4 py-2.5"
          />
          <div
            role="img"
            aria-label={run.lab.illustration}
            className="relative min-h-[360px] flex-1 [background-image:radial-gradient(rgba(var(--surface-overlay),0.07)_1px,transparent_1px)] [background-size:22px_22px] stage:min-h-0"
          >
            <div className="absolute inset-x-[4%] inset-y-[5%]">
              <MindGraph run={run} live={live} />
            </div>
          </div>
          <FocusCaption run={run} />
        </div>
      </div>
      <Beam run={run} rootRef={ref} live={live} />
      <p className="sr-only" role="status" aria-live="polite">
        {run.isRunning ? run.copy.srRunning : run.phase === "done" ? run.copy.srDone : ""}
      </p>
    </div>
  );
}
