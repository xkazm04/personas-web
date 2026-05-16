"use client";

import { useReducedMotion } from "framer-motion";
import { Brain, Search, Sparkles } from "lucide-react";

import { SecondBrainGraph } from "./second-brain/SecondBrainGraph";
import { SecondBrainSidePanel } from "./second-brain/SecondBrainSidePanel";

export default function SecondBrain() {
  const reduced = useReducedMotion() ?? false;
  const baseDelay = reduced ? 0 : 0.05;

  return (
    <div className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-purple-400/30 bg-purple-500/[0.08] px-3 py-1.5">
          <Brain className="h-4 w-4 text-purple-300" />
          <span className="text-base font-mono font-semibold uppercase tracking-widest text-foreground/85">
            Second brain
          </span>
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-md border border-foreground/[0.08] bg-foreground/[0.02] px-2 py-1.5 min-w-[180px]">
          <Search className="h-4 w-4 text-foreground/60" />
          <span className="text-base font-mono text-foreground/60">
            Recall a thought...
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-purple-400/25 bg-purple-500/[0.06] px-2.5 py-1.5 text-base font-mono text-purple-200">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Capture</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-3">
        <SecondBrainGraph reduced={reduced} baseDelay={baseDelay} />
        <SecondBrainSidePanel reduced={reduced} />
      </div>

      <div className="mt-4 pt-3 border-t border-foreground/[0.06] flex flex-wrap items-center justify-between gap-2 text-base font-mono uppercase tracking-widest text-foreground/60">
        <span>
          Vault:{" "}
          <span className="text-purple-300 font-semibold">~/obsidian/work</span>
        </span>
        <span className="flex items-center gap-3">
          <span>
            <span className="text-purple-300 font-semibold tabular-nums">4,281</span>{" "}
            notes
          </span>
          <span className="text-foreground/60">-</span>
          <span>
            <span className="text-purple-300 font-semibold tabular-nums">18,904</span>{" "}
            links
          </span>
          <span className="text-foreground/60">-</span>
          <span>
            <span className="text-purple-300 font-semibold tabular-nums">92%</span>{" "}
            recall
          </span>
        </span>
      </div>
    </div>
  );
}
