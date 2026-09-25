"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { LabStage, ReplayButton, useBeats } from "./Lab.shared";
import { GRID, RatingRow, type RatingRowData } from "./Lab.ratings.parts";

/*
 * /illustrate r3, lab variant "ratings" (product-true, real content reduced).
 * The desktop Lab's Versions & Ratings table (LabVersionsTable.tsx): one row per
 * prompt version x model, exactly one Active, a 0-100 composite rating in the
 * app's threshold colours, a star on the best model per version, Δ vs the pinned
 * baseline with a warning at -5 (REGRESSION_DROP). Activate puts a row live, and
 * activating the previous version is the rollback - every Activate button works.
 *
 * Beats (the product's own motion): 0 new rows Not measured / 1 Measuring... /
 * 2 ratings land / 3 Activate v5. Rest state is beat 3.
 */

const WORDS = {
  heading: "Only the better version ",
  gradient: "goes live",
  lede: "Every version of a persona is rated 0–100 on the same test scenarios, per model. Activate the best one; activate the previous one to roll back.",
  artLabel:
    "The Lab's Versions and Ratings table for an inbox triage persona: v4 on Sonnet rates 82 and is the pinned baseline; v5 on Sonnet rates 87, five points better, and is active; v5 on Haiku rates 79; v6 on Sonnet rates 76, a six-point drop, flagged. Activating v4 again would roll back.",
  title: "Versions & Ratings",
  persona: "Inbox Triage",
  cols: ["Version", "Model", "Rating", "Baseline", "Status"],
  active: "Active",
  measured: "Measured",
  unmeasured: "Not measured",
  measuring: "Measuring…",
  activate: "Activate",
  baseline: "Baseline",
  flagged: "5+ below baseline",
  replay: "Replay the measurement",
} as const;

const ROWS: RatingRowData[] = [
  { id: "v4-sonnet", version: "v4", model: "Sonnet", rating: 82, delta: null, baseline: true, fresh: false },
  { id: "v5-sonnet", version: "v5", model: "Sonnet", rating: 87, delta: 5, best: true, fresh: true },
  { id: "v5-haiku", version: "v5", model: "Haiku", rating: 79, delta: -3, fresh: true },
  { id: "v6-sonnet", version: "v6", model: "Sonnet", rating: 76, delta: -6, fresh: true },
];

export default function LabRatings() {
  const { ref, beat, play, pick, still } = useBeats(4, 1200);
  // A reader's own Activate click wins over the beat; replay clears it.
  const [picked, setPicked] = useState<string | null>(null);
  const live = picked ?? (beat >= 3 ? "v5-sonnet" : "v4-sonnet");

  const activate = (id: string) => {
    pick(3);
    setPicked(id);
  };
  const replay = () => {
    setPicked(null);
    play();
  };

  return (
    <LabStage heading={WORDS.heading} gradient={WORDS.gradient} lede={WORDS.lede}>
      <div data-stage-zoom className="w-full">
        <div
          ref={ref}
          data-illustrate-art
          data-tour-diagram="lab"
          role="figure"
          aria-label={WORDS.artLabel}
          className="relative mx-auto mt-8 w-full max-w-[860px] rounded-2xl border border-glass bg-foreground/[0.02] px-3 py-4 sm:px-5 lg:mt-0"
        >
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-baseline gap-3">
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground sm:text-base">
                {WORDS.title}
              </h3>
              <span className="hidden text-sm text-foreground/70 sm:inline">{WORDS.persona}</span>
            </div>
            <ReplayButton onClick={replay} disabled={still} label={WORDS.replay} />
          </div>

          <div
            className={`${GRID} mt-3 border-b border-glass px-2 pb-2 text-xs font-semibold uppercase tracking-normal text-foreground/60 sm:tracking-wider`}
            aria-hidden
          >
            {WORDS.cols.map((c, i) => (
              // Phone keeps the two headers the numbers need; the rest read on their own.
              <span key={c}>
                <span className={i === 2 || i === 3 ? "" : "hidden sm:inline"}>{c}</span>
              </span>
            ))}
          </div>

          <ol className="mt-1.5 space-y-1.5">
            {ROWS.map((row) => (
              <RatingRow
                key={row.id}
                row={row}
                phase={row.fresh ? Math.min(beat, 2) : 2}
                live={live === row.id}
                words={WORDS}
                still={still}
                onActivate={() => activate(row.id)}
              />
            ))}
          </ol>

          <p className="mt-3 flex items-center gap-1.5 px-2 text-xs text-foreground/70 sm:text-sm">
            <AlertTriangle className="h-3.5 w-3.5 text-brand-rose" aria-hidden />
            {WORDS.flagged}
          </p>
        </div>
      </div>
    </LabStage>
  );
}
