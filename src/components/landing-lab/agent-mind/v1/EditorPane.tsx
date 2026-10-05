"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { MindRun } from "../shared/useMindRun";
import { TOOL_BRAND } from "../shared/beats";
import PromptText from "../shared/PromptText";
import ResultGrid from "./ResultGrid";

/**
 * The live prompt editor, staged against the mind: the keywords are
 * highlighted as the agent reads them, the detected intent unrolls once the
 * parse lands, each tool chip lights while its node works, and the result
 * card rises when the run completes.
 */
export default function EditorPane({ run }: { run: MindRun }) {
  const { copy, example, reduced } = run;
  const idle = run.phase === "idle";
  const parsed = !idle && run.statusOf(0) !== "pending";
  const intentShown = !idle && run.statusOf(0) === "done";
  const toolsShown = !idle && run.statusOf(1) !== "pending";
  const toolState = run.statusOf(2);
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0.45, y: on || reduced ? 0 : 4 });
  const tr = (delay = 0) => (reduced ? { duration: 0 } : { duration: 0.4, delay, ease: "easeOut" as const });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 stage:gap-[1.3svh] stage:p-[1.8svh]">
      <div data-am-prompt className="flex gap-4 rounded-xl border border-glass bg-[rgba(var(--surface-overlay),0.025)] px-4 py-3 shadow-[inset_0_1px_0_rgba(var(--surface-overlay),0.05)]">
        <div aria-hidden className="select-none font-mono text-sm leading-[1.75] text-text-secondary">
          {[1, 2, 3, 4].map((n) => <div key={n}>{n}</div>)}
        </div>
        <div className="min-w-0 flex-1 font-mono">
          <PromptText
            key={run.activeExample ?? "idle"}
            text={example.prompt}
            lit={parsed}
            reduced={reduced}
            className="text-[clamp(1rem,1.25vw,1.2rem)] leading-normal"
          />
          <div className="mt-1.5 text-sm leading-[1.75] text-muted-dark">{copy.intentComment}</div>
          <motion.div
            className="overflow-hidden whitespace-nowrap text-base font-semibold"
            style={{ color: BRAND_VAR.cyan }}
            initial={false}
            animate={{ clipPath: intentShown ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
          >
            {example.intentText}
          </motion.div>
        </div>
      </div>

      <motion.div initial={false} animate={fade(toolsShown)} transition={tr()} className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-dark">{copy.selectedTools}</span>
        {example.tools.map((tool, i) => {
          const brand = toolState === "done" ? "emerald" : TOOL_BRAND[i % TOOL_BRAND.length];
          const lit = toolsShown && toolState !== "pending";
          return (
            <span
              key={tool.label}
              data-am-chip={i}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-sm text-foreground transition-[border-color,background-color,box-shadow] duration-500"
              style={{
                borderColor: lit ? tint(brand, 50) : "var(--border-glass-hover)",
                background: lit ? tint(brand, 10) : "rgba(var(--surface-overlay), 0.03)",
                boxShadow: toolState === "active" ? `0 0 16px ${tint(brand, 35)}` : "none",
              }}
            >
              {toolState === "done" ? (
                <Check className="h-3.5 w-3.5" style={{ color: BRAND_VAR.emerald }} aria-hidden />
              ) : (
                <tool.icon className="h-3.5 w-3.5" style={{ color: BRAND_VAR[brand] }} aria-hidden />
              )}
              {tool.label}
            </span>
          );
        })}
      </motion.div>

      <ResultGrid run={run} />
      <p className="-mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-dark">{run.lab.stylised}</p>
    </div>
  );
}
