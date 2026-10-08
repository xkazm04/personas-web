"use client";

import { ATTENTION_COLOR } from "../attention";
import { FLEET, formatAge } from "../fleet-data";
import type { BoardCopy } from "./copy";
import { fill } from "./model";

/** The plan's usage windows, each with how much is used against how much of
 *  the window has passed: hot, on pace, or headroom. */
export default function UsageMeters({ simMs, copy }: { simMs: number; copy: BoardCopy }) {
  return (
    <>
      {FLEET.usage.windows.map((w) => {
        const rem = Math.max(0, w.resetsInMs - simMs);
        const el = ((w.windowMs - rem) / w.windowMs) * 100;
        const d = w.utilizationPct - el;
        const [verdictText, col] = d > 5 ? [copy.band.hot, ATTENTION_COLOR.warning] : d < -15 ? [copy.band.headroom, "var(--status-info)"] : [copy.band.onPace, "var(--status-success)"];
        const full = `${fill(copy.band.used, { label: w.label })} ${w.utilizationPct}%, ${verdictText}. ${fill(copy.band.elapsed, { pct: Math.round(el), time: formatAge(rem) })}`;
        return (
          <div key={w.label} className="flex items-center gap-2 text-xs" title={full} role="img" aria-label={full}>
            <span className="text-muted-dark">{w.label}</span>
            <span className="relative h-1.5 w-16 rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${w.utilizationPct}%`, background: col }} />
              <span className="absolute -top-1 h-3.5 w-0.5 rounded-sm bg-foreground" style={{ left: `calc(${el.toFixed(1)}% - 1px)` }} />
            </span>
            <span className="font-semibold tabular-nums" style={{ color: `color-mix(in oklab, ${col} 75%, var(--foreground))` }}>{w.utilizationPct}%</span>
          </div>
        );
      })}
    </>
  );
}
