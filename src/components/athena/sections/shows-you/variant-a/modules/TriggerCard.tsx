"use client";

import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION } from "@/components/athena/stage/athena-tokens";
import { COPY } from "../copy";
import type { Rect } from "../layout";
import { TargetPanel } from "./primitives";

/**
 * The schedule module — a real scheduler, not a caption. Top row: clock
 * glyph, the human schedule, and an enable toggle. Bottom row: the weekday
 * selector strip (weekdays lit, weekend off), the timezone the run is pinned
 * to, and an edit affordance.
 *
 * The long schedule string swaps for its short form below md so the weekday
 * strip and the toggle keep their room without dropping under text-base.
 */
export function TriggerCard({ rect, locked }: { rect: Rect; locked: boolean }) {
  const c = COPY.canvas;
  const Clock = c.triggerIcon;
  const Pencil = c.triggerHintIcon;
  return (
    <TargetPanel rect={rect} locked={locked} className="flex-col justify-center gap-2 px-3 py-2">
      <span className="flex min-w-0 items-center gap-2">
        <Clock className="h-4.5 w-4.5 shrink-0 text-brand-cyan" aria-hidden="true" />
        <span className={`hidden truncate normal-case md:inline ${ANNOTATION}`}>
          {c.triggerValue}
        </span>
        <span className={`truncate normal-case md:hidden ${ANNOTATION}`}>
          {c.triggerValueShort}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <span className="hidden text-base text-muted-dark sm:block">{c.triggerOn}</span>
          <Toggle />
        </span>
      </span>

      <span className="flex min-w-0 items-center gap-1.5">
        {c.triggerDays.map((day, i) => (
          <DayCell key={i} label={day} active={c.triggerActiveDays.includes(i)} />
        ))}
        <span className="ml-auto hidden shrink-0 text-base text-muted-dark sm:block">
          {c.triggerZone}
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 text-base text-muted-dark lg:flex">
          <Pencil className="h-4 w-4" aria-hidden="true" />
          {c.triggerHint}
        </span>
      </span>
    </TargetPanel>
  );
}

/** One weekday in the selector strip. */
function DayCell({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-base ${
        active ? "border-brand-cyan/40 text-brand-cyan" : "border-glass text-muted-dark"
      }`}
      style={active ? { backgroundColor: tint("cyan", 14) } : undefined}
    >
      {label}
    </span>
  );
}

/** The enable switch — on, because the schedule she just set is armed. */
function Toggle() {
  return (
    <span
      className="relative block h-5 w-9 shrink-0 rounded-full"
      style={{ backgroundColor: tint("cyan", 55), boxShadow: brandShadow("cyan", 12, 40) }}
      aria-hidden="true"
    >
      <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-background" />
    </span>
  );
}
