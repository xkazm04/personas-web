"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { LabStage, ReplayButton, ease, scoreKey, useBeats } from "./Lab.shared";
import { BeatStrip, VersionHead } from "./Lab.head-to-head.parts";

/*
 * /illustrate r3, lab variant "head-to-head" (mechanism).
 * Athena drafts v5; v5 and the live v4 run the SAME test scenarios (the desktop Lab
 * grades every version of a persona on one generated scenario set); the judge's
 * composite per scenario is a bar, v4's growing left and v5's right; 87 beats 82;
 * the Live pill crosses to v5 and v4 stays one Activate away (the rollback).
 *
 * Beats: 0 Athena drafts v5 / 1 same scenarios, judged / 2 totals / 3 activate.
 * Rest state (first paint, reduced motion) is beat 3.
 */

const WORDS = {
  heading: "Every change, ",
  gradient: "measured",
  lede: "Athena drafts a new version of your persona's prompt, and the Lab scores it against the live one on the same test scenarios. You activate the winner.",
  artLabel:
    "Head to head: the live version v4 and Athena's draft v5 run the same three test scenarios of an inbox triage persona. v5 rates 87 against v4's 82, so you activate v5 and v4 is kept for rollback.",
  persona: "Inbox Triage",
  scenarios: "Same test scenarios",
  live: "Live",
  draft: "Athena draft",
  previous: "Previous",
  rating: "Rating",
  gain: "+5",
  rows: ["Urgent bug report", "Newsletter says urgent", "Meeting request"],
  beats: ["Athena drafts v5", "Same scenarios, AI judge", "87 beats 82", "Activate v5; v4 kept for rollback"],
  replay: "Replay the comparison",
} as const;

/* The judge's 0-100 composite per scenario; the ratings are their means (82, 87). */
const V4 = [84, 70, 92];
const V5 = [90, 82, 89];
const mean = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

const STEP_MS = 1300;

export default function LabHeadToHead() {
  const { ref, beat, play, pick, still } = useBeats(WORDS.beats.length, STEP_MS);
  const activated = beat >= 3;
  const scored = beat >= 2;

  return (
    <LabStage heading={WORDS.heading} gradient={WORDS.gradient} lede={WORDS.lede}>
      <div data-stage-zoom className="w-full">
        <div
          ref={ref}
          data-illustrate-art
          data-tour-diagram="lab"
          role="figure"
          aria-label={WORDS.artLabel}
          className="relative mx-auto mt-8 w-full max-w-[980px] rounded-2xl border border-glass bg-foreground/[0.02] px-3 py-6 sm:px-7 lg:mt-0"
        >
          {/* Heads: v4 left, the shared test in the middle, v5 right. */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
            <VersionHead
              version="v4"
              side="left"
              pill={activated ? { kind: "previous", text: WORDS.previous } : { kind: "live", text: WORDS.live }}
              still={still}
            />
            <div className="text-center">
              <span className="hidden rounded-full border border-glass px-2.5 py-0.5 text-sm font-medium text-foreground/70 sm:inline-block">
                {WORDS.persona}
              </span>
              <div className="mt-1 text-xs font-semibold text-foreground sm:text-base">{WORDS.scenarios}</div>
            </div>
            <VersionHead
              version="v5"
              side="right"
              pill={activated ? { kind: "live", text: WORDS.live } : { kind: "draft", text: WORDS.draft }}
              still={still}
            />
          </div>

          {/* Butterfly rows: the same scenario, both versions' judged composite. */}
          <ol className="mt-6 space-y-6 sm:space-y-4">
            {WORDS.rows.map((name, i) => (
              <li key={name} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                <Bar value={V4[i]} side="left" shown still={still} delay={0} />
                <span className="w-24 text-center text-xs font-medium leading-tight text-foreground/85 sm:w-52 sm:text-base">
                  {name}
                </span>
                <Bar value={V5[i]} side="right" shown={beat >= 1} still={still} delay={i * 0.28} />
              </li>
            ))}
          </ol>

          {/* Totals: the rating each version gets. */}
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-glass pt-4 sm:gap-6 sm:pt-3">
            <span className="text-right font-mono text-xl font-bold tabular-nums text-foreground/70 sm:text-3xl">{mean(V4)}</span>
            <span className="w-24 text-center text-xs font-semibold uppercase tracking-wider text-foreground/60 sm:w-52 sm:text-sm">
              <span className="hidden sm:inline">{WORDS.rating}</span>
            </span>
            <motion.span
              initial={false}
              animate={{ opacity: scored ? 1 : 0.15 }}
              transition={ease(still)}
              className="flex items-center gap-2"
            >
              <span className="font-mono text-xl font-bold tabular-nums sm:text-3xl" style={{ color: BRAND_VAR.emerald }}>
                {mean(V5)}
              </span>
              <span
                className="rounded-full px-2 py-0.5 font-mono text-xs font-semibold sm:text-sm"
                style={{ color: BRAND_VAR.emerald, backgroundColor: tint("emerald", 14) }}
              >
                {WORDS.gain}
              </span>
            </motion.span>
          </div>

          <div className="mt-4 flex items-start gap-2 sm:mt-5 sm:items-stretch sm:gap-3">
            <BeatStrip beats={WORDS.beats} beat={beat} onPick={pick} />
            <ReplayButton onClick={play} disabled={still} label={WORDS.replay} />
          </div>
        </div>
      </div>
    </LabStage>
  );
}

function Bar({
  value,
  side,
  shown,
  still,
  delay,
}: {
  value: number;
  side: "left" | "right";
  shown: boolean;
  still: boolean;
  delay: number;
}) {
  const key = scoreKey(value);
  return (
    <div className={`flex h-8 w-full sm:h-5 ${side === "left" ? "justify-end" : "justify-start"}`}>
      <div className="relative h-full w-full max-w-[300px] overflow-hidden rounded-full border border-dashed border-glass-hover bg-foreground/[0.05]">
        <motion.div
          initial={false}
          animate={{ scaleX: shown ? value / 100 : 0 }}
          transition={ease(still, delay, 0.7)}
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: tint(key, 70),
            transformOrigin: side === "left" ? "100% 50%" : "0% 50%",
          }}
        />
      </div>
    </div>
  );
}
