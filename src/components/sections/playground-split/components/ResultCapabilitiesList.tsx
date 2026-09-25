"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { RESULT_DIMENSIONS } from "../data";
import type { ExamplePrompt, PlaygroundPhase } from "../types";

export default function ResultCapabilitiesList({
  phase,
  activeExampleData,
}: {
  phase: PlaygroundPhase;
  activeExampleData: ExamplePrompt | null;
}) {
  const { t } = useTranslation();
  const copy = t.playgroundSection;
  return (
    <AnimatePresence>
      {phase === "done" && activeExampleData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-brand-emerald/20 bg-brand-emerald/[0.04] overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-brand-emerald/15 bg-brand-emerald/[0.06] px-4 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-brand-emerald" />
            <span className="text-base font-mono uppercase tracking-wider text-brand-emerald">
              {copy.result}
            </span>
          </div>
          <ul className="divide-y divide-white/[0.05] stage:grid stage:grid-cols-2 stage:divide-y-0">
            {RESULT_DIMENSIONS.map((dim, i) => {
              const Icon = dim.icon;
              const value = activeExampleData.result[dim.key];
              return (
                <motion.li
                  key={dim.key}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                  className="flex items-start gap-3 px-4 py-3 stage:gap-2 stage:px-3 stage:py-2"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${dim.color}1a` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: dim.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-base font-mono uppercase tracking-wider"
                      style={{ color: dim.color }}
                    >
                      {copy.dimensions[dim.key]}
                    </div>
                    <div className="mt-1 text-base text-foreground/90 leading-relaxed stage:line-clamp-2 stage:text-sm stage:leading-snug">
                      {value}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
