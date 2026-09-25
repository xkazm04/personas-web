"use client";

import { motion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ease } from "./Lab.shared";

/* Pieces of the "head-to-head" lab variant: a version's head with its status pill,
 * and the beat strip (the step controls, whose captions are the beat list). */

type Pill = { kind: "live" | "draft" | "previous"; text: string };

export function VersionHead({
  version,
  side,
  pill,
  still,
}: {
  version: string;
  side: "left" | "right";
  pill: Pill;
  still: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 ${
        side === "left" ? "items-end sm:justify-end" : "items-start sm:flex-row-reverse sm:justify-end"
      }`}
    >
      <StatusPill pill={pill} still={still} />
      <span className="font-mono text-xl font-bold text-foreground sm:text-3xl">{version}</span>
    </div>
  );
}

function StatusPill({ pill, still }: { pill: Pill; still: boolean }) {
  if (pill.kind === "live") {
    // One Live pill in the picture; the shared layoutId glides it between heads.
    return (
      <motion.span
        layoutId="lab-h2h-live"
        transition={ease(still, 0, 0.6)}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:text-sm"
        style={{ color: BRAND_VAR.emerald, backgroundColor: tint("emerald", 16), boxShadow: `inset 0 0 0 1px ${tint("emerald", 45)}` }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND_VAR.emerald }} aria-hidden />
        {pill.text}
      </motion.span>
    );
  }
  const draft = pill.kind === "draft";
  const Icon = draft ? Sparkles : RotateCcw;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:text-sm ${
        draft ? "" : "border border-glass text-foreground/70"
      }`}
      style={draft ? { color: BRAND_VAR.purple, backgroundColor: tint("purple", 14) } : undefined}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {pill.text}
    </span>
  );
}

export function BeatStrip({
  beats,
  beat,
  onPick,
}: {
  beats: readonly string[];
  beat: number;
  onPick: (i: number) => void;
}) {
  // Desktop: four captioned steps. Phone: four step bars and the current caption.
  return (
    <div className="flex-1">
      <ol className="grid grid-cols-4 gap-2">
        {beats.map((caption, i) => {
          const on = i === beat;
          return (
            <li key={caption}>
              <button
                type="button"
                onClick={() => onPick(i)}
                aria-pressed={on}
                aria-label={caption}
                className={`h-full w-full rounded-lg border px-2.5 pb-2 pt-2 text-left text-sm leading-snug transition-colors sm:pt-1.5 ${
                  on ? "border-glass-hover bg-foreground/[0.05] text-foreground" : "border-glass text-foreground/70 hover:text-foreground"
                }`}
              >
                <span
                  className="block h-0.5 rounded-full sm:mb-1.5"
                  style={{ backgroundColor: i <= beat ? BRAND_VAR.cyan : tint("cyan", 18) }}
                  aria-hidden
                />
                <span className="hidden sm:inline" aria-hidden>
                  {caption}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-foreground/85 sm:hidden" aria-live="polite">
        {beats[beat]}
      </p>
    </div>
  );
}
