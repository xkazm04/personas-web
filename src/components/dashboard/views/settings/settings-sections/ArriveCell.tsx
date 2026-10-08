import type { ReactNode } from "react";

import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";

/**
 * One settings card's grid cell with the T1 section cascade
 * (docs/features/dashboard/loading-orchestration.md). `GlowCard` takes no
 * `style`, so the cascade index lives on this wrapper; it is a flex column so
 * the card (`flex-1`) still stretches to its grid row like a bare grid item.
 * Cards that render nothing (demo-only / live-only) return before this, so
 * they never leave an empty cell behind. Without an `index` (a card reused
 * outside this view, e.g. Home's vault detail) it adds nothing.
 */
export function ArriveCell({ index, children }: { index?: number; children: ReactNode }) {
  if (index === undefined) return <>{children}</>;
  return (
    <div className={`${ARRIVE} flex flex-col`} style={arriveAt(index)}>
      {children}
    </div>
  );
}
