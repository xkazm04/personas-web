"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Cpu, FileOutput, Search, Wrench, Zap } from "lucide-react";
import type { RefObject } from "react";
import type { ExamplePrompt, StageStatus, TimelinePhase } from "../types";
import StageCard from "./StageCard";

export default function TimelineTrack({
  phase,
  activeExample,
  activeExampleData,
  stageStatuses,
  reduced,
  scrollRef,
}: {
  phase: TimelinePhase;
  activeExample: number | null;
  activeExampleData: ExamplePrompt | null;
  stageStatuses: StageStatus[];
  reduced: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  if (phase === "idle") {
    return (
      <div className="relative">
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 mb-4">
              {[ArrowRight, Search, Cpu, Wrench, Zap, FileOutput].map((Icon, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center"
                >
                  <Icon className="h-4 w-4 text-white/60" />
                </div>
              ))}
            </div>
            <p className="text-base text-muted-dark font-mono">
              Pick an example to watch the execution pipeline
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 px-5 py-8 overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: reduced ? "auto" : "smooth" }}
      >
        {activeExampleData?.stages.map((stage, idx) => {
          const status: StageStatus = stageStatuses[idx] || "locked";
          const isOutput = idx === activeExampleData.stages.length - 1;

          return (
            <div
              key={stage.id}
              data-stage-card
              className="flex items-center gap-3 flex-shrink-0"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeExample}-${stage.id}`}
                  initial={{ opacity: 0, y: 20, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.5,
                    delay: reduced ? 0 : idx * 0.06,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  <StageCard
                    stage={stage}
                    status={status}
                    index={idx}
                    isOutput={isOutput}
                    reduced={reduced}
                  />
                </motion.div>
              </AnimatePresence>

              {idx < activeExampleData.stages.length - 1 && (
                <div className="flex-shrink-0 flex items-center">
                  <div className="relative w-8 h-[2px]">
                    <div className="absolute inset-0 bg-white/[0.06] rounded-full" />
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #06b6d4, #a855f7)",
                      }}
                      initial={{ width: "0%" }}
                      animate={{
                        width:
                          stageStatuses[idx] === "done"
                            ? "100%"
                            : stageStatuses[idx] === "active"
                              ? "50%"
                              : "0%",
                      }}
                      transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
