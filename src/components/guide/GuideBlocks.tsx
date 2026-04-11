"use client";

import React, { type ReactNode } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

// ── Callout ─────────────────────────────────────────────────────────
// Usage in markdown:  :::tip / :::warning / :::info / :::success

const CALLOUT_STYLES: Record<
  string,
  { icon: LucideIcon; border: string; bg: string; iconColor: string; label: string }
> = {
  tip: {
    icon: Lightbulb,
    border: "border-brand-cyan/30",
    bg: "bg-brand-cyan/[0.04]",
    iconColor: "text-brand-cyan",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-400/30",
    bg: "bg-amber-400/[0.04]",
    iconColor: "text-amber-400",
    label: "Warning",
  },
  info: {
    icon: Info,
    border: "border-blue-400/30",
    bg: "bg-blue-400/[0.04]",
    iconColor: "text-blue-400",
    label: "Note",
  },
  success: {
    icon: CheckCircle2,
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/[0.04]",
    iconColor: "text-emerald-400",
    label: "Done",
  },
};

export function Callout({
  type,
  children,
}: {
  type: string;
  children: ReactNode;
}) {
  const style = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info;
  const Icon = style.icon;
  return (
    <div
      className={`my-5 rounded-xl border ${style.border} ${style.bg} px-4 py-3.5 backdrop-blur-sm`}
    >
      <div className="flex gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold uppercase tracking-wider ${style.iconColor} mb-1.5`}
          >
            {style.label}
          </p>
          <div className="text-base leading-relaxed text-muted-dark [&>p]:mb-1.5 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Steps ───────────────────────────────────────────────────────────
// Usage in markdown:  :::steps  with numbered items

export function StepWizard({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <div className="my-6 relative pl-8">
      {/* Vertical connecting line */}
      <div
        className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-cyan/40 via-brand-purple/30 to-transparent"
        aria-hidden="true"
      />
      <ol className="space-y-5 list-none">
        {steps.map((step, i) => (
          <li key={i} className="relative">
            {/* Number circle */}
            <span
              className="absolute -left-8 top-0.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] text-xs font-bold text-brand-cyan backdrop-blur-sm"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <p className="text-base leading-relaxed text-foreground font-medium">
              {step.title}
            </p>
            {step.body && (
              <p className="mt-1 text-base leading-relaxed text-muted-dark">
                {step.body}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Keyboard Shortcuts ──────────────────────────────────────────────
// Usage in markdown:  :::keys  with "Combo — Description" lines

function KeyBadge({ combo }: { combo: string }) {
  const parts = combo.split("+").map((k) => k.trim());
  return (
    <span className="inline-flex items-center gap-0.5">
      {parts.map((key, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-muted-dark/50 text-xs mx-0.5">+</span>}
          <kbd className="inline-flex items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.06] px-2 py-0.5 text-xs font-mono font-medium text-foreground shadow-[0_1px_0_1px_rgba(255,255,255,0.03)] min-w-[28px] text-center">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  );
}

export function KeyboardGrid({
  shortcuts,
}: {
  shortcuts: { combo: string; description: string }[];
}) {
  return (
    <div className="my-6 grid gap-2.5 sm:grid-cols-2">
      {shortcuts.map((sc, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 backdrop-blur-sm"
        >
          <KeyBadge combo={sc.combo} />
          <span className="text-sm text-muted-dark truncate">{sc.description}</span>
        </div>
      ))}
    </div>
  );
}

// ── Table ────────────────────────────────────────────────────────────
// Rendered from standard markdown pipe-table syntax.

export function MarkdownTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03]">
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-2.5 text-left text-sm font-semibold text-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="transition-colors hover:bg-white/[0.02]"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-2.5 text-muted-dark whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
