"use client";

import { Check, ChevronRight, Folder } from "lucide-react";
import { FILES } from "./driveData";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

const E = "var(--brand-emerald)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/**
 * The Drive plugin's browser: every export as a row, newest lit, with the
 * agent that made it. Rows hold their place before they land (constant
 * markup) and fade in as their file drops into the drawer.
 */
export default function DriveBrowser({ landed, updated }: { landed: number; updated: boolean }) {
  const copy = featuresSectionsCopy.plugins.drive;
  return (
    <div className="flex min-h-0 flex-col rounded-2xl border px-3 py-3" style={{ borderColor: mix(E, 24), background: mix(E, 4) }}>
      <div className="mb-2 flex items-center gap-1.5 px-1 font-mono text-[14px] text-foreground/70">
        <Folder className="h-4 w-4" style={{ color: E }} aria-hidden="true" />
        <span className="font-semibold" style={{ color: E }}>{copy.browse}</span>
        <ChevronRight className="h-3.5 w-3.5 text-foreground/60" aria-hidden="true" />
        <span>{copy.title}</span>
        <ChevronRight className="h-3.5 w-3.5 text-foreground/60" aria-hidden="true" />
        <span className="text-foreground/85">{copy.folder}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {FILES.map((f, i) => {
          const shown = i < landed;
          const newest = shown && i === landed - 1 && !updated;
          const Icon = f.icon;
          return (
            <li
              key={f.name}
              className="flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition-[opacity,background,border-color] duration-500"
              style={{
                opacity: shown ? 1 : 0,
                borderColor: newest ? mix(E, 50) : "transparent",
                background: newest ? mix(E, 14) : mix("var(--foreground)", 3),
              }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: mix(E, 14) }}>
                <Icon className="h-4 w-4" style={{ color: E }} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block font-mono text-[14px] text-foreground/90">{f.name}</span>
                <span className="block text-[13px] text-foreground/65">{copy.agents[f.agent]}</span>
              </span>
              <span
                className="flex shrink-0 items-center gap-1 font-mono text-[13px] font-semibold transition-opacity duration-500"
                style={{ color: E, opacity: updated ? 1 : 0 }}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.kept}
              </span>
              <span className="w-[54px] shrink-0 text-right font-mono text-[13px] tabular-nums text-foreground/65">{f.size}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
