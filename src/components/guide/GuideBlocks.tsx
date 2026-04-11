"use client";

import React, { type ReactNode } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Check,
  Star,
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
                  className="px-4 py-2.5 text-muted-dark sm:whitespace-nowrap"
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

// ── Compare Block ──────────────────────────────────────────────────
// Usage: :::compare with items separated by "---"
// Each item: **Title** on first line, then body lines

export function CompareBlock({
  items,
}: {
  items: { title: string; body: string; highlight?: boolean }[];
}) {
  const colors = ["#06b6d4", "#a855f7", "#34d399", "#f43f5e", "#fbbf24"];
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => {
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className={`relative rounded-xl border px-5 py-4 backdrop-blur-sm transition-colors ${
              item.highlight
                ? "border-white/[0.12] bg-white/[0.04]"
                : "border-white/[0.06] bg-white/[0.02]"
            }`}
          >
            {item.highlight && (
              <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 border border-brand-cyan/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-cyan">
                <Star className="h-2.5 w-2.5" aria-hidden="true" />
                Recommended
              </span>
            )}
            <div
              className="mb-2 h-0.5 w-8 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <h4 className="text-base font-semibold text-foreground">
              {item.title}
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-dark">
              {item.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Architecture Diagram ───────────────────────────────────────────
// Usage: :::diagram with "[Node Label]" and "-->" arrow lines

export function ArchitectureDiagram({
  nodes,
}: {
  nodes: { label: string; arrow?: boolean }[];
}) {
  return (
    <div className="my-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 backdrop-blur-sm overflow-x-auto">
      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          {node.arrow && (
            <ArrowRight
              className="h-4 w-4 shrink-0 text-brand-cyan/50"
              aria-hidden="true"
            />
          )}
          <div className="relative flex items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-sm font-medium text-foreground shadow-[0_0_12px_rgba(6,182,212,0.04)]">
            <div
              className="absolute inset-0 rounded-lg opacity-[0.03]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(168,85,247,0.3))",
              }}
              aria-hidden="true"
            />
            <span className="relative">{node.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Feature Highlight ──────────────────────────────────────────────
// Usage: :::feature with **Title** on first line, then body

export function FeatureHighlight({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color?: string;
}) {
  const accentColor = color ?? "#06b6d4";
  return (
    <div className="my-6 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent px-5 py-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accentColor}15` }}
          aria-hidden="true"
        >
          <Star className="h-4 w-4" style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-dark">{body}</p>
        </div>
      </div>
    </div>
  );
}

// ── Checklist ──────────────────────────────────────────────────────
// Usage: :::checklist with "- Item text" lines

export function Checklist({
  items,
}: {
  items: string[];
}) {
  return (
    <div className="my-6 space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 backdrop-blur-sm"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/[0.08]">
            <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
          </div>
          <span className="text-sm leading-relaxed text-muted-dark">{item}</span>
        </div>
      ))}
    </div>
  );
}

// ── Code Compare ───────────────────────────────────────────────────
// Usage: :::code-compare with "### Before" / "### After" sections

export function CodeCompare({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-rose-400/10 bg-rose-400/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-rose-400/10 bg-rose-400/[0.04] px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-rose-400/50" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400/70">
            {beforeLabel ?? "Before"}
          </span>
        </div>
        <pre className="p-4 font-mono text-sm leading-relaxed text-muted-dark overflow-x-auto">
          <code>{before}</code>
        </pre>
      </div>
      <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400/50" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/70">
            {afterLabel ?? "After"}
          </span>
        </div>
        <pre className="p-4 font-mono text-sm leading-relaxed text-muted-dark overflow-x-auto">
          <code>{after}</code>
        </pre>
      </div>
    </div>
  );
}
