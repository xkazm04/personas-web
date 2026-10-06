"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import ToolMark from "../shared/ToolMark";
import { SCENARIOS, type ScenarioId } from "./scenarios";

/** The visitor picks the event; picking one (even the current one) replays the chain. */
export default function Picker({ active, onPick }: { active: ScenarioId; onPick: (id: ScenarioId) => void }) {
  const copy = useTranslation().t.howLab.events.v2;
  return (
    <div role="group" aria-label={copy.pickLabel} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-sm uppercase tracking-wider text-muted">{copy.pickLabel}</span>
      {SCENARIOS.map((s) => {
        const on = s.id === active;
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(s.id)}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-base font-medium transition-colors"
            style={{
              borderColor: on ? tint(s.brand, 60) : "var(--border-glass-hover)",
              backgroundColor: on ? tint(s.brand, 14) : "transparent",
              color: on ? "var(--foreground)" : "var(--muted)",
            }}
          >
            <ToolMark id={s.triggerTool} className="h-4 w-4" color={on ? BRAND_VAR[s.brand] : "var(--muted)"} />
            {copy.scenarios[s.id].trigger}
          </button>
        );
      })}
    </div>
  );
}
