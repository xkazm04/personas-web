"use client";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Learning time-lapse scrubber for the Memories tab. A native range input, so
 * it steps through stills by construction (no animation to gate). Day 1 is the
 * earliest `acceptedAt` in the data, never "today", so a returning visitor
 * sees the same history rather than one re-seeded against the visit.
 */
export function MemoriesTimeline({
  day,
  totalDays,
  onChange,
}: {
  /** 1-based day of the replay; `totalDays` means "everything learned". */
  day: number;
  totalDays: number;
  onChange: (day: number) => void;
}) {
  const { t } = useTranslation();
  const label = t.memoriesPage.timeline.label;
  const dayLabel = t.memoriesPage.timeline.dayOf
    .replace("{day}", String(day))
    .replace("{total}", String(totalDays));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-glass bg-surface px-3 py-2">
      <label
        htmlFor="memories-timeline"
        className="text-xs font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id="memories-timeline"
        type="range"
        min={1}
        max={totalDays}
        step={1}
        value={day}
        aria-valuetext={dayLabel}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-[160px] flex-1 accent-brand-cyan"
      />
      <span className="text-xs text-muted-dark tabular-nums">{dayLabel}</span>
      {day < totalDays ? (
        <button
          type="button"
          onClick={() => onChange(totalDays)}
          className="text-xs text-brand-cyan hover:underline"
        >
          {t.memoriesPage.timeline.showAll}
        </button>
      ) : null}
    </div>
  );
}
