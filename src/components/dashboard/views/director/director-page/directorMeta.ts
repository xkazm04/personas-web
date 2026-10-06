import type {
  DirectorMomentum,
  DirectorRosterEntry,
} from "@/lib/mock-dashboard-data";
import { SERIES } from "@/lib/chart-theme";

/**
 * Pure derivations over the Director roster — verdict-score tones, momentum,
 * attention flags, and sparkline geometry. Mirrors the desktop Director's
 * `directorScore.ts` / `momentum.ts` / `attention.ts` helpers: everything on
 * the page beyond the two fetched fixtures is computed here.
 */

export const SCORE_MAX = 5;

/** A review older than this is "stale" (desktop parity: 14 days). */
export const STALE_MS = 14 * 24 * 60 * 60 * 1000;

export type AttentionFlag = "needsReview" | "low" | "declining" | "stale";

export const ATTENTION_ORDER: AttentionFlag[] = ["needsReview", "low", "declining", "stale"];

/** Map a 0–5 verdict to its tone. Desktop parity: ≥4 success, ≥2 warning, else danger. */
export function scoreTone(score: number): { text: string; chip: string; series: string } {
  if (score >= 4) {
    return {
      text: "text-emerald-300",
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      series: SERIES.emerald,
    };
  }
  if (score >= 2) {
    return {
      text: "text-amber-300",
      chip: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      series: SERIES.amber,
    };
  }
  return {
    text: "text-rose-300",
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    series: SERIES.rose,
  };
}

/** Last-review-to-previous-review score delta; 0 with fewer than two scores. */
export function scoreDelta(entry: DirectorRosterEntry): number {
  const n = entry.scoreTrend.length;
  if (n < 2) return 0;
  return entry.scoreTrend[n - 1] - entry.scoreTrend[n - 2];
}

export function momentumOf(entry: DirectorRosterEntry): DirectorMomentum {
  const delta = scoreDelta(entry);
  if (delta > 0) return "improving";
  if (delta < 0) return "declining";
  return "flat";
}

export const MOMENTUM_ORDER: DirectorMomentum[] = ["improving", "flat", "declining"];

export function momentumCounts(roster: DirectorRosterEntry[]): Record<DirectorMomentum, number> {
  const counts: Record<DirectorMomentum, number> = { improving: 0, flat: 0, declining: 0 };
  for (const entry of roster) counts[momentumOf(entry)] += 1;
  return counts;
}

/**
 * Attention flags for one roster entry. A never-scored agent gets exactly
 * `needsReview`; otherwise low / declining / stale can stack.
 */
export function attentionFlags(entry: DirectorRosterEntry, now: number): AttentionFlag[] {
  if (entry.latestScore === null) return ["needsReview"];
  const flags: AttentionFlag[] = [];
  if (entry.latestScore <= 2) flags.push("low");
  if (scoreDelta(entry) < 0) flags.push("declining");
  if (entry.lastReviewedAt !== null && now - Date.parse(entry.lastReviewedAt) > STALE_MS) {
    flags.push("stale");
  }
  return flags;
}

export const FLAG_TONE: Record<AttentionFlag, { chip: string; dot: string }> = {
  needsReview: { chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300", dot: "bg-cyan-400" },
  low: { chip: "border-rose-500/30 bg-rose-500/10 text-rose-300", dot: "bg-rose-400" },
  declining: { chip: "border-amber-500/30 bg-amber-500/10 text-amber-300", dot: "bg-amber-400" },
  stale: { chip: "border-glass bg-white/[0.04] text-muted-dark", dot: "bg-white/40" },
};

/** One active roster facet at a time — the page's cross-filter cockpit. */
export type RosterFacet =
  | { type: "flag"; flag: AttentionFlag }
  | { type: "score"; score: number }
  | { type: "momentum"; momentum: DirectorMomentum };

export function matchesFacet(
  entry: DirectorRosterEntry,
  facet: RosterFacet | null,
  now: number,
): boolean {
  if (!facet) return true;
  if (facet.type === "flag") return attentionFlags(entry, now).includes(facet.flag);
  if (facet.type === "score") return entry.latestScore === facet.score;
  return momentumOf(entry) === facet.momentum;
}

/**
 * SVG polyline points for a score sparkline. The y-axis is anchored to the
 * fixed 0–5 verdict range (never the sample's min/max) so a "4" sits at the
 * same height in every row.
 */
export function sparklinePoints(scores: number[], width: number, height: number, pad = 2): string {
  if (scores.length === 0) return "";
  const step = scores.length > 1 ? (width - pad * 2) / (scores.length - 1) : 0;
  return scores
    .map((score, i) => {
      const x = pad + i * step;
      const y = height - pad - (score / SCORE_MAX) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
