"use client";

import { ArrowDown, ArrowUp, ArrowUpRight, Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { guideHref, openGuideLink } from "@/lib/guide-link";
import { EYEBROW } from "@/lib/typography";
import type { StackLayer } from "./layers";

/**
 * The tabpanel for the selected layer: which question it answers about the
 * agent, what it is doing for the sample agent right now (the lit part of the
 * card), then the layer's own copy from data.ts. Every layer's one-line job is
 * already visible in the stack; this adds the detail.
 */
export function LayerDetail({
  layer,
  index,
  total,
  panelId,
  labelledBy,
  next,
  onNext,
}: {
  layer: StackLayer;
  index: number;
  total: number;
  panelId: string;
  labelledBy: string;
  /** The layer below this one (wraps to the top), to walk the stack. */
  next: StackLayer;
  onNext: () => void;
}) {
  const color = BRAND_VAR[layer.brand];
  const Icon = layer.icon;
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-glass bg-white/[0.02] p-5 sm:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-colors duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${tint(layer.brand, 60)}, transparent)` }}
      />
      <div className={EYEBROW}>
        Layer {index + 1} of {total}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
          style={{ borderColor: tint(layer.brand, 25), backgroundColor: tint(layer.brand, 10) }}
        >
          <Icon className="h-5 w-5" style={{ color }} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-2xl font-bold tracking-tight" style={{ color }}>
            {layer.card.title}
          </h3>
          <p className="text-sm text-muted">{layer.question}</p>
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-glass bg-white/[0.03] py-2 pl-3 pr-3"
        style={{ borderLeft: `2px solid ${color}` }}
      >
        <div className="text-xs text-muted">In this agent</div>
        <div className="mt-0.5 text-sm font-medium text-foreground">{layer.inAgent}</div>
      </div>

      <p className="mt-5 text-base leading-relaxed text-muted">{layer.card.description}</p>

      <ul className="mt-4 space-y-2">
        {layer.details.map((d) => (
          <li key={d} className="flex items-start gap-2 text-sm text-foreground/90">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            {d}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-6">
        {layer.card.guideTopics?.[0] && (
          <button
            type="button"
            onClick={() => openGuideLink(guideHref(layer.card.guideTopics![0]))}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium outline-none hover:underline focus-visible:underline"
            style={{ color }}
          >
            {layer.card.guideTopics[0].label}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="group ml-auto flex cursor-pointer items-center gap-3 rounded-lg border border-glass bg-white/[0.02] px-3 py-2 text-left outline-none transition-colors hover:border-glass-hover focus-visible:ring-2 focus-visible:ring-brand-cyan/70"
        >
          <span className="flex flex-col">
            <span className="text-xs text-muted">{index === total - 1 ? "Back to the top" : "Next layer down"}</span>
            <span className="text-sm font-medium text-foreground">
              {next.card.title}: <span className="font-normal text-muted">{next.question}</span>
            </span>
          </span>
          {index === total - 1 ? (
            <ArrowUp className="h-4 w-4 shrink-0 text-muted group-hover:text-foreground" aria-hidden />
          ) : (
            <ArrowDown className="h-4 w-4 shrink-0 text-muted group-hover:text-foreground" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
