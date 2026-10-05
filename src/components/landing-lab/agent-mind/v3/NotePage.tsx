"use client";

import { motion } from "framer-motion";
import { tokenizePrompt } from "@/components/sections/playground-split/components/SyntaxPrompt";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { MindRun } from "../shared/useMindRun";
import { DIMENSIONS, TOOL_BRAND } from "../shared/beats";
import { SERIF } from "./Caption";

/**
 * The prompt editor as the facing page: the request written out as a quote,
 * its keywords underlined by hand as the agent reads them, then the intent,
 * the tools stamped onto the page, and - once the drawing is finished - the
 * four things that came back.
 */
export default function NotePage({ run }: { run: MindRun }) {
  const { example: ex, reduced } = run;
  const idle = run.phase === "idle";
  const read = !idle && run.statusOf(0) !== "pending";
  const intent = !idle && run.statusOf(0) === "done";
  const stamped = !idle && run.statusOf(1) !== "pending";
  const done = run.phase === "done";
  const status = run.isRunning ? "running" : done ? "done" : "idle";
  const t = (delay: number) => (reduced ? "none" : `all 500ms ease-out ${delay}ms`);
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-5 stage:gap-[1.8svh] stage:p-[2.4svh]">
      <div className="flex items-center justify-between font-mono text-sm">
        <span className="text-foreground">prompt-editor</span>
        <span className="text-brand-emerald">{run.copy.editorStatus[status]}</span>
      </div>
      <p className="text-[clamp(1.25rem,1.8vw,1.8rem)] italic leading-snug text-foreground" style={SERIF}>
        {"“"}
        {tokenizePrompt(ex.prompt).map((p, i) =>
          p.keyword ? (
            <span
              key={i}
              style={{
                textDecorationLine: "underline",
                textDecorationStyle: "wavy",
                textDecorationThickness: "2px",
                textUnderlineOffset: "5px",
                textDecorationColor: read ? BRAND_VAR.cyan : "transparent",
                transition: t(i * 60),
              }}
            >
              {p.text}
            </span>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
        {"”"}
      </p>
      <div className="font-mono text-base" style={{ color: BRAND_VAR.cyan, opacity: intent ? 1 : 0, transition: t(0) }}>
        {"→"} {ex.intentText}
      </div>
      <div className="flex flex-wrap gap-2">
        {ex.tools.map((tool, i) => {
          const b = TOOL_BRAND[i % TOOL_BRAND.length];
          return (
            <span
              key={tool.label}
              className="flex items-center gap-1.5 rounded-md border-2 px-2 py-0.5 font-mono text-sm font-semibold uppercase tracking-wider"
              style={{
                borderColor: tint(b, 60),
                color: BRAND_VAR[b],
                opacity: stamped ? 1 : 0.3,
                transform: stamped || reduced ? `rotate(${i % 2 ? 2 : -2}deg) scale(1)` : "rotate(0deg) scale(1.3)",
                transition: t(150 + i * 160),
              }}
            >
              <tool.icon className="h-3.5 w-3.5" aria-hidden />
              {tool.label}
            </span>
          );
        })}
      </div>
      <div className="mt-auto border-t border-dashed border-glass-strong pt-3">
        <div className="mb-2 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: done ? BRAND_VAR.emerald : "var(--muted-dark)" }}>
          {run.lab.outcomeTitle}
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {DIMENSIONS.map((d, i) => (
            <li key={d.key} className="min-w-0">
              <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em]" style={{ color: BRAND_VAR[d.brand] }}>
                <d.icon className="h-3.5 w-3.5" aria-hidden />
                {run.copy.dimensions[d.key]}
              </div>
              <motion.p
                className="line-clamp-2 text-base leading-snug text-foreground"
                initial={false}
                animate={{ opacity: done ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, delay: done ? 0.2 + i * 0.15 : 0 }}
              >
                {ex.result[d.key]}
              </motion.p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
