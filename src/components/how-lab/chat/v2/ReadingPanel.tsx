"use client";

import type { ReactNode } from "react";
import { Check, Sparkles, UserRound, Workflow } from "lucide-react";
import { AGENT, SCRIPT, mix } from "../shared/scenarios";

const READ_SIZE = "text-[clamp(1.25rem,0.7rem+2cqh,1.75rem)]";

/** One reader's lane: who is reading and how (left), the message as they read
 *  it (centre, display size), and what they took from it and what happened
 *  (right). The script's lane is ruled like a form; the agent's is lit. */
export default function ReadingPanel({
  kind,
  name,
  mode,
  aside,
  children,
  verdictLabel,
  verdict,
  outcome,
  showVerdict,
  showOutcome,
}: {
  kind: "scripted" | "agent";
  name: string;
  mode: string;
  aside: ReactNode;
  children: ReactNode;
  verdictLabel: string;
  verdict: string;
  outcome: string;
  showVerdict: boolean;
  showOutcome: boolean;
}) {
  const isAgent = kind === "agent";
  const color = isAgent ? AGENT : SCRIPT;
  const Icon = isAgent ? Sparkles : Workflow;
  const OutIcon = isAgent ? Check : UserRound;
  const fade = (on: boolean, dy = 8) => ({ opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : dy}px)` });

  return (
    <div
      className="relative grid min-h-0 flex-1 grid-cols-1 items-center gap-4 overflow-hidden rounded-3xl border px-5 py-4 md:grid-cols-[1fr_minmax(14rem,19rem)] md:gap-8 md:px-7"
      style={{
        borderColor: mix(color, isAgent ? 34 : 24),
        background: isAgent
          ? `radial-gradient(120% 140% at 50% 0%, ${mix(color, 13)}, transparent 60%), color-mix(in srgb, var(--surface) 45%, transparent)`
          : `repeating-linear-gradient(0deg, ${mix(color, 5)} 0 1px, transparent 1px 22px), color-mix(in srgb, var(--surface) 40%, transparent)`,
        boxShadow: `inset 0 1px 0 ${mix(color, 28)}, 0 30px 60px -44px ${mix(color, 70)}`,
      }}
    >
      <div className="flex min-w-0 flex-col gap-[clamp(0.5rem,1.6cqh,1rem)]">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: mix(color, 16), color }}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-tight text-foreground">{name}</span>
            <span className="block font-mono text-xs uppercase tracking-[0.14em]" style={{ color }}>
              {mode}
            </span>
          </span>
        </span>
        {aside}
      </div>

      <div className={`min-w-0 ${READ_SIZE}`}>{children}</div>
      </div>

      <div className="flex flex-col gap-2 md:border-l md:pl-6" style={{ borderColor: mix(color, 22) }}>
        <div className="transition-[opacity,transform] duration-500" style={fade(showVerdict)}>
          <span className="block font-mono text-xs uppercase tracking-[0.16em] text-muted">{verdictLabel}</span>
          <span className="block text-xl font-semibold leading-snug" style={{ color: `color-mix(in srgb, ${color} 70%, var(--foreground))` }}>
            {verdict}
          </span>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl px-3 py-2 transition-[opacity,transform] duration-500" style={{ ...fade(showOutcome), background: mix(color, 12) }}>
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: color, color: "var(--background)" }}>
            <OutIcon className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-base font-medium leading-snug text-foreground">{outcome}</span>
        </div>
      </div>
    </div>
  );
}
