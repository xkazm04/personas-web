"use client";

import type { ReactNode } from "react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { instrumentCopy } from "../copy";

/**
 * The instrument's bezel: one console every tab reads out on. A channel chip
 * and the readout title on the left, the live measurements on the right, the
 * screen(s) in the middle and the bench keys along the bottom. On the desktop
 * stage it fills the slot (every tab the same box); below it the body sets
 * its own height.
 */
export default function Frame({
  channel,
  color,
  title,
  readouts,
  footer,
  children,
}: {
  channel: number;
  color: BrandKey;
  title: string;
  readouts: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-glass bg-background/80 backdrop-blur-xl stage:h-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tint(color, 70)}, transparent)` }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-glass px-4 py-2.5 stage:py-2">
        <div className="flex items-center gap-2.5">
          <span
            className="rounded-md border px-1.5 py-0.5 font-mono text-sm font-bold tracking-wider"
            style={{ color: BRAND_VAR[color], borderColor: tint(color, 45), background: tint(color, 10) }}
          >
            {fillTemplate(instrumentCopy.channel, { n: channel })}
          </span>
          <span className="font-mono text-base font-semibold uppercase tracking-wider text-foreground">{title}</span>
          <span className="hidden font-mono text-sm uppercase tracking-[0.14em] text-foreground/60 md:inline">
            {instrumentCopy.stylised}
          </span>
        </div>
        <div className="flex items-end gap-5">{readouts}</div>
      </div>
      <div className="relative flex flex-col stage:min-h-0 stage:flex-1">{children}</div>
      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-glass px-4 py-2.5 font-mono text-sm stage:py-2">
        {footer}
      </div>
    </div>
  );
}

/** One measurement in the bezel: a small engraved label over a lit mono value. */
export function Readout({ label, color, children }: { label: string; color?: BrandKey; children: ReactNode }) {
  return (
    <div className="flex flex-col items-end gap-0.5 leading-none">
      <span className="font-mono text-sm uppercase tracking-[0.14em] text-foreground/60">{label}</span>
      <span
        className="font-mono text-base font-semibold tabular-nums"
        style={{ color: color ? BRAND_VAR[color] : "var(--foreground)" }}
      >
        {children}
      </span>
    </div>
  );
}

/** A legend swatch: a short trace segment, solid or dashed. */
export function Swatch({ color, dashed = false, label }: { color: string; dashed?: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-foreground/80">
      <svg aria-hidden width="18" height="6" viewBox="0 0 18 6">
        <line
          x1="1"
          y1="3"
          x2="17"
          y2="3"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={dashed ? "3 3" : undefined}
        />
      </svg>
      {label}
    </span>
  );
}

/** A bench key: square-shouldered, engraved, lit in the channel colour. */
export function BenchKey({
  color,
  onClick,
  disabled,
  children,
}: {
  color: BrandKey;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 font-mono text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
      style={{
        color: BRAND_VAR[color],
        borderColor: tint(color, 45),
        background: tint(color, 10),
        boxShadow: `inset 0 -2px 0 ${tint(color, 22)}`,
      }}
    >
      {children}
    </button>
  );
}
