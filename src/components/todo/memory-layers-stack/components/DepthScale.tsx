"use client";

import { ArrowDown } from "lucide-react";

export default function DepthScale() {
  return (
    <div className="hidden md:flex flex-col items-center justify-between py-6 px-3 shrink-0">
      <div className="text-base font-mono text-foreground/60 -rotate-90 whitespace-nowrap mb-6 uppercase tracking-widest">
        Importance
      </div>
      <div className="flex-1 flex flex-col items-center justify-between relative">
        <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-white/25 via-white/12 to-white/5" />
        {[10, 8, 6, 4, 2].map((val) => (
          <div key={val} className="relative flex items-center gap-2 z-10">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
            <span className="text-base font-mono text-foreground/60 tabular-nums">
              {val}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-4 text-foreground/60">
        <ArrowDown className="h-4 w-4" />
        <span className="text-base font-mono">depth</span>
      </div>
    </div>
  );
}
