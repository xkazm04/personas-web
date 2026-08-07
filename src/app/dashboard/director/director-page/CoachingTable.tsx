"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { DirectorRosterEntry } from "@/lib/mock-dashboard-data";

import { AttentionTriageBar } from "./AttentionTriageBar";
import { ScoreDelta, ScoreSparkline } from "./scoreVisuals";
import {
  ATTENTION_ORDER,
  FLAG_TONE,
  attentionFlags,
  matchesFacet,
  scoreDelta,
  scoreTone,
  type AttentionFlag,
  type RosterFacet,
} from "./directorMeta";

/**
 * Coaching scope — the per-agent verdict-history table: latest 0–5 score,
 * trend sparkline over recent reviews, value-delivered rate, attention flags
 * (new / low / declining / stale), and last-review recency. The header's
 * triage chips and the page's other facets filter the rows; one facet at a
 * time. Desktop parity: the Director tab's PersonaCoachingTable +
 * AttentionTriageBar.
 */
export function CoachingTable({
  roster,
  now,
  facet,
  onFacetChange,
}: {
  roster: DirectorRosterEntry[];
  now: number;
  facet: RosterFacet | null;
  onFacetChange: (facet: RosterFacet | null) => void;
}) {
  const { t } = useTranslation();
  const lp = t.directorPage.coaching;

  const flagCounts = useMemo(() => {
    const counts: Record<AttentionFlag, number> = {
      needsReview: 0,
      low: 0,
      declining: 0,
      stale: 0,
    };
    for (const entry of roster) {
      for (const flag of attentionFlags(entry, now)) counts[flag] += 1;
    }
    return counts;
  }, [roster, now]);

  const rows = useMemo(() => {
    const sorted = [...roster].sort((a, b) => {
      const aFlags = attentionFlags(a, now);
      const bFlags = attentionFlags(b, now);
      const aRank = aFlags.length > 0 ? ATTENTION_ORDER.indexOf(aFlags[0]) : 99;
      const bRank = bFlags.length > 0 ? ATTENTION_ORDER.indexOf(bFlags[0]) : 99;
      if (aRank !== bRank) return aRank - bRank;
      const aScore = a.latestScore ?? 99;
      const bScore = b.latestScore ?? 99;
      if (aScore !== bScore) return aScore - bScore;
      return a.name.localeCompare(b.name);
    });
    return sorted.filter((entry) => matchesFacet(entry, facet, now));
  }, [roster, facet, now]);

  const facetLabel =
    facet === null
      ? null
      : facet.type === "flag"
        ? lp.flags[facet.flag]
        : facet.type === "score"
          ? `${facet.score}/5`
          : t.directorPage.momentum[facet.momentum];

  return (
    <GlowCard accent="amber" className="p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Star className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">{lp.title}</h2>
        <AttentionTriageBar
          flagCounts={flagCounts}
          facetLabel={facetLabel}
          facet={facet}
          onFacetChange={onFacetChange}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[1.6fr_72px_80px_88px_1.2fr_auto] items-center gap-x-3 border-b border-glass px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-dark">
            <span>{lp.agent}</span>
            <span>{lp.latest}</span>
            <span>{lp.trend}</span>
            <span>{lp.value}</span>
            <span>{lp.attention}</span>
            <span className="text-right">{lp.lastReview}</span>
          </div>

          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-dark">{lp.filterEmpty}</p>
          ) : (
            rows.map((entry) => {
              const flags = attentionFlags(entry, now);
              const tone = entry.latestScore !== null ? scoreTone(entry.latestScore) : null;
              return (
                <div
                  key={entry.id}
                  className="grid grid-cols-[1.6fr_72px_80px_88px_1.2fr_auto] items-center gap-x-3 border-b border-glass px-2 py-2.5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <PersonaAvatar color={entry.color} name={entry.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{entry.name}</p>
                      <p className="text-xs tabular-nums text-muted-dark">
                        {entry.totalExecutions.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    {entry.latestScore !== null && tone ? (
                      <>
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold tabular-nums ${tone.chip}`}
                        >
                          {entry.latestScore}/5
                        </span>
                        <ScoreDelta delta={scoreDelta(entry)} />
                      </>
                    ) : (
                      <span className="text-sm text-muted-dark">—</span>
                    )}
                  </div>
                  <div title={entry.scoreTrend.join(" → ")}>
                    <ScoreSparkline scores={entry.scoreTrend} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1 w-8 overflow-hidden rounded-full bg-white/[0.06]">
                      <span
                        className="block h-full rounded-full bg-emerald-400"
                        style={{ width: `${Math.round(entry.valueDeliveredRate * 100)}%` }}
                      />
                    </span>
                    <span className="text-sm tabular-nums text-muted-dark">
                      {Math.round(entry.valueDeliveredRate * 100)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {flags.map((flag) => (
                      <span
                        key={flag}
                        title={lp.flagHints[flag]}
                        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${FLAG_TONE[flag].chip}`}
                      >
                        {lp.flags[flag]}
                      </span>
                    ))}
                  </div>
                  <span className="text-right text-sm tabular-nums text-muted-dark">
                    {entry.lastReviewedAt !== null ? relativeTime(entry.lastReviewedAt) : lp.never}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </GlowCard>
  );
}
