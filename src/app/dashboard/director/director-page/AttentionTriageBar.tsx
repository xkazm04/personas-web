"use client";

import { ShieldCheck, X } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

import { ATTENTION_ORDER, FLAG_TONE, type AttentionFlag, type RosterFacet } from "./directorMeta";

/**
 * Attention triage chips for the coaching-table header: one counted chip per
 * active flag (new / low / declining / stale), each toggling the shared roster
 * facet, plus a clear-chip naming whichever facet is active. Collapses to an
 * all-healthy line when nothing is flagged. Desktop parity: AttentionTriageBar.
 */
export function AttentionTriageBar({
  flagCounts,
  facetLabel,
  facet,
  onFacetChange,
}: {
  flagCounts: Record<AttentionFlag, number>;
  facetLabel: string | null;
  facet: RosterFacet | null;
  onFacetChange: (facet: RosterFacet | null) => void;
}) {
  const { t } = useTranslation();
  const lp = t.directorPage.coaching;
  const anyFlagged = ATTENTION_ORDER.some((flag) => flagCounts[flag] > 0);

  return (
    <div className="ml-auto flex flex-wrap items-center gap-1.5">
      {facetLabel !== null && (
        <button
          type="button"
          onClick={() => onFacetChange(null)}
          aria-label={lp.clearFilter}
          className="inline-flex items-center gap-1 rounded-full border border-glass-hover bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.1] focus-ring focus-visible:ring-offset-0"
        >
          {facetLabel}
          <X className="h-3 w-3" />
        </button>
      )}
      {!anyFlagged ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          {lp.healthy}
        </span>
      ) : (
        ATTENTION_ORDER.map((flag) => {
          const count = flagCounts[flag];
          if (count === 0) return null;
          const active = facet?.type === "flag" && facet.flag === flag;
          return (
            <button
              key={flag}
              type="button"
              aria-pressed={active}
              title={lp.flagHints[flag]}
              onClick={() => onFacetChange(active ? null : { type: "flag", flag })}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums transition-colors hover:bg-white/[0.06] focus-ring focus-visible:ring-offset-0 ${FLAG_TONE[flag].chip} ${active ? "ring-1 ring-inset ring-white/40" : ""}`}
            >
              {lp.flags[flag]} {count}
            </button>
          );
        })
      )}
    </div>
  );
}
