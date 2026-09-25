"use client";

import { useRef } from "react";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { Brain, Search, Sparkles } from "lucide-react";

import { SecondBrainGraph } from "./second-brain/SecondBrainGraph";
import { SecondBrainSidePanel } from "./second-brain/SecondBrainSidePanel";

export default function SecondBrain() {
  // The graph's pulses loop only while it is on screen and the tab is visible;
  // one-shot entrances still key off reduced motion alone.
  const copy = useTranslation().t.pluginsExtra.brain;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { run, still: reduced } = useLoopGate(rootRef);
  const baseDelay = reduced ? 0 : 0.05;

  return (
    <div ref={rootRef} className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-purple-400/30 bg-purple-500/[0.08] px-3 py-1.5">
          <Brain className="h-4 w-4 text-purple-300" />
          <span className="text-base font-mono font-semibold uppercase tracking-widest text-foreground/85">
            {copy.title}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-md border border-foreground/[0.08] bg-foreground/[0.02] px-2 py-1.5 min-w-[180px]">
          <Search className="h-4 w-4 text-foreground/60" />
          <span className="text-base font-mono text-foreground/60">
            {copy.recall}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-purple-400/25 bg-purple-500/[0.06] px-2.5 py-1.5 text-base font-mono text-purple-200">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{copy.capture}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-3">
        <SecondBrainGraph reduced={!run} baseDelay={baseDelay} />
        <SecondBrainSidePanel reduced={reduced} />
      </div>

      <div className="mt-4 pt-3 border-t border-foreground/[0.06] flex flex-wrap items-center justify-between gap-2 text-base font-mono uppercase tracking-widest text-foreground/60">
        <span>
          {copy.vault}{" "}
          <span className="text-purple-300 font-semibold">~/obsidian/work</span>
        </span>
        <span className="flex items-center gap-3">
          <span>
            <span className="text-purple-300 font-semibold tabular-nums">4,281</span>{" "}
            {copy.notes}
          </span>
          <span className="text-foreground/60">-</span>
          <span>
            <span className="text-purple-300 font-semibold tabular-nums">18,904</span>{" "}
            {copy.links}
          </span>
          <span className="text-foreground/60">-</span>
          <span>
            <span className="text-purple-300 font-semibold tabular-nums">92%</span>{" "}
            {copy.recallRate}
          </span>
        </span>
      </div>
    </div>
  );
}
