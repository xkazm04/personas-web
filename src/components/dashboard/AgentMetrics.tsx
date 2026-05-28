"use client";

import { DollarSign, Layers, Timer, type LucideIcon } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import type { Persona } from "@/lib/types";

/**
 * A single labeled constraint chip: an icon hints the meaning pre-attentively,
 * the value is rendered in tabular-nums so columns of digits stay aligned, and
 * a muted label spells out what the number is. `title`/`aria-label` carry the
 * full sentence for screen readers and hover tooltips.
 */
function Metric({
  icon: Icon,
  value,
  label,
  title,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  title: string;
}) {
  return (
    <span
      title={title}
      aria-label={title}
      className="inline-flex items-center gap-1.5 rounded-lg border border-glass bg-white/[0.03] px-2.5 py-1 text-xs"
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5 text-muted-dark" />
      <span className="font-mono tabular-nums text-foreground">{value}</span>
      <span className="text-muted-dark">{label}</span>
    </span>
  );
}

/**
 * The shared constraint row for a persona, used by both AgentCard and
 * AgentDetailDrawer so the two surfaces stay visually identical as the metric
 * set evolves.
 */
export default function AgentMetrics({ persona }: { persona: Persona }) {
  const { t } = useTranslation();
  const ui = t.dashboardUi;

  const concurrency = String(persona.maxConcurrent);
  const seconds = (persona.timeoutMs / 1000).toFixed(0);
  const budget =
    persona.maxBudgetUsd != null ? `$${persona.maxBudgetUsd.toFixed(2)}` : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Metric
        icon={Layers}
        value={concurrency}
        label={ui.metricConcurrency}
        title={ui.metricConcurrencyTitle.replace("{n}", concurrency)}
      />
      <Metric
        icon={Timer}
        value={`${seconds}s`}
        label={ui.metricTimeout}
        title={ui.metricTimeoutTitle.replace("{n}", seconds)}
      />
      {persona.maxBudgetUsd ? (
        <Metric
          icon={DollarSign}
          value={budget!}
          label={ui.metricBudget}
          title={ui.metricBudgetTitle.replace("{n}", budget!)}
        />
      ) : null}
    </div>
  );
}
