import type { MemoryAction } from "@/lib/mock-dashboard-data";

import { typeConfig } from "./memoryViewConfig";

export function ScoreDots({
  score,
  type,
}: {
  score: number;
  type: MemoryAction["type"];
}) {
  const maxDots = 5;
  const filled = Math.max(1, Math.round((score / 10) * maxDots));
  const { dot } = typeConfig[type];

  return (
    <div className="flex items-center gap-0.5" aria-label={`score ${score} of 10`}>
      {Array.from({ length: maxDots }, (_, index) => (
        <span
          key={index}
          className={`h-1 w-1 rounded-full ${index < filled ? dot : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}
