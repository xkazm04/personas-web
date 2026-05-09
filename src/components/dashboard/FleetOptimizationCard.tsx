"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  Lightbulb,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import type {
  FleetRecommendation,
  FleetRecommendationSeverity,
} from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";

const severityStyles: Record<
  FleetRecommendationSeverity,
  {
    container: string;
    chip: string;
    icon: React.ElementType;
    iconTone: string;
  }
> = {
  urgent: {
    container: "border-rose-500/30 bg-rose-500/[0.06]",
    chip: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: AlertTriangle,
    iconTone: "text-rose-400",
  },
  suggested: {
    container: "border-amber-500/25 bg-amber-500/[0.05]",
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: Sparkles,
    iconTone: "text-amber-400",
  },
  insight: {
    container: "border-cyan-500/25 bg-cyan-500/[0.04]",
    chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: Lightbulb,
    iconTone: "text-cyan-400",
  },
};

interface Props {
  recommendation: FleetRecommendation | null;
  executionCount: number;
  minExecutions?: number;
}

export default function FleetOptimizationCard({
  recommendation,
  executionCount,
  minExecutions = 10,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!recommendation || executionCount < minExecutions || dismissed) {
    return null;
  }

  const style = severityStyles[recommendation.severity];
  const SeverityIcon = style.icon;
  const severityLabel =
    t.dashboard.fleet.severity[recommendation.severity];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${style.container} backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3 p-5">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ${style.iconTone}`}
        >
          <SeverityIcon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {t.dashboard.fleet.title}
            </h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-sm font-medium ${style.chip}`}
            >
              {severityLabel}
            </span>
            {recommendation.personaName && (
              <span className="text-sm text-muted-dark">
                · {recommendation.personaName}
              </span>
            )}
            <span className={`ml-auto text-sm font-semibold tabular-nums ${style.iconTone}`}>
              {recommendation.impact}
            </span>
          </div>

          <p className="mt-2 text-base font-medium text-foreground">
            {recommendation.title}
          </p>
          <p className="mt-1 text-sm text-muted">{recommendation.summary}</p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-2.5 py-1 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              {expanded
                ? t.dashboard.fleet.collapse
                : t.dashboard.fleet.expand}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {recommendation.actionHref && (
              <Link
                href={recommendation.actionHref}
                className="rounded-lg border border-glass-hover bg-white/[0.03] px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]"
              >
                {recommendation.actionLabel}
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t.dashboard.fleet.dismiss}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-muted-dark transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-glass-hover"
          >
            <div className="px-5 py-4 text-sm leading-relaxed text-muted">
              {recommendation.detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
