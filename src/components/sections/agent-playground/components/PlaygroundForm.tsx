"use client";

import { ChevronRight, Play, RotateCcw, Sparkles } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

interface Props {
  inputValue: string;
  setInputValue: (v: string) => void;
  isRunning: boolean;
  phase: "idle" | "running" | "done";
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function PlaygroundForm({ inputValue, setInputValue, isRunning, phase, onSubmit, onReset }: Props) {
  return (
    <form onSubmit={onSubmit} className="border-b border-white/[0.04] px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <ChevronRight className="h-4 w-4 shrink-0" style={{ color: tint("cyan", 60) }} />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Describe what your agent should do..."
          disabled={isRunning}
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-dark outline-none font-mono disabled:opacity-60"
        />
        {phase === "done" ? (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-base font-medium text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        ) : (
          <button
            type="submit"
            disabled={isRunning || !inputValue.trim()}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-base font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: tint("cyan", 30),
              backgroundColor: tint("cyan", 10),
              color: BRAND_VAR.cyan,
            }}
          >
            {isRunning ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? "Running" : "Run"}
          </button>
        )}
      </div>
    </form>
  );
}
