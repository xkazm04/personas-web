"use client";

import { tint } from "@/lib/brand-theme";

export default function TerminalBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute right-[15%] top-[30%] h-80 w-80 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${tint("cyan", 5)} 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute left-[10%] bottom-[20%] h-60 w-60 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${tint("purple", 4)} 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}
