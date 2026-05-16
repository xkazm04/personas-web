"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { OUTPUT_LINES } from "./dev-tools-runner/devToolsRunnerData";
import { RunnerHealingColumn } from "./dev-tools-runner/RunnerHealingColumn";
import { RunnerOutputColumn } from "./dev-tools-runner/RunnerOutputColumn";
import { RunnerQueueColumn } from "./dev-tools-runner/RunnerQueueColumn";

export default function DevToolsRunner() {
  const reduced = useReducedMotion() ?? false;
  const [visibleOutputCount, setVisibleOutputCount] = useState(() =>
    reduced ? OUTPUT_LINES.length : 0,
  );
  const [tick, setTick] = useState(0);
  const [prevReduced, setPrevReduced] = useState(reduced);

  if (reduced !== prevReduced) {
    setPrevReduced(reduced);
    if (reduced) setVisibleOutputCount(OUTPUT_LINES.length);
  }

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setVisibleOutputCount((count) => {
        if (count >= OUTPUT_LINES.length) return 0;
        return count + 1;
      });
      setTick((value) => value + 1);
    }, 900);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="p-5">
      <div className="grid md:grid-cols-[220px_1fr_240px] gap-3">
        <RunnerQueueColumn />
        <RunnerOutputColumn
          visibleOutputCount={visibleOutputCount}
          tick={tick}
          reduced={reduced}
        />
        <RunnerHealingColumn />
      </div>

      <div className="mt-4 pt-3 border-t border-foreground/[0.06] flex items-center justify-between text-base font-mono uppercase tracking-widest text-foreground/60">
        <span>
          Active project:{" "}
          <span className="text-cyan-300 font-semibold">personas-web</span>
        </span>
        <span>
          Pass rate{" "}
          <span className="text-brand-emerald font-semibold tabular-nums">
            94%
          </span>
          {" - "}Avg{" "}
          <span className="text-cyan-300 font-semibold tabular-nums">7.6s</span>
        </span>
      </div>
    </div>
  );
}
