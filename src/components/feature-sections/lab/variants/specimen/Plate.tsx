"use client";

import { useId, type ReactNode, type Ref } from "react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import type { LabTab } from "../../types";
import { specimenCopy } from "./copy";

/*
 * The field-guide plate every Specimen tab is mounted on: a catalogue line
 * (plate numeral, title, the species' italic name), an agar body that fills
 * the stage slot, and a footer for the plate's legend and actions. All four
 * plates share this frame, so switching tabs never moves the page.
 */

export const TAB_ACCENT: Record<LabTab, BrandKey> = {
  chat: "cyan",
  arena: "purple",
  evolution: "amber",
  eval: "emerald",
};

/** "g4a" -> "G4·a": a genome node as a specimen catalogue code. */
export function nodeCode(id: string): string {
  const m = /^g(\d+)([a-z]?)$/.exec(id);
  if (!m) return id;
  const code = fillTemplate(specimenCopy.nodeCode, { gen: m[1], branch: m[2] });
  return m[2] ? code : code.replace(/·$/, "");
}

export function strainLabel(version: string): string {
  return fillTemplate(specimenCopy.strain, { version });
}

export function Plate({
  tab,
  title,
  status,
  footer,
  bodyRef,
  children,
}: {
  tab: LabTab;
  title: string;
  status?: ReactNode;
  footer: ReactNode;
  bodyRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  const accent = TAB_ACCENT[tab];
  return (
    <section className="relative flex flex-col overflow-hidden rounded-xl border border-glass bg-background/80 backdrop-blur-xl stage:h-full">
      <Agar accent={accent} />
      <header className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-glass px-5 py-2.5 stage:py-2">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-mono text-sm uppercase tracking-[0.16em]" style={{ color: BRAND_VAR[accent] }}>
            {specimenCopy.plate} {specimenCopy.numerals[tab]}
          </span>
          <span className="text-base font-semibold text-foreground">{title}</span>
          <span className="hidden truncate font-serif text-base italic text-foreground/75 sm:inline">{specimenCopy.species}</span>
        </div>
        {status && <div className="flex items-center gap-3 font-mono text-sm text-foreground/80">{status}</div>}
      </header>
      <div ref={bodyRef} className="relative h-[22rem] stage:h-auto stage:min-h-0 stage:flex-1">
        {children}
      </div>
      <footer className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-glass px-5 py-2.5 font-mono text-sm stage:py-2">
        {footer}
      </footer>
    </section>
  );
}

/** Agar under glass: a tinted bloom and a faint cell-count grid. */
function Agar({ accent }: { accent: BrandKey }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id={`${id}b`} cx="35%" cy="45%" r="75%">
          <stop offset="0%" stopColor={BRAND_VAR[accent]} stopOpacity={0.1} />
          <stop offset="100%" stopColor={BRAND_VAR[accent]} stopOpacity={0} />
        </radialGradient>
        <pattern id={`${id}g`} width={24} height={24} patternUnits="userSpaceOnUse">
          <circle cx={12} cy={12} r={0.9} fill="var(--foreground)" fillOpacity={0.12} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}g)`} />
      <rect width="100%" height="100%" fill={`url(#${id}b)`} />
    </svg>
  );
}

/** A specimen tag: a punched hole, then mono text, in a brand tint. */
export function SpecTag({ color, children, solid }: { color: BrandKey; children: ReactNode; solid?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border py-0.5 pl-1.5 pr-2 font-mono text-sm leading-tight text-foreground"
      style={{ borderColor: tint(color, 55), background: tint(color, solid ? 22 : 10) }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full border" style={{ borderColor: BRAND_VAR[color] }} />
      {children}
    </span>
  );
}

/** One legend entry: a swatch (filled, ring or dashed) and a label. */
export function Legend({ color, kind = "fill", children }: { color: string; kind?: "fill" | "ring" | "dash"; children: ReactNode }) {
  const swatch =
    kind === "fill"
      ? { background: color }
      : { border: `1.5px ${kind === "dash" ? "dashed" : "solid"} ${color}` };
  return (
    <span className="flex items-center gap-1.5 text-foreground/80">
      <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={swatch} />
      {children}
    </span>
  );
}
