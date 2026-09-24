"use client";

import { Clock, DollarSign, Inbox, Laptop, Zap } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, STATE_COLORS, tint } from "@/lib/brand-theme";
import { CONNECTORS, DONE_STEP, PERSONA, RESULT, STAGES, TOTAL_MS, formatMs } from "./CommandCenterIllustration.persona-card.data";
import { usePersonaRun } from "./CommandCenterIllustration.persona-card.run";
import { RunPanel } from "./CommandCenterIllustration.persona-card.run-panel";

/**
 * Hero illustration, "persona-card" direction (product-true).
 *
 * Claim: describe an agent in plain language and it works for you, on your
 * machine. Drawn as the app draws it: one persona card (health stripe, tinted
 * icon frame, 24px connector tiles, trigger chip, footer) holding its latest
 * run as the app's pipeline dots + a reduced StageBar waterfall over the seven
 * real stages. Resting state = the completed run; with motion allowed the run
 * replays once when scrolled into view, then rests (replay button to repeat).
 */

const LABEL =
  `Example agent card. "${PERSONA.name}": ${PERSONA.description} ` +
  `Tools: ${CONNECTORS.map((c) => c.label).join(", ")}. Trigger: ${PERSONA.trigger}. ` +
  `Its latest run passed all ${STAGES.length} pipeline stages, ${STAGES[0].label} to ${STAGES[STAGES.length - 1].label}, ` +
  `in ${formatMs(TOTAL_MS)}, on your machine: ${RESULT.join(", ")}.`;

const PERSONA_TINT = { background: tint("purple", 10), borderColor: tint("purple", 24) };

function ConnectorTile({ label, color, icon }: { label: string; color: string; icon?: string }) {
  const mask = `url(/tools/${icon}.svg) center / contain no-repeat`;
  return (
    <li
      title={label}
      className="grid h-6 w-6 place-items-center rounded-md border"
      style={{
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
      }}
    >
      <span aria-hidden className="h-3.5 w-3.5 bg-foreground/85" style={{ mask, WebkitMask: mask }} />
      <span className="sr-only">{label}</span>
    </li>
  );
}

// `publicBetaLabel` is part of the slot's contract; this direction has no use for it.
export default function PersonaCardIllustration(_props: { publicBetaLabel: string }) {
  const reduced = useStillMotion();
  const { ref, step, replay } = usePersonaRun(reduced);
  const done = step >= DONE_STEP;

  return (
    <figure
      ref={ref}
      aria-label={LABEL}
      className="mx-auto flex h-[360px] w-[min(100%,440px)] flex-col gap-2 text-left"
    >
      <div
        className="relative flex min-h-0 flex-1 flex-col gap-2.5 rounded-2xl border border-l-2 border-glass bg-white/[0.03] px-3.5 py-3"
        style={{ borderLeftColor: tint("emerald", 65) }}
      >
        {/* Identity: icon frame in the persona colour, name, the sentence it was built from */}
        <div className="flex items-start gap-3">
          <div aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border" style={PERSONA_TINT}>
            <Inbox className="h-5 w-5" style={{ color: BRAND_VAR.purple }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{PERSONA.name}</span>
              <span
                className="ml-auto inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs text-foreground/85"
                style={{ background: tint("emerald", 8), borderColor: tint("emerald", 24) }}
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: STATE_COLORS.success }} />
                Active
              </span>
            </div>
            <p className="mt-1 text-xs leading-snug text-muted">&ldquo;{PERSONA.description}&rdquo;</p>
          </div>
        </div>

        {/* Tools + schedule */}
        <div className="flex items-center justify-between gap-2">
          <ul aria-label="Connected tools" className="flex items-center gap-1">
            {CONNECTORS.map((c) => (
              <ConnectorTile key={c.name} label={c.label} color={c.color} icon={c.icon} />
            ))}
          </ul>
          <span className="relative inline-flex items-center gap-1.5 rounded-md border border-glass bg-white/[0.03] px-2 py-1 font-mono text-xs text-foreground/85">
            {/* The schedule firing: a ring that shows only on the run's first beat. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-md transition-opacity duration-300"
              style={{ opacity: step === 0 ? 1 : 0, boxShadow: `inset 0 0 0 1px ${BRAND_VAR.cyan}, 0 0 14px ${tint("cyan", 35)}` }}
            />
            <Clock aria-hidden className="h-3 w-3 text-brand-cyan" />
            {PERSONA.trigger}
          </span>
        </div>

        <RunPanel step={step} reduced={reduced} onReplay={replay} />

        {/* Footer, as on the app's card: triggers, last run, spend - plus where it ran */}
        <div className="mt-auto flex items-center gap-3 border-t border-glass pt-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Zap aria-hidden className="h-3 w-3" />1 trigger
          </span>
          <span className="flex items-center gap-1">
            <Clock aria-hidden className="h-3 w-3" />
            {done ? PERSONA.lastRun : "running now"}
          </span>
          <span className="flex items-center font-mono tabular-nums">
            <DollarSign aria-hidden className="h-3 w-3" />
            {PERSONA.spend.replace("$", "")}
          </span>
          <span className="ml-auto flex items-center gap-1 text-foreground/85">
            <Laptop aria-hidden className="h-3 w-3" style={{ color: BRAND_VAR.cyan }} />
            on this machine
          </span>
        </div>
      </div>

      <figcaption className="truncate px-1 text-xs leading-4 text-muted">
        This is what an agent looks like, and it just finished a run.
      </figcaption>
    </figure>
  );
}
