"use client";

import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";
import { BRAND_VAR, STATE_COLORS, tint } from "@/lib/brand-theme";
import { RUNS, type ShiftConnector } from "./CommandCenterIllustration.night-shift.data";

/** A 20px connector tile in the app's style: brand tint behind the real glyph. */
function ConnectorTile({ c }: { c: ShiftConnector }) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
      // A light plate tinted with the brand colour: several glyphs are dark on
      // transparent and vanish on a dark theme without it.
      style={{ background: `color-mix(in srgb, ${c.color} 14%, rgb(255 255 255 / 0.9))`, borderColor: `${c.color}55` }}
      title={c.label}
    >
      <Image src={`/tools/${c.icon}.svg`} alt={c.label} width={12} height={12} className="h-3 w-3" />
    </span>
  );
}

/**
 * The overnight log: one row per scheduled slot, in the order they fire. A row
 * the hand has passed shows what the run left behind; the others read as
 * scheduled (dashed border, like a pending item in the app). Both lines are in
 * the markup at once and cross-fade, so the row never changes height.
 */
export default function NightShiftLog({ passed }: { passed: number }) {
  return (
    <ol className="flex min-w-0 flex-col gap-1.5">
      {RUNS.map((run, i) => {
        const done = i < passed;
        const color = BRAND_VAR[run.brand];
        return (
          <li
            key={run.time}
            className="relative overflow-hidden rounded-lg border bg-white/[0.02] py-1.5 pl-3 pr-2"
            style={{
              borderStyle: done ? "solid" : "dashed",
              borderColor: done ? "var(--border-glass)" : "var(--border-glass-hover)",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-0.5 transition-opacity duration-300"
              style={{ backgroundColor: STATE_COLORS.success, opacity: done ? 1 : 0 }}
            />
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs tabular-nums text-muted-dark">{run.time}</span>
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="truncate text-xs font-semibold text-foreground">{run.persona}</span>
              <span className="ml-auto flex gap-1">
                {run.connectors.map((c) => (
                  <ConnectorTile key={c.name} c={c} />
                ))}
              </span>
            </div>
            <div className="mt-0.5 grid text-xs leading-4">
              <span
                className="col-start-1 row-start-1 flex min-w-0 items-center gap-1 text-muted transition-opacity duration-300"
                style={{ opacity: done ? 1 : 0 }}
                aria-hidden={!done}
              >
                <Check className="h-3 w-3 shrink-0" style={{ color: STATE_COLORS.success }} aria-hidden="true" />
                <span className="truncate">{run.result}</span>
              </span>
              <span
                className="col-start-1 row-start-1 flex min-w-0 items-center gap-1.5 text-muted-dark transition-opacity duration-300"
                style={{ opacity: done ? 0 : 1 }}
                aria-hidden={done}
              >
                {run.approval ? (
                  <>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded border px-1 font-mono text-foreground/80"
                      style={{ backgroundColor: tint("emerald", 8), borderColor: tint("emerald", 25) }}
                    >
                      <ShieldCheck className="h-3 w-3" style={{ color: STATE_COLORS.success }} aria-hidden="true" />
                      Approval
                    </span>
                    <span className="truncate">{run.pending}</span>
                  </>
                ) : (
                  <span className="truncate">Scheduled</span>
                )}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
