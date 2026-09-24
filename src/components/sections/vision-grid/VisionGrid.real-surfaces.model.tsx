"use client";

import { Check } from "lucide-react";
import { PersonaChip, ScreenFrame, glass, hexTint } from "./VisionGrid.real-surfaces.chrome";
import { PERSONAS, PROVIDERS, SELECTED_MODEL } from "./VisionGrid.real-surfaces.data";

/** BYOM: the model selector's provider columns, one model chosen for this persona. */
const SELECTED_PROVIDER =
  PROVIDERS.find((p) => p.models.includes(SELECTED_MODEL)) ?? PROVIDERS[0];

export function ModelScreen() {
  return (
    <ScreenFrame title="Model" meta="per persona">
      <div className="flex h-full flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          {PROVIDERS.map((p) => (
            <div key={p.key} className="flex min-w-0 flex-col gap-1.5">
              <span className="flex items-center gap-1.5 pb-0.5">
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate text-xs font-bold text-foreground">
                  {p.label}
                </span>
              </span>
              {p.models.map((m) => {
                const on = m === SELECTED_MODEL;
                return (
                  <span
                    key={m}
                    aria-current={on || undefined}
                    className={`flex h-7 items-center gap-1 rounded-md border px-1.5 text-xs ${
                      p.key === "custom" ? "border-dashed" : ""
                    } ${on ? "font-semibold text-foreground" : "text-muted"}`}
                    style={{
                      borderColor: on
                        ? hexTint(p.color, 45)
                        : "var(--border-glass)",
                      backgroundColor: on ? hexTint(p.color, 12) : glass(0.02),
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{m}</span>
                    {on && (
                      <Check
                        aria-label="selected"
                        className="h-3 w-3 shrink-0"
                        style={{ color: p.color }}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div
          className="mt-auto flex items-center gap-2 rounded-lg border border-glass px-2 py-1.5"
          style={{ backgroundColor: glass(0.02) }}
        >
          <PersonaChip persona={PERSONAS.triage} />
          <span className="ml-auto shrink-0 text-xs text-muted">
            runs on{" "}
            <span className="font-semibold text-foreground">
              {SELECTED_PROVIDER.label} · {SELECTED_MODEL}
            </span>
          </span>
        </div>
      </div>
    </ScreenFrame>
  );
}
