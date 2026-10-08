"use client";

import { CircleAlert, CircleCheck, CircleDashed, CircleMinus, PauseCircle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { detectCostAnomalies } from "@/lib/observabilitySeries";
import type { DailyMetric, HealthIssue } from "@/lib/types";
import type { SourceState } from "./readings";

const PANEL = "rounded-2xl border border-glass bg-white/[0.02] p-5";
const TITLE = "text-xs font-semibold uppercase tracking-[0.2em] text-muted-dark";

const ISSUE_TONE: Record<HealthIssue["status"], string> = {
  open: "text-status-warning",
  auto_fixed: "text-status-success",
  resolved: "text-muted",
};

/** Self-healing: every issue in the window, open ones first. */
export function HealingIssues({ issues }: { issues: HealthIssue[] }) {
  const { t } = useTranslation();
  const copy = t.dashboard.home.mission.detail;
  const order: HealthIssue["status"][] = ["open", "auto_fixed", "resolved"];
  const sorted = [...issues].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <section className={PANEL}>
      <h3 className={TITLE}>{copy.issuesTitle}</h3>
      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-muted-dark">{copy.issuesEmpty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-glass">
          {sorted.map((issue) => {
            const paused = issue.status === "open" && "isCircuitBreaker" in issue && issue.isCircuitBreaker === true;
            return (
              <li key={issue.id} className="flex items-start gap-3 py-3">
                {paused ? (
                  <PauseCircle aria-hidden className="mt-0.5 h-4 w-4 flex-none text-status-error" />
                ) : issue.status === "open" ? (
                  <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 flex-none text-status-warning" />
                ) : (
                  <CircleCheck aria-hidden className="mt-0.5 h-4 w-4 flex-none text-status-success" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{issue.title}</p>
                  {issue.personaName && <p className="text-sm text-muted-dark">{issue.personaName}</p>}
                </div>
                {paused && (
                  <span className="rounded-full border border-status-error/40 px-2 py-0.5 text-xs font-medium text-status-error">
                    {copy.pausedBadge}
                  </span>
                )}
                <span className={`text-xs font-semibold uppercase tracking-wider ${ISSUE_TONE[issue.status]}`}>
                  {copy.issueStatus[issue.status]}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Spend: one bar per day, spike days in the warning colour. */
export function CostByDay({ daily }: { daily: DailyMetric[] }) {
  const { t } = useTranslation();
  const copy = t.dashboard.home.mission.detail;
  const spikes = new Set(detectCostAnomalies(daily, 2).map((anomaly) => anomaly.date));
  const max = Math.max(0.0001, ...daily.map((day) => day.cost));

  return (
    <section className={PANEL}>
      <div className="flex items-center justify-between gap-4">
        <h3 className={TITLE}>{copy.costTitle}</h3>
        {spikes.size > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-status-warning">
            <span aria-hidden className="h-2 w-2 rounded-sm bg-status-warning" />
            {copy.costSpike}
          </span>
        )}
      </div>
      <ol className="mt-5 flex h-48 items-end gap-1.5">
        {daily.map((day) => {
          const spike = spikes.has(day.date);
          return (
            <li
              key={day.date}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={`${day.date} · $${day.cost.toFixed(2)}`}
            >
              <span
                className={`w-full rounded-t ${spike ? "bg-status-warning" : "bg-brand-cyan/50"}`}
                style={{ height: `${Math.max(2, (day.cost / max) * 100)}%` }}
              />
              <span className="text-xs tabular-nums text-muted-dark">{day.date.slice(8)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const SOURCE_ICON = { pending: CircleDashed, ok: CircleCheck, unserved: CircleMinus, failed: CircleAlert } as const;
const SOURCE_TONE = {
  pending: "text-muted-dark",
  ok: "text-status-success",
  unserved: "text-muted-dark",
  failed: "text-status-error",
} as const;

/** Instruments: each source this page reads, and whether it answered. */
export function SourcesList({ sources }: { sources: SourceState[] }) {
  const { t } = useTranslation();
  const copy = t.dashboard.home.mission.detail;
  const statusLabel = {
    ...copy.sourceStatus,
    unserved: t.dashboard.home.mission.verdicts.unmeasured,
  };
  return (
    <section className={PANEL}>
      <h3 className={TITLE}>{copy.sourcesTitle}</h3>
      <ul className="mt-3 divide-y divide-glass">
        {sources.map((source) => {
          const Icon = SOURCE_ICON[source.status];
          return (
            <li key={source.key} className="flex items-center gap-3 py-2.5">
              <Icon aria-hidden className={`h-4 w-4 flex-none ${SOURCE_TONE[source.status]}`} />
              <span className="flex-1 text-sm text-foreground">{copy.sources[source.key]}</span>
              {source.error && <span className="truncate text-sm text-muted">{source.error}</span>}
              <span className={`text-xs font-semibold uppercase tracking-wider ${SOURCE_TONE[source.status]}`}>
                {statusLabel[source.status]}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
