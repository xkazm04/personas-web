"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Mail, ShieldCheck, Terminal } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

/* Pieces of the "first-run" illustration, reduced from the app's own onboarding
 * (DesktopDiscoveryStep, TemplatePickerStep, the adoption questions, ExecutionStep):
 * real names and states, fewer of them. */

export const BODY_WORDS = {
  obsidian: "Obsidian",
  approved: "Approved",
  digest: "Email Morning Digest",
  provider: "Email provider?",
  gmail: "Gmail",
  output: "Agent Output",
  lines: ["Fetched unread email", "Digest sent to you"],
  executing: "Executing...",
  completed: "Execution completed successfully",
} as const;

/** A past screen of the same window, shrunk: the step's number and what you did there. */
export function Thumb({ n, lit, children }: { n: number; lit: boolean; children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-[104px] items-center md:min-h-[78px] gap-3 rounded-xl border bg-background px-3.5 py-3 transition-opacity duration-300"
      style={{ borderColor: lit ? tint("emerald", 35) : "var(--border-glass)", opacity: lit ? 1 : 0.35 }}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{ color: BRAND_VAR.emerald, backgroundColor: tint("emerald", 16) }}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function DesktopThumb() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-foreground">{BODY_WORDS.obsidian}</span>
      <ShieldCheck className="h-4 w-4 text-brand-emerald" aria-hidden />
      <span className="ml-auto rounded-md px-2 py-0.5 text-sm font-medium text-brand-emerald" style={{ backgroundColor: tint("emerald", 14) }}>
        {BODY_WORDS.approved}
      </span>
    </div>
  );
}

export function TemplateThumb() {
  return (
    <div className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5" style={{ borderColor: tint("purple", 55), backgroundColor: tint("purple", 8) }}>
      <Mail className="h-4 w-4 shrink-0" style={{ color: BRAND_VAR.purple }} aria-hidden />
      <span className="whitespace-nowrap text-sm font-semibold text-foreground">{BODY_WORDS.digest}</span>
    </div>
  );
}

export function SetupThumb() {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-foreground/80">{BODY_WORDS.provider}</span>
      <span className="ml-auto rounded-md border px-2.5 py-0.5 text-sm font-semibold text-foreground" style={{ borderColor: tint("purple", 55), backgroundColor: tint("purple", 10) }}>
        {BODY_WORDS.gmail}
      </span>
    </div>
  );
}

/** The app's ExecutionStep after "Run Agent": a status line over the output panel. */
export function RunBody({ done, lines }: { done: boolean; lines: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold md:text-base" style={{ color: done ? BRAND_VAR.emerald : BRAND_VAR.purple }}>
        <CheckCircle2 className="h-4 w-4" aria-hidden style={{ opacity: done ? 1 : 0.35 }} />
        {done ? BODY_WORDS.completed : BODY_WORDS.executing}
      </div>
      <div className="rounded-xl border border-glass bg-white/[0.02]">
        <div className="flex items-center gap-2 border-b border-glass px-4 py-2 text-sm font-medium text-foreground/80">
          <Terminal className="h-3.5 w-3.5" aria-hidden /> {BODY_WORDS.output}
        </div>
        <ul className="space-y-2 px-4 py-4 font-mono text-sm text-foreground/85">
          {BODY_WORDS.lines.map((l, i) => (
            <li key={l} style={{ opacity: i < lines ? 1 : 0 }}>
              <span className="mr-2 text-brand-emerald">&gt;</span>
              {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
