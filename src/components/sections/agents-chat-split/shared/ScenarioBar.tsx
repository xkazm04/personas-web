"use client";

import { Pause, Play } from "lucide-react";
import type { StoryClock } from "./useStoryClock";
import { CUSTOMER, mix } from "./scenarios";
import { zoomStyle } from "./zoom";
import { howSectionsCopy } from "@/i18n/pending/howSections";

/** The scenario picker: one pill per customer message, the playing one filling
 *  with the story's progress, and the auto-play toggle. Real buttons, so the
 *  whole row is keyboard reachable. */
export default function ScenarioBar({ clock, className = "" }: { clock: StoryClock; className?: string }) {
  const c = howSectionsCopy.chat;
  const autoLabel = clock.held ? c.resume : c.pause;

  return (
    <div role="group" aria-label={c.pickLabel} className={`flex flex-wrap items-center justify-center gap-2 ${className}`} style={zoomStyle}>
      {c.scenarios.map((s, i) => {
        const active = i === clock.index;
        return (
          <button
            key={s.name}
            type="button"
            aria-pressed={active}
            onClick={() => clock.select(i)}
            className="relative overflow-hidden rounded-full border px-4 py-1.5 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
            style={{
              borderColor: active ? mix(CUSTOMER, 50) : "var(--border-glass-hover)",
              color: active ? "var(--foreground)" : "var(--muted)",
              background: active ? mix(CUSTOMER, 8) : "transparent",
            }}
          >
            {active && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 origin-left"
                style={{ width: "100%", transform: `scaleX(${clock.progress})`, background: mix(CUSTOMER, 16) }}
              />
            )}
            <span className="relative">{s.name}</span>
          </button>
        );
      })}
      {!clock.still && (
        <button
          type="button"
          onClick={clock.toggleHeld}
          aria-label={autoLabel}
          title={autoLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-glass text-foreground/70 transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
        >
          {clock.held ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
        </button>
      )}
    </div>
  );
}
