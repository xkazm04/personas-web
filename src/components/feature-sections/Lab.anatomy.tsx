"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { LabStage, ReplayButton, ease, useBeats } from "./Lab.shared";
import { Column, Key, Line, PARTS, rate } from "./Lab.anatomy.parts";

/*
 * /illustrate r3, lab variant "anatomy" (data-as-art).
 * Each version's rating is one column on a 0-100 scale, stacked from its three
 * judged sub-scores at the canonical weights (score_weights.rs: tool accuracy 0.4,
 * output quality 0.4, protocol compliance 0.2). A dashed line marks the pinned
 * baseline (v4, 82); a red line 5 points below it marks REGRESSION_DROP; v5 is
 * the Live one, v6 is flagged.
 *
 * Reveal beats: 0 empty scale / 1 columns stack / 2 baseline + flag lines /
 * 3 Live + Regression chips. Rest state is beat 3.
 */

const WORDS = {
  heading: "Know which version is ",
  gradient: "better",
  lede: "An AI judge scores each version on tool accuracy, output quality and protocol, weighted into one 0–100 rating. Pin a baseline, and a drop of 5 points is flagged.",
  artLabel:
    "Four versions of a persona as columns on a 0 to 100 scale, each stacked from tool accuracy at 40 percent, output quality at 40 percent and protocol at 20 percent: v3 rates 80, v4 82 and is the baseline, v5 87 and is live, v6 76, six points under the baseline, and is flagged as a regression.",
  keyTitle: "Rating =",
  parts: ["Tool accuracy", "Output quality", "Protocol"],
  baseline: "Baseline v4",
  flag: "-5 flagged",
  live: "Live",
  regression: "Regression",
  replay: "Replay the scoring",
} as const;

/* Sub-scores per version (0-100 each). Ratings: 80, 82, 87, 76. */
const VERSIONS = [
  { v: "v3", scores: [78, 80, 84] },
  { v: "v4", scores: [85, 80, 80] },
  { v: "v5", scores: [90, 88, 80] },
  { v: "v6", scores: [70, 78, 84] },
] as const;
const BASELINE = rate(VERSIONS[1].scores);
const FLAG = BASELINE - 5;

export default function LabAnatomy() {
  const { ref, beat, play, still } = useBeats(4, 1000);

  return (
    <LabStage heading={WORDS.heading} gradient={WORDS.gradient} lede={WORDS.lede}>
      <div data-stage-zoom className="w-full">
        <div
          ref={ref}
          data-illustrate-art
          data-tour-diagram="lab"
          role="figure"
          aria-label={WORDS.artLabel}
          className="relative mx-auto mt-8 flex w-full max-w-[800px] flex-col gap-5 rounded-2xl border border-glass bg-foreground/[0.02] px-4 py-5 sm:flex-row sm:items-stretch sm:gap-8 sm:px-7 lg:mt-0"
        >
          {/* The plot: 0-100, columns bottom-aligned, reference lines across. */}
          <div className="relative flex-1 pt-2 sm:pt-8">
            <div className="relative h-[200px] border-b border-glass sm:h-[240px]">
              {[25, 50, 75, 100].map((g) => (
                <span
                  key={g}
                  aria-hidden
                  className="absolute inset-x-0 border-t border-foreground/[0.06]"
                  style={{ bottom: `${g}%` }}
                />
              ))}
              <div className="absolute inset-0 grid grid-cols-4 gap-2.5 pr-[5.25rem] sm:gap-5 sm:pr-28">
                {VERSIONS.map((ver, i) => {
                  const rating = rate(ver.scores);
                  return (
                    <Column
                      key={ver.v}
                      scores={ver.scores}
                      rating={rating}
                      grown={beat >= 1}
                      chipsOn={beat >= 3}
                      chip={
                        ver.v === "v5"
                          ? { text: WORDS.live, key: "emerald" }
                          : rating <= FLAG
                            ? { text: WORDS.regression, key: "rose", icon: AlertTriangle }
                            : undefined
                      }
                      still={still}
                      delay={i * 0.22}
                    />
                  );
                })}
              </div>
              <Line at={BASELINE} label={WORDS.baseline} shown={beat >= 2} still={still} dashed />
              <Line at={FLAG} label={WORDS.flag} shown={beat >= 2} still={still} color={BRAND_VAR.rose} below />
            </div>
            <div className="grid grid-cols-4 gap-2.5 pr-[5.25rem] pt-2 sm:gap-5 sm:pr-28">
              {VERSIONS.map((ver) => (
                <span key={ver.v} className="flex flex-col items-center leading-tight">
                  <span className="font-mono text-base font-bold text-foreground">{ver.v}</span>
                  <motion.span
                    initial={false}
                    animate={{ opacity: beat >= 1 ? 1 : 0.15 }}
                    transition={ease(still, 0.5, 0.3)}
                    className="font-mono text-lg font-bold tabular-nums text-foreground/85"
                  >
                    {rate(ver.scores)}
                  </motion.span>
                </span>
              ))}
            </div>
          </div>

          {/* The key is the formula: which colour is which judged part, at what weight. */}
          <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 sm:w-52 sm:flex-col sm:flex-nowrap sm:items-stretch sm:justify-center sm:gap-3">
            <span className="text-sm font-semibold text-foreground/70">{WORDS.keyTitle}</span>
            {PARTS.map((p, i) => (
              <Key key={p.key} color={p.key} name={WORDS.parts[i]} weight={`${Math.round(p.weight * 100)}%`} />
            ))}
            <div className="absolute right-3 top-3 sm:static sm:mt-1 sm:self-start">
              <ReplayButton onClick={play} disabled={still} label={WORDS.replay} />
            </div>
          </div>
        </div>
      </div>
    </LabStage>
  );
}

