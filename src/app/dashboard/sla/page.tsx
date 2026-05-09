"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import GradientText from "@/components/GradientText";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_SLA_BREACHES,
  MOCK_SLA_TARGETS,
  type SLAMetricType,
  type SLASeverity,
  type SLATarget,
} from "@/lib/mock-dashboard-data";
import { relativeTime } from "@/lib/format";
import { useTranslation } from "@/i18n/useTranslation";

function complianceBand(value: number): {
  text: string;
  bar: string;
  pill: string;
} {
  if (value >= 0.995)
    return {
      text: "text-emerald-400",
      bar: "bg-emerald-400/70",
      pill: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    };
  if (value >= 0.98)
    return {
      text: "text-cyan-400",
      bar: "bg-cyan-400/70",
      pill: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
    };
  if (value >= 0.95)
    return {
      text: "text-amber-400",
      bar: "bg-amber-400/70",
      pill: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    };
  return {
    text: "text-rose-400",
    bar: "bg-rose-400/70",
    pill: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  };
}

const severityPill: Record<SLASeverity, string> = {
  minor: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  major: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

function formatValue(target: SLATarget): string {
  if (target.unit === "ms") {
    return target.current >= 1000
      ? `${(target.current / 1000).toFixed(1)}s`
      : `${Math.round(target.current)}ms`;
  }
  return `${target.current.toFixed(target.current < 100 ? 2 : 1)}${target.unit}`;
}

function formatTarget(target: SLATarget): string {
  if (target.unit === "ms") {
    return target.target >= 1000
      ? `${(target.target / 1000).toFixed(0)}s`
      : `${target.target}ms`;
  }
  return `${target.target}${target.unit}`;
}

function metricKey(metric: SLAMetricType) {
  return metric;
}

export default function SLAPage() {
  const { t } = useTranslation();
  const [fetchedAt] = useState(() => Date.now());

  const { overallCompliance, activeBreachCount } = useMemo(() => {
    const avg =
      MOCK_SLA_TARGETS.reduce((sum, s) => sum + s.timeInSLA, 0) /
      Math.max(1, MOCK_SLA_TARGETS.length);
    const active = MOCK_SLA_TARGETS.filter((s) => s.activeBreach).length;
    return { overallCompliance: avg, activeBreachCount: active };
  }, []);

  const complianceBandTop = complianceBand(overallCompliance);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-emerald/25 bg-brand-emerald/10">
          <Activity className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{t.slaPage.title}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">{t.slaPage.subtitle}</p>
        </div>
        <StalenessIndicator fetchedAt={fetchedAt} className="mt-2" />
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
            {t.slaPage.compliance}
          </p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${complianceBandTop.text}`}
          >
            {(overallCompliance * 100).toFixed(2)}%
          </p>
        </div>
        <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
            {t.slaPage.activeBreaches}
          </p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${
              activeBreachCount > 0 ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {activeBreachCount}
          </p>
        </div>
        <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
            {t.slaPage.objectives}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {MOCK_SLA_TARGETS.length}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        {MOCK_SLA_TARGETS.map((s) => {
          const band = complianceBand(s.timeInSLA);
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-glass bg-white/[0.02] p-4"
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: s.personaColor }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {s.persona}
                  </p>
                  <p className="text-sm text-muted-dark">
                    {t.slaPage.metricType[metricKey(s.metric)]}
                  </p>
                </div>
                {s.activeBreach ? (
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-dark">{t.slaPage.target}</p>
                  <p className="tabular-nums font-medium text-foreground">
                    {formatTarget(s)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-dark">{t.slaPage.current}</p>
                  <p
                    className={`tabular-nums font-medium ${
                      s.activeBreach ? "text-rose-400" : "text-foreground"
                    }`}
                  >
                    {formatValue(s)}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-dark">{t.slaPage.timeInSla}</span>
                  <span className={`tabular-nums font-medium ${band.text}`}>
                    {(s.timeInSLA * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full ${band.bar}`}
                    style={{ width: `${s.timeInSLA * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-glass bg-white/[0.02] p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-dark" />
          <h2 className="text-base font-semibold text-foreground">
            {t.slaPage.breachLog.title}
          </h2>
        </div>
        {MOCK_SLA_BREACHES.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-dark">
            {t.slaPage.breachLog.empty}
          </p>
        ) : (
          <div className="space-y-1">
            {MOCK_SLA_BREACHES.map((br) => {
              const durationLabel = t.slaPage.breachLog.duration.replace(
                "{n}",
                String(br.durationMinutes),
              );
              const ongoing = br.resolvedAt === null;
              return (
                <div
                  key={br.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
                >
                  <span
                    className={`rounded-full border px-2 py-0.5 text-sm font-medium ${severityPill[br.severity]}`}
                  >
                    {t.slaPage.severity[br.severity]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {br.summary}
                    </p>
                    <p className="text-sm text-muted-dark">
                      {br.persona} · {t.slaPage.metricType[metricKey(br.metric)]}{" "}
                      · {relativeTime(br.startedAt)}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums text-muted-dark">
                    {durationLabel}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-sm font-medium ${
                      ongoing
                        ? "border border-rose-500/25 bg-rose-500/10 text-rose-300"
                        : "text-muted-dark"
                    }`}
                  >
                    {ongoing
                      ? t.slaPage.breachLog.ongoing
                      : relativeTime(br.resolvedAt ?? br.startedAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
