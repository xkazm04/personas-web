"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { MindRun } from "./shared/useMindRun";
import { EXAMPLE_BRAND, TOOL_BRAND } from "./shared/beats";
import PromptText from "./shared/PromptText";

/**
 * The prompt editor as the film's script: the four sample prompts are the
 * scenes (the live section's chips, same rules - locked while a run plays),
 * and the one being played opens to its full sentence at reading size, with
 * the keywords marked as the agent reads them and the intent it detected.
 */
export default function Script({ run }: { run: MindRun }) {
  const shown = run.activeExample ?? 0;
  const idle = run.phase === "idle";
  const parsed = !idle && run.statusOf(0) !== "pending";
  const toolsIn = !idle && run.statusOf(1) !== "pending";
  const status = run.isRunning ? "running" : run.phase === "done" ? "done" : "idle";
  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 p-4 stage:p-[2.2svh]">
      <div className="mb-1 flex items-center justify-between font-mono text-sm">
        <span className="text-foreground">prompt-editor</span>
        <span className="text-brand-emerald">{run.copy.editorStatus[status]}</span>
      </div>
      {run.examples.map((ex, i) => {
        const brand = EXAMPLE_BRAND[i % EXAMPLE_BRAND.length];
        const open = i === shown;
        const pressed = run.activeExample === i;
        return (
          <div
            key={ex.label}
            className="rounded-xl border transition-[border-color,background-color] duration-500"
            style={{ borderColor: open ? tint(brand, pressed ? 45 : 25) : "var(--border-glass)", background: open ? tint(brand, 6) : "transparent" }}
          >
            <button
              type="button"
              aria-pressed={pressed}
              disabled={run.isRunning}
              onClick={() => run.start(i)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-base font-medium text-foreground transition-colors enabled:hover:bg-[rgba(var(--surface-overlay),0.04)] disabled:cursor-default"
            >
              <ex.icon className="h-4 w-4 shrink-0" style={{ color: BRAND_VAR[brand] }} aria-hidden />
              {ex.label}
            </button>
            <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={run.reduced ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3">
                  <PromptText
                    key={run.activeExample ?? "idle"}
                    text={ex.prompt}
                    lit={parsed}
                    reduced={run.reduced}
                    className="text-[clamp(1.2rem,1.75vw,1.75rem)] font-medium leading-snug tracking-tight"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm">
                    <span className="text-muted-dark">{run.copy.intentComment}</span>
                    <span className="font-semibold transition-opacity duration-500" style={{ color: BRAND_VAR.cyan, opacity: parsed ? 1 : 0.35 }}>
                      {ex.intentText}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ex.tools.map((t, k) => (
                      <span
                        key={t.label}
                        className="flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs text-foreground transition-opacity duration-500"
                        style={{ borderColor: tint(TOOL_BRAND[k % 3], 40), opacity: toolsIn ? 1 : 0.35 }}
                      >
                        <t.icon className="h-3 w-3" style={{ color: BRAND_VAR[TOOL_BRAND[k % 3]] }} aria-hidden />
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        );
      })}
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-dark">{run.lab.stylised}</span>
        {run.phase === "done" && (
          <button
            type="button"
            onClick={run.reset}
            className="flex items-center gap-1.5 rounded-full border border-glass-hover px-3 py-1 text-base font-medium text-muted-dark transition-colors hover:border-glass-strong hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {run.copy.reset}
          </button>
        )}
      </div>
    </div>
  );
}
