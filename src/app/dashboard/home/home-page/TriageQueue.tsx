"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, ListChecks, Mail } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import { MOCK_HEALTH_ISSUES, MOCK_MESSAGES } from "@/lib/mock-dashboard-data";
import { useReviewStore } from "@/stores/reviewStore";

const MAX_ROWS = 6;

type TriageType = "review" | "alert" | "message";

interface TriageRow {
  id: string;
  type: TriageType;
  title: string;
  personaName?: string;
  personaColor?: string;
  iso: string;
  /** Lower = more urgent (drives ordering and the severity dot). */
  rank: number;
}

// Maps each source's severity vocabulary onto one 0–4 urgency scale.
const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  warning: 1,
  medium: 2,
  info: 3,
  low: 4,
};

const RANK_DOT = ["bg-rose-400", "bg-amber-400", "bg-cyan-400", "bg-muted-dark", "bg-muted-dark"];

const TYPE_META: Record<
  TriageType,
  { icon: React.ElementType; chip: string; href: string }
> = {
  review: {
    icon: ClipboardCheck,
    chip: "border-amber-500/20 bg-amber-500/8 text-amber-400",
    href: "/dashboard/reviews",
  },
  alert: {
    icon: AlertTriangle,
    chip: "border-rose-500/20 bg-rose-500/8 text-rose-400",
    href: "/dashboard/observability",
  },
  message: {
    icon: Mail,
    chip: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
    href: "/dashboard/messages",
  },
};

/**
 * Triage queue: one ranked list merging pending reviews, open health alerts,
 * and unread messages — the web counterpart to the desktop overview's
 * TriagePane. Items are sorted by urgency, then recency, and capped at
 * MAX_ROWS so the card stays glanceable.
 */
export function TriageQueue() {
  const { t } = useTranslation();
  const tr = t.dashboard.home.triage;
  const reviews = useReviewStore((s) => s.reviews);

  const rows = useMemo<TriageRow[]>(() => {
    const reviewRows: TriageRow[] = reviews
      .filter((r) => r.status === "pending")
      .map((r) => ({
        id: `review-${r.id}`,
        type: "review" as const,
        title: (r.content || "").split("\n")[0] || tr.review,
        personaName: r.personaName,
        personaColor: r.personaColor,
        iso: r.createdAt,
        rank: SEVERITY_RANK[r.severity] ?? 2,
      }));

    const alertRows: TriageRow[] = MOCK_HEALTH_ISSUES.filter((i) => i.status === "open").map((i) => ({
      id: `alert-${i.id}`,
      type: "alert" as const,
      title: i.title,
      personaName: i.personaName,
      iso: i.detectedAt,
      rank: SEVERITY_RANK[i.severity] ?? 2,
    }));

    const messageRows: TriageRow[] = MOCK_MESSAGES.filter((m) => m.status === "unread").map((m) => ({
      id: `message-${m.id}`,
      type: "message" as const,
      title: m.subject,
      personaName: m.persona,
      personaColor: m.personaColor,
      iso: m.timestamp,
      rank: 2,
    }));

    return [...reviewRows, ...alertRows, ...messageRows]
      .sort((a, b) => a.rank - b.rank || new Date(b.iso).getTime() - new Date(a.iso).getTime())
      .slice(0, MAX_ROWS);
  }, [reviews, tr.review]);

  return (
    <GlowCard accent="amber" className="h-full p-5">
      <div className="mb-4 flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">{tr.title}</h2>
        {rows.length > 0 && (
          <span className="ml-auto rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-sm font-medium tabular-nums text-amber-400">
            {rows.length}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-dark">{tr.empty}</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row) => {
            const meta = TYPE_META[row.type];
            const Icon = meta.icon;
            const typeLabel = row.type === "review" ? tr.review : row.type === "alert" ? tr.alert : tr.message;
            return (
              <Link
                key={row.id}
                href={meta.href}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.03] focus-ring focus-visible:ring-offset-0"
              >
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${RANK_DOT[row.rank] ?? "bg-muted-dark"}`} />
                <span
                  className={`inline-flex flex-shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-sm font-medium ${meta.chip}`}
                >
                  <Icon className="h-3 w-3" />
                  {typeLabel}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{row.title}</span>
                <span className="flex-shrink-0 whitespace-nowrap text-sm text-muted-dark">
                  {relativeTime(row.iso)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </GlowCard>
  );
}
