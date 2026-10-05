"use client";

import Image from "next/image";
import { Check, Circle, Sparkles, X } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { STEPS, type StepKey } from "./data";

/**
 * The run as the app lists it: four steps with their tools. `failAt` marks
 * the broken step (later steps wait); `healed` shows the finished run with the
 * healed step tagged.
 */
export default function RunCard({
  name,
  time,
  labels,
  failAt,
  healed,
  healedTag,
}: {
  name: string;
  time: string;
  labels: Record<StepKey, string>;
  failAt: number;
  healed: boolean;
  healedTag: string;
}) {
  return (
    <div className="w-[14em] shrink-0 rounded-[0.8em] border border-glass bg-background/70 px-[0.7em] py-[0.6em] shadow-[0_0.8em_2em_-1em_color-mix(in_srgb,var(--background)_80%,transparent)]">
      <div className="mb-[0.3em] flex items-baseline justify-between gap-[0.5em]">
        <span className="font-semibold text-foreground">{name}</span>
        <span className="font-mono text-[0.8em] text-foreground/65">{time}</span>
      </div>
      <ol className="flex flex-col gap-[0.15em]">
        {STEPS.map((s, i) => {
          const state = healed || i < failAt ? "done" : i === failAt ? "fail" : "wait";
          const k = state === "fail" ? "rose" : "emerald";
          return (
            <li
              key={s.key}
              className="flex items-center gap-[0.55em] rounded-[0.5em] px-[0.45em] py-[0.12em] leading-snug"
              style={{ background: state === "fail" ? tint("rose", 14) : healed && i === failAt ? tint("emerald", 12) : "transparent" }}
            >
              <span className="flex h-[1.1em] w-[1.1em] shrink-0 items-center justify-center">
                {s.icon ? (
                  <Image src={s.icon} alt="" width={24} height={24} className="connector-icon h-full w-full object-contain" />
                ) : (
                  <Sparkles className="h-full w-full" style={{ color: BRAND_VAR.purple }} aria-hidden />
                )}
              </span>
              <span className={`min-w-0 flex-1 text-[0.9em] ${state === "wait" ? "text-foreground/60" : "text-foreground"}`}>{labels[s.key]}</span>
              {healed && i === failAt && (
                <span className="text-[0.8em] font-semibold uppercase tracking-wider" style={{ color: BRAND_VAR.emerald }}>
                  {healedTag}
                </span>
              )}
              {state === "wait" ? (
                <Circle className="h-[0.9em] w-[0.9em] text-foreground/60" aria-hidden />
              ) : state === "fail" ? (
                <X className="h-[1em] w-[1em]" strokeWidth={3} style={{ color: BRAND_VAR[k] }} aria-hidden />
              ) : (
                <Check className="h-[1em] w-[1em]" strokeWidth={3} style={{ color: BRAND_VAR[k] }} aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
