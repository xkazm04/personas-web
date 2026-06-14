"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ListChecks,
  Shield,
} from "lucide-react";

import GlowCard from "@/components/GlowCard";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import { type TriageItem, type TriageKind, useTriageQueue } from "./useTriageQueue";

const KIND_META: Record<TriageKind, { Icon: React.ElementType; labelKey: "triageKindBreach" | "triageKindIncident" | "triageKindReview" }> = {
  breach: { Icon: Shield, labelKey: "triageKindBreach" },
  incident: { Icon: AlertTriangle, labelKey: "triageKindIncident" },
  review: { Icon: ClipboardCheck, labelKey: "triageKindReview" },
};

// Severity weight → tone. Mirrors the rest of the dashboard's rose/amber/cyan
// urgency ramp (see healthScoreColor / FleetOptimizationCard).
function tone(weight: number): { dot: string; chip: string } {
  if (weight >= 90) {
    return { dot: "bg-rose-400", chip: "border-rose-500/30 bg-rose-500/10 text-rose-300" };
  }
  if (weight >= 50) {
    return { dot: "bg-amber-400", chip: "border-amber-500/30 bg-amber-500/10 text-amber-300" };
  }
  return { dot: "bg-cyan-400", chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" };
}

function TriageRow({ item, kindLabel }: { item: TriageItem; kindLabel: string }) {
  const meta = KIND_META[item.kind];
  const KindIcon = meta.Icon;
  const t = tone(item.weight);
  return (
    <Link
      href={item.href}
      className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03] focus-ring focus-visible:ring-offset-0"
    >
      <span className={`h-7 w-1 flex-shrink-0 rounded-full ${t.dot}`} aria-hidden />
      {item.persona ? (
        <PersonaAvatar color={item.personaColor} name={item.persona} />
      ) : (
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted-dark">
          <KindIcon className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium ${t.chip}`}
          >
            <KindIcon className="h-3 w-3" />
            {kindLabel}
          </span>
          {item.persona && (
            <span className="truncate text-sm font-medium text-foreground">{item.persona}</span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-dark">{item.summary}</p>
      </div>
      {item.startedAt && (
        <span className="flex-shrink-0 text-xs tabular-nums text-muted-dark">
          {relativeTime(item.startedAt)}
        </span>
      )}
      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-dark" />
    </Link>
  );
}

/**
 * Triage Pane — the Mission-Control cockpit's left column. A single ranked
 * queue of the most urgent items across SLA breaches, health incidents, and
 * pending reviews (see useTriageQueue), newest-and-worst first. The web
 * counterpart to the desktop overview's Triage Pane.
 */
export function TriagePane() {
  const { t } = useTranslation();
  const labels = t.dashboard.home.cockpit;
  const items = useTriageQueue();

  return (
    <GlowCard accent="amber" className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">{labels.triageTitle}</h2>
        {items.length > 0 ? (
          <span className="ml-auto rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-sm font-medium tabular-nums text-amber-300">
            {items.length}
          </span>
        ) : (
          <span className="ml-auto text-sm text-muted-dark">{labels.triageSubtitle}</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400/80" />
          <p className="max-w-[16rem] text-sm text-muted-dark">{labels.triageEmpty}</p>
        </div>
      ) : (
        <div className="-mx-1 space-y-1 overflow-y-auto pr-1">
          {items.map((item) => (
            <TriageRow
              key={item.id}
              item={item}
              kindLabel={labels[KIND_META[item.kind].labelKey]}
            />
          ))}
        </div>
      )}
    </GlowCard>
  );
}
