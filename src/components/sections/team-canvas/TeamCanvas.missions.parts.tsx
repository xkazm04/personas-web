"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, Loader2, RotateCcw, XCircle, type LucideIcon } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/* The Missions view's pieces, reduced from the app's GoalsMissions.tsx and
 * boardShared.tsx StepRelay: a numbered status badge per step, the step title,
 * the persona chip, and the amber rework badge "round {n}". */

export type StepStatus = "pending" | "running" | "done" | "failed";

const META: Record<StepStatus, { icon: LucideIcon; tone: BrandKey | null }> = {
  pending: { icon: CircleDashed, tone: null },
  running: { icon: Loader2, tone: "blue" },
  done: { icon: CheckCircle2, tone: "emerald" },
  failed: { icon: XCircle, tone: "rose" },
};

/** The persona's icon in its colour (the app's PersonaIcon). */
export function PersonaIcon({ icon: Icon, tone, ring }: { icon: LucideIcon; tone: BrandKey; ring?: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ring ? "ring-2 ring-background" : ""}`}
      style={{ backgroundColor: tint(tone, 22) }}
      aria-hidden
    >
      <Icon className="h-3.5 w-3.5" style={{ color: BRAND_VAR[tone] }} />
    </span>
  );
}

/** Persona chip: icon + name, as boardShared.tsx draws it. */
export function PersonaChip({ name, tone, icon }: { name: string; tone: BrandKey; icon: LucideIcon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-glass py-0.5 pl-0.5 pr-2 text-[11px] text-foreground/85 sm:text-[13px]" style={{ backgroundColor: "rgba(var(--surface-overlay), 0.04)" }}>
      <PersonaIcon icon={icon} tone={tone} />
      {name}
    </span>
  );
}

export function StepRow({
  status,
  title,
  persona,
  tone,
  icon,
  round,
  last,
}: {
  status: StepStatus;
  title: string;
  persona: string;
  tone: BrandKey;
  icon: LucideIcon;
  round?: string;
  last: boolean;
}) {
  const m = META[status];
  const Icon = m.icon;
  const color = m.tone ? BRAND_VAR[m.tone] : "var(--foreground)";
  return (
    <li className="relative flex gap-3">
      <div className="flex w-9 shrink-0 flex-col items-center sm:w-10">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border border-glass transition-colors duration-300 sm:h-10 sm:w-10"
          style={{ backgroundColor: m.tone ? tint(m.tone, 14) : "rgba(var(--surface-overlay), 0.04)" }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color, opacity: m.tone ? 1 : 0.6 }} aria-hidden />
        </span>
        {!last && <span className="w-px flex-1 bg-foreground/15" aria-hidden />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? "" : "pb-5 sm:pb-4"}`}>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground sm:text-[14px]">{title}</span>
          {round && (
            <span
              className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[12px] font-medium"
              style={{ color: BRAND_VAR.amber, borderColor: tint("amber", 35), backgroundColor: tint("amber", 12) }}
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              {round}
            </span>
          )}
        </div>
        <div className="mt-1">
          <PersonaChip name={persona} tone={tone} icon={icon} />
        </div>
      </div>
    </li>
  );
}

/** A mission row in the phase rail, with the app's per-step dot strip. */
export function MissionRow({ title, dots, selected, layoutId }: { title: string; dots: (StepStatus | BrandKey)[]; selected?: boolean; layoutId?: string }) {
  return (
    <motion.div
      layout="position"
      layoutId={layoutId}
      className={`rounded-lg border px-3 py-2 ${selected ? "border-foreground/25" : "border-glass"}`}
      style={{ backgroundColor: selected ? "rgba(var(--surface-overlay), 0.07)" : "rgba(var(--surface-overlay), 0.02)" }}
    >
      <div className="truncate text-[13px] text-foreground">{title}</div>
      <div className="mt-1.5 flex items-center gap-1" aria-hidden>
        {dots.map((d, i) => {
          const tone = d in META ? META[d as StepStatus].tone : (d as BrandKey);
          return (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${d === "running" ? "w-3.5" : "w-1.5"}`}
              style={{ backgroundColor: tone ? BRAND_VAR[tone] : "rgba(var(--surface-overlay), 0.2)" }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

export function PhaseHeader({ label, tone }: { label: string; tone: BrandKey }) {
  return (
    <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider" style={{ color: BRAND_VAR[tone] }}>
      {label}
    </p>
  );
}
