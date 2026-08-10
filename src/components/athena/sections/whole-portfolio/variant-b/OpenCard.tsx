"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, type Finding } from "./copy";
import type { ActionState } from "./data";
import { DRIFT, DRIFT_SAFE } from "./readings";
import { DrawCheck, Sheen } from "./marks";
import { META, Part } from "./parts";

/**
 * The one — everything the top of the list says once it opens.
 *
 * Its title row is NOT here: the row and the card share one header (see
 * `./Traveller`), so opening is a box growing around words that were already
 * on screen rather than a different component replacing them. What this file
 * adds is the three answers a person actually wants next, in order:
 *
 *   since when        drawn, not stated — the reading slides under a line that
 *                     was fine for weeks and then stops being fine, which is
 *                     exactly the failure nobody ever gets told about
 *   what did you find her sentence, about this specific thing
 *   what do I do      one step, and she already knows where it lives
 *
 * The rows beneath move down rather than being covered, so the ordering this
 * came out of stays visible underneath the whole time.
 */

const CHART_H = 34;

/** The reading's own history — the shape of "this has been sliding a while". */
function Drift({ reduced }: { reduced: boolean }) {
  const line = DRIFT.map((v, i) => {
    const x = ((i / (DRIFT.length - 1)) * 100).toFixed(1);
    const y = ((1 - v) * CHART_H).toFixed(1);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  const safeY = ((1 - DRIFT_SAFE) * CHART_H).toFixed(1);
  return (
    // The viewBox is stretched to whatever height the card can spare, so every
    // stroke declares `non-scaling-stroke`: without it the ink thins as the box
    // widens and the drift renders as a smear rather than a line.
    <svg
      viewBox={`0 0 100 ${CHART_H}`}
      preserveAspectRatio="none"
      className="h-full min-h-10 w-full"
      aria-hidden="true"
    >
      <path d={`${line} L 100 ${CHART_H} L 0 ${CHART_H} Z`} fill={tint("amber", 10)} />
      {/* Where fine stopped. Cyan, because the threshold is hers. */}
      <path
        d={`M 0 ${safeY} L 100 ${safeY}`}
        stroke={tint("cyan", 45)}
        strokeWidth="1"
        strokeDasharray="4 4"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      <motion.path
        d={line}
        fill="none"
        stroke={BRAND_VAR.amber}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }}
      />
    </svg>
  );
}

/** The one step. It beckons while it waits, then commits as a moment. */
function Action({ state, reduced }: { state: ActionState; reduced: boolean }) {
  const done = state === "done";
  return (
    <motion.span
      className="relative flex shrink-0 items-center gap-2 overflow-hidden rounded-full border px-3.5 py-1 text-base"
      style={{
        borderColor: tint("amber", done ? 70 : 55),
        backgroundColor: tint("amber", done ? 20 : 14),
        color: BRAND_VAR.amber,
        boxShadow: brandShadow("amber", done ? 22 : 16, 32),
      }}
      animate={!done && !reduced ? { scale: [1, 1.045, 1] } : { scale: 1 }}
      transition={
        !done && !reduced
          ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      <Sheen on={done} reduced={reduced} accent="amber" />
      {done ? (
        <DrawCheck reduced={reduced} className="h-4 w-4" />
      ) : (
        <motion.span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: BRAND_VAR.amber }}
          animate={reduced ? undefined : { opacity: [1, 0.3, 1] }}
          transition={reduced ? undefined : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {done ? COPY.card.committed : COPY.card.action}
    </motion.span>
  );
}

export default function OpenCard({
  finding,
  stage,
  told,
  action,
  reduced,
}: {
  finding: Finding;
  stage: ModuleStage;
  told: boolean;
  action: ActionState;
  reduced: boolean;
}) {
  const drifted = atStage(stage, "detail");
  return (
    <>
      {/* Below md the card cannot spare a chart's height, so the same fact
          arrives as words; between md and lg the chart takes the full width and
          the words step aside. Neither ever shrinks to make room for the other. */}
      <span className="flex min-h-0 flex-1 items-stretch gap-3">
        <Part show={drifted} i={0} reduced={reduced} className="hidden min-w-0 flex-1 md:flex">
          <Drift reduced={reduced} />
        </Part>
        <Part
          show={drifted}
          i={1}
          reduced={reduced}
          className={`shrink-0 self-center whitespace-nowrap normal-case md:hidden lg:inline ${META}`}
        >
          {COPY.card.drift} {finding.age}
        </Part>
      </span>

      <Part
        show={told}
        reduced={reduced}
        className="line-clamp-2 shrink-0 text-base leading-snug text-foreground"
      >
        {COPY.card.finding}
      </Part>

      {action !== "hidden" && (
        <Part show reduced={reduced} className="flex shrink-0 items-center">
          <Action state={action} reduced={reduced} />
        </Part>
      )}
    </>
  );
}
