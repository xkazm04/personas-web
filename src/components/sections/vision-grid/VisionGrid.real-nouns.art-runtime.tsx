"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Check, Star } from "lucide-react";
import { BRAND_VAR, STATE_COLORS, tint } from "@/lib/brand-theme";
import { LAB_MODELS, LAB_ROWS, LAB_STATUS, STAGES, TRIGGER_GROUPS, type LabStatus } from "./VisionGrid.real-nouns.data";
import { markStyle, playsMechanism, type Phase } from "./VisionGrid.real-nouns.reveal";

/* ── Monitoring: one sample run through the seven real stages ───── */

const TOTAL = STAGES.reduce((n, s) => n + s.weight, 0);
const STARTS = STAGES.map((_, i) => STAGES.slice(0, i).reduce((n, s) => n + s.weight, 0));
const beatMs = (weight: number) => 160 + weight * 70;

/**
 * Mechanism: `step` is the single progress value (stages completed). Resting,
 * reduced-motion and server markup all show the finished waterfall, whose bar
 * offsets along the time axis still show the order.
 */
export function MonitoringArt({ phase }: { phase: Phase }) {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (!playsMechanism(phase)) return;
    let i = 0;
    let id = 0;
    const beat = () => {
      setStep(i);
      if (i < STAGES.length) id = window.setTimeout(beat, beatMs(STAGES[i].weight));
      i += 1;
    };
    id = window.setTimeout(beat, phase === "enter" ? 250 : 0);
    return () => window.clearTimeout(id);
  }, [phase]);

  const done = step ?? (phase === "armed" || phase === "enter" ? 0 : STAGES.length);
  const finished = done >= STAGES.length;

  return (
    <div className="flex h-full flex-col justify-between">
      <ol className="space-y-[5px]">
        {STAGES.map((s, i) => {
          const complete = i < done;
          const running = i === done && !finished && step !== null;
          return (
            <li key={s.id} className="flex h-[16px] items-center gap-2">
              <span
                className={`w-[130px] shrink-0 truncate font-mono text-xs leading-none ${complete || running ? "text-foreground/85" : "text-muted-dark"}`}
              >
                {s.label}
              </span>
              <span className="relative h-2 flex-1 rounded-full bg-white/[0.04]" aria-hidden>
                <span
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    left: `${(STARTS[i] / TOTAL) * 100}%`,
                    width: `${Math.max((s.weight / TOTAL) * 100, 3)}%`,
                    backgroundColor: running ? tint("rose", 55) : BRAND_VAR.rose,
                    transform: complete ? "scaleX(1)" : running ? "scaleX(0.45)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: `transform ${beatMs(s.weight)}ms ease-out`,
                  }}
                />
              </span>
            </li>
          );
        })}
      </ol>
      <p className="flex items-center justify-between font-mono text-xs text-muted-dark" aria-live="polite">
        <span className="flex items-center gap-1.5">
          {finished ? (
            <>
              <Check aria-hidden className="h-3 w-3" style={{ color: STATE_COLORS.success }} />
              sample run · completed
            </>
          ) : (
            <>running · {STAGES[done]?.label}</>
          )}
        </span>
        <span aria-hidden>time →</span>
      </p>
    </div>
  );
}

/* ── Lab: prompt versions x models, in the app's status vocabulary ─ */

function StatusCell({ status, baseline, style }: { status: LabStatus; baseline: boolean; style: CSSProperties }) {
  const meta = LAB_STATUS[status];
  const pending = status === "unmeasured";
  return (
    <span
      className={`flex h-[26px] items-center justify-center gap-1 rounded-md border text-xs ${
        status === "archived" ? "text-muted-dark" : "text-foreground/85"
      } ${pending ? "border-dashed" : ""}`}
      style={{
        borderColor: meta.brand ? tint(meta.brand, 30) : "var(--border-glass-hover)",
        backgroundColor: meta.brand ? tint(meta.brand, 12) : "rgba(var(--surface-overlay), 0.02)",
        ...style,
      }}
    >
      {status === "active" && <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND_VAR.cyan }} />}
      {meta.label}
      {baseline && <Star aria-label="baseline" className="h-3 w-3" style={{ color: BRAND_VAR.amber, fill: BRAND_VAR.amber }} />}
    </span>
  );
}

export function LabArt({ phase }: { phase: Phase }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="grid grid-cols-[28px_repeat(3,1fr)] items-center gap-x-1.5 gap-y-1.5">
        <span className="font-mono text-xs text-muted-dark">ver</span>
        {LAB_MODELS.map((m) => (
          <span key={m} className="text-center font-mono text-xs text-muted-dark">{m}</span>
        ))}
        {LAB_ROWS.map((row, r) => (
          <div key={row.version} className="contents">
            <span className="font-mono text-xs text-foreground/85">{row.version}</span>
            {row.cells.map((status, c) => (
              <StatusCell
                key={LAB_MODELS[c]}
                status={status}
                baseline={row.baselineAt === c}
                style={markStyle(phase, 80 + (r * 3 + c) * 70, "translateY(4px)")}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="flex items-center gap-1.5 font-mono text-xs text-muted-dark">
        <Star aria-hidden className="h-3 w-3" style={{ color: BRAND_VAR.amber, fill: BRAND_VAR.amber }} />
        baseline · sample persona
      </p>
    </div>
  );
}

/* ── Orchestration: every trigger kind, grouped as the app groups them ─ */

export function OrchestrationArt({ phase }: { phase: Phase }) {
  let n = 0;
  return (
    <ul className="flex h-full flex-col justify-center gap-2">
      {TRIGGER_GROUPS.map((g) => {
        const color = g.brand ? BRAND_VAR[g.brand] : "var(--muted-dark)";
        return (
          <li key={g.label} className="flex items-start gap-2">
            <span className="w-[72px] shrink-0 pt-[3px] font-mono text-xs" style={{ color }}>
              {g.label}
            </span>
            <span className="flex flex-wrap gap-1">
              {g.kinds.map((k) => (
                <span
                  key={k}
                  className="rounded-md border px-1.5 py-[3px] font-mono text-xs leading-none text-foreground/85"
                  style={{
                    borderColor: g.brand ? tint(g.brand, 28) : "var(--border-glass-hover)",
                    backgroundColor: g.brand ? tint(g.brand, 9) : "rgba(var(--surface-overlay), 0.02)",
                    ...markStyle(phase, n++ * 55),
                  }}
                >
                  {k}
                </span>
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
