"use client";

import { tint } from "@/lib/brand-theme";
import { examples } from "../data";

interface Props {
  activeExample: number | null;
  isRunning: boolean;
  onClick: (i: number) => void;
}

export default function ExampleChips({ activeExample, isRunning, onClick }: Props) {
  return (
    <div className="mb-5 flex flex-wrap gap-2 justify-center">
      {examples.map((ex, i) => {
        const active = activeExample === i;
        return (
          <button
            key={ex.label}
            onClick={() => onClick(i)}
            disabled={isRunning}
            className="group flex items-center gap-2 rounded-full border px-4 py-2 text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={
              active
                ? { borderColor: tint("cyan", 40), backgroundColor: tint("cyan", 10), color: "var(--foreground)" }
                : undefined
            }
          >
            <ex.icon className="h-3.5 w-3.5" style={{ color: ex.iconColor }} />
            {ex.label}
          </button>
        );
      })}
    </div>
  );
}
