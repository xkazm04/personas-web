"use client";

import { ArrowRight, Trophy } from "lucide-react";
import { BRAND_VAR, STATE_COLORS, tint } from "@/lib/brand-theme";
import { PersonaChip, ScreenFrame, glass } from "./VisionGrid.real-surfaces.chrome";
import { ROUTES, VARIANTS, composite, type Route } from "./VisionGrid.real-surfaces.data";

function scoreColor(v: number): string {
  if (v >= 80) return STATE_COLORS.success;
  if (v >= 50) return STATE_COLORS.warning;
  return STATE_COLORS.error;
}

/** Lab: an arena comparing two prompt variants on the app's three scores. */
export function ArenaScreen() {
  const totals = VARIANTS.map(composite);
  const best = Math.max(...totals);
  return (
    <ScreenFrame title="Arena" meta="2 prompt variants">
      <div className="flex h-full flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-2">
          {VARIANTS.map((v, vi) => {
            const win = totals[vi] === best;
            return (
              <div
                key={v.key}
                className="flex min-w-0 flex-col gap-1 rounded-lg border p-2"
                style={{
                  borderColor: win ? tint("amber", 40) : "var(--border-glass)",
                  backgroundColor: win ? tint("amber", 6) : glass(0.02),
                }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {v.key} · {v.name}
                  </span>
                  {win && <Trophy aria-label="winner" className="ml-auto h-3 w-3" style={{ color: BRAND_VAR.amber }} />}
                </span>
                <span className="-mt-0.5 truncate text-xs text-muted">{v.note}</span>
                {v.scores.map((s) => (
                  <span key={s.label} className="flex flex-col gap-0.5">
                    <span className="flex justify-between text-xs leading-tight">
                      <span className="truncate text-muted">{s.label}</span>
                      <span className="font-mono tabular-nums" style={{ color: scoreColor(s.value) }}>
                        {s.value}
                      </span>
                    </span>
                    <span aria-hidden className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: glass(0.06) }}>
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${s.value}%`, backgroundColor: scoreColor(s.value), opacity: 0.75 }}
                      />
                    </span>
                  </span>
                ))}
                <span className="mt-0.5 flex items-baseline justify-between border-t border-glass pt-1">
                  <span className="text-xs text-muted">Composite</span>
                  <span className="font-mono text-sm font-bold tabular-nums text-foreground">{totals[vi]}</span>
                </span>
              </div>
            );
          })}
        </div>
        <span className="mt-auto truncate text-xs text-muted">Composite = tool accuracy 40% · quality 40% · protocol 20%</span>
      </div>
    </ScreenFrame>
  );
}

function SourceChip({ source }: { source: Route["source"] }) {
  if (source.kind === "persona") return <PersonaChip persona={source.persona} />;
  const Icon = source.icon;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span
        aria-hidden
        className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: tint(source.brand, 12) }}
      >
        <Icon className="h-3 w-3" style={{ color: BRAND_VAR[source.brand] }} />
      </span>
      <span className="truncate text-xs font-medium text-foreground">{source.label}</span>
    </span>
  );
}

/** Orchestration: chain-studio ledger rows, source to condition to target. */
export function RoutesScreen() {
  const live = ROUTES.filter((r) => r.live).length;
  const pending = ROUTES.length - live;
  return (
    <ScreenFrame
      title="Routes"
      meta={
        <>
          <span style={{ color: STATE_COLORS.success }}>{live} live</span>
          <span style={{ color: STATE_COLORS.warning }}>{pending} pending</span>
        </>
      }
    >
      <ul className="flex h-full flex-col gap-1.5">
        {ROUTES.map((r, i) => (
          <li
            key={i}
            className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 rounded-lg border px-2 py-1 ${
              r.live ? "border-glass" : "border-dashed"
            }`}
            style={
              r.live
                ? { backgroundColor: glass(0.02) }
                : { borderColor: tint("amber", 40), backgroundColor: tint("amber", 5) }
            }
          >
            <SourceChip source={r.source} />
            <span className="flex items-center gap-1">
              <span aria-hidden className="h-px w-2" style={{ backgroundColor: glass(0.2) }} />
              <span
                className="rounded border px-1 text-xs leading-5"
                style={
                  r.live
                    ? { borderColor: "var(--border-glass)", color: "var(--muted)" }
                    : { borderColor: tint("amber", 40), color: BRAND_VAR.amber }
                }
              >
                {r.condition}
              </span>
              <ArrowRight aria-label="to" className="h-3 w-3 text-muted" />
            </span>
            <span className="flex min-w-0 items-center gap-1">
              <PersonaChip persona={r.target} />
            </span>
          </li>
        ))}
      </ul>
    </ScreenFrame>
  );
}

