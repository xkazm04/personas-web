"use client";

import { AnimatePresence, motion } from "framer-motion";
import TerminalChrome from "@/components/TerminalChrome";
import type { ExamplePrompt, PlaygroundPhase } from "../types";
import SyntaxPrompt from "./SyntaxPrompt";
import ResultCapabilitiesList from "./ResultCapabilitiesList";

export default function PromptEditorPanel({
  activeExample,
  activeExampleData,
  phase,
  reduced,
}: {
  activeExample: number | null;
  activeExampleData: ExamplePrompt | null;
  phase: PlaygroundPhase;
  reduced: boolean;
}) {
  return (
    <div className="border-b lg:border-b-0 lg:border-r border-white/[0.06]">
      <TerminalChrome
        title="prompt-editor"
        status={
          phase === "running" ? "parsing" : phase === "done" ? "parsed" : "ready"
        }
        className="px-4 py-3"
      />

      <div className="p-5 space-y-5">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-end font-mono text-base text-muted-dark leading-relaxed select-none pt-[2px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div className="flex-1 min-h-[100px]">
              {activeExampleData ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeExample}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: reduced ? 0 : 0.3 }}
                  >
                    <div className="font-mono text-base text-muted-dark mb-1">
                      {"// Agent instruction"}
                    </div>
                    <SyntaxPrompt text={activeExampleData.prompt} />
                    <div className="font-mono text-base text-muted-dark mt-3">
                      {"// Detected intent:"}
                    </div>
                    <AnimatePresence>
                      {(phase === "running" || phase === "done") && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            delay: reduced ? 0 : 0.5,
                            duration: 0.3,
                          }}
                          className="font-mono text-base text-brand-cyan"
                        >
                          {activeExampleData.intentText}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex items-center h-full">
                  <p className="font-mono text-base text-foreground">
                    Select a prompt to begin...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeExampleData && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.8, duration: 0.4 }}
            >
              <div className="text-base font-mono uppercase tracking-wider text-muted-dark mb-2">
                Selected Tools
              </div>
              <div className="flex flex-wrap gap-2">
                {activeExampleData.tools.map((tool, i) => (
                  <motion.div
                    key={tool.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: reduced ? 0 : 1.0 + i * 0.15,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-base font-mono text-muted"
                  >
                    <tool.icon className="h-3 w-3 text-brand-purple/70" />
                    {tool.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        <ResultCapabilitiesList
          phase={phase}
          activeExampleData={activeExampleData}
        />
      </div>
    </div>
  );
}
