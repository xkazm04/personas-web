"use client";

import type { BrandKey } from "@/lib/brand-theme";
import type { CaseId } from "./shared/cases";
import { BREAKS, NODES, TRACES, VIEW, type NodeId } from "./geometry";
import Chip from "./Chip";
import Trace from "./Trace";
import BreakFx from "./BreakFx";

/** Stage colour of a failure in each phase (running, detect, diagnose, fix, done). */
export function phaseColor(phase: number, escalated: boolean): BrandKey {
  if (escalated && phase >= 3) return "rose";
  return (["emerald", "rose", "amber", "cyan", "emerald"] as const)[phase];
}

/** The run circuit as one SVG: traces, chips and the break point's effects. */
export default function Board({
  caseId,
  phase,
  running,
  labels,
}: {
  caseId: CaseId;
  phase: number;
  running: boolean;
  labels: Record<NodeId, string> & { sub: string };
}) {
  const brk = BREAKS[caseId];
  const escalated = caseId === "login";
  const color = phaseColor(phase, escalated);

  return (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <filter id="hl-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {TRACES.map((tr) => {
        const isBroken = tr.id === brk.trace && phase > 0;
        const starved = escalated && phase > 0 && tr.id === `out-${brk.trace}`;
        const open = isBroken && (phase < 3 || escalated);
        return (
          <Trace
            key={tr.id}
            d={tr.d}
            color={isBroken ? color : "emerald"}
            open={open}
            flowing={!open && !starved}
            running={running}
          />
        );
      })}

      {NODES.map((n) => (
        <Chip
          key={n.id}
          node={n}
          label={labels[n.id]}
          sub={n.id === "agent" ? labels.sub : undefined}
          hurt={n.id === brk.node && phase > 0 && (phase < 4 || escalated) ? color : null}
          running={running}
        />
      ))}

      <BreakFx key={`${caseId}-${phase}`} x={brk.x} y={brk.y} phase={phase} caseId={caseId} running={running} />
    </svg>
  );
}
