"use client";

import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY } from "../copy";
import type { Rect } from "../layout";
import { TargetPanel } from "./shell";

/**
 * The schedule module — a real scheduler, not a caption. Top row: clock
 * glyph, the human schedule, and an enable toggle. Bottom row: the weekday
 * selector strip, the timezone the run is pinned to, and an edit affordance.
 *
 * It arrives EMPTY: no schedule, every day dark, the switch off. The third
 * choice is what fills it — M–F light up and the toggle flips on, on that one
 * beat — so the visitor watches the schedule get set instead of finding it
 * pre-set. Nothing here moves layout: only colors and the knob's transform.
 *
 * The long schedule string swaps for its short form below md so the weekday
 * strip and the toggle keep their room without dropping under text-base.
 */
export function TriggerCard({
  rect,
  shown,
  locked,
  armed,
  reduced,
}: {
  rect: Rect;
  shown: boolean;
  locked: boolean;
  armed: boolean;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const Clock = c.triggerIcon;
  const Pencil = c.triggerHintIcon;
  const voice = armed ? ANNOTATION : ANNOTATION_DIM;
  return (
    <TargetPanel
      rect={rect}
      shown={shown}
      locked={locked}
      reduced={reduced}
      className="flex-col justify-center gap-2 px-3 py-2"
    >
      <span className="flex min-w-0 items-center gap-2">
        <Clock
          className={`h-4.5 w-4.5 shrink-0 ${armed ? "text-brand-cyan" : "text-muted-dark"}`}
          aria-hidden="true"
        />
        <span className={`hidden truncate normal-case md:inline ${voice}`}>
          {armed ? c.triggerValue : c.triggerIdle}
        </span>
        <span className={`truncate normal-case md:hidden ${voice}`}>
          {armed ? c.triggerValueShort : c.triggerIdleShort}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <span className="hidden text-base text-muted-dark sm:block">
            {armed ? c.triggerOn : c.triggerOff}
          </span>
          <Toggle on={armed} />
        </span>
      </span>

      <span className="flex min-w-0 items-center gap-1.5">
        {c.triggerDays.map((day, i) => (
          <DayCell key={i} label={day} active={armed && c.triggerActiveDays.includes(i)} />
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

/** One weekday in the selector strip — lit only once the schedule is set. */
function DayCell({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-base duration-500 transition-[background-color,border-color,color] ${
        active ? "border-brand-cyan/40 text-brand-cyan" : "border-glass text-muted-dark"
      }`}
      style={active ? { backgroundColor: tint("cyan", 14) } : undefined}
    >
      {label}
    </span>
  );
}

/** The enable switch — it flips on the beat the choice commits. */
function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative block h-5 w-9 shrink-0 rounded-full duration-500 transition-[background-color,box-shadow] ${
        on ? "" : "bg-foreground/15"
      }`}
      style={on ? { backgroundColor: tint("cyan", 55), boxShadow: brandShadow("cyan", 12, 40) } : undefined}
      aria-hidden="true"
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition-transform duration-500 ${
          on ? "translate-x-4" : ""
        }`}
      />
    </span>
  );
}
