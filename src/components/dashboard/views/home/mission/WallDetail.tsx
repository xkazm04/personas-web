"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { DimensionView } from "./dimensions";
import { Lamp, VERDICT_TONE } from "./Lamp";

/**
 * Layer 2 of the wall: every dimension stays reachable on the left rail, the
 * open one fills the right with its evidence. 1-8 jumps, the arrows walk the
 * rail, Esc goes back to the wall (keys live in the parent).
 */
export function WallDetail({
  dims,
  open,
  onSelect,
  onBack,
  children,
}: {
  dims: DimensionView[];
  open: DimensionView;
  onSelect: (dim: DimensionView) => void;
  onBack: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const copy = t.dashboard.home.mission;
  const tone = VERDICT_TONE[open.verdict];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(16rem,19rem)_1fr]">
      <nav aria-label={copy.railLabel} className="lg:sticky lg:top-24 lg:self-start">
        <ul className="space-y-1 rounded-2xl border border-glass bg-white/[0.02] p-2">
          {dims.map((dim) => {
            const active = dim.id === open.id;
            return (
              <li key={dim.id}>
                <button
                  type="button"
                  onClick={() => onSelect(dim)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                    active ? "bg-brand-cyan/10" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <Lamp verdict={dim.verdict} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{dim.label}</span>
                    <span className={`block truncate text-xs ${VERDICT_TONE[dim.verdict].text}`}>{dim.state}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground/85">{dim.figure}</span>
                  <kbd className="font-mono text-xs text-muted-dark">{dim.key}</kbd>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section aria-labelledby="mission-detail-title" className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm text-muted-dark">
          <button
            type="button"
            onClick={onBack}
            aria-label={copy.backToWall}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand-cyan"
          >
            <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
            {t.dashboard.missionControl}
          </button>
          <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          <span className="text-foreground">{open.label}</span>
        </div>

        <header className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-glass pb-4">
          <h2 id="mission-detail-title" tabIndex={-1} className="flex outline-none items-center gap-2.5 text-xl font-semibold text-foreground">
            <Lamp verdict={open.verdict} />
            {open.label}
          </h2>
          <span className="text-2xl font-semibold tabular-nums text-foreground">{open.figure}</span>
          <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${tone.text}`}>{open.state}</span>
          <p className="w-full text-sm text-muted">
            {open.question} <span className="text-muted-dark">· {open.evidence}</span>
          </p>
        </header>

        <div className="mt-6 space-y-6">{children}</div>
      </section>
    </div>
  );
}
