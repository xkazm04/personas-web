"use client";

import { useRef } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import FitBox from "../shared/FitBox";
import StageShell from "../shared/StageShell";
import { useSceneTick } from "../shared/useSceneTick";
import { CYCLE, INITIAL_TICK, TICK_MS, actAt, sceneAt } from "./data";
import Field from "./Field";
import { COMPACT, WIDE, layoutFor } from "./layout";
import { statusAt, statusShortAt } from "./status";

/**
 * Athena lab - Fleet orchestration, V1: "The Decomposition", evolved.
 *
 * Same story as the live section, beat for beat: you type one sentence in
 * your own words (the mic sits on the box - spoken and typed take the same
 * path); she takes it and, phrase by phrase, it comes apart - a run of words
 * lights inside the sentence, a thread draws out of her, a task solidifies at
 * its end, so every task is TRACEABLE to the words that produced it. It is a
 * plan, not a queue: one scope visibly changes and nothing runs until Start.
 * Then all four run at once, each at its own pace, and each answer draws home
 * to one settled result - the sentence's own last clause, answered.
 *
 * What evolved:
 *  - One stage. The argument now reads left to right, the way the sentence
 *    does, authored in one design-px space that zooms as a whole (FitBox) -
 *    so it fills a 2560 screen and keeps type on the floor at 1366.
 *  - Each task is handed to an AGENT, shown by the real tool it works in, and
 *    the answer shows where it went (the team's Slack) instead of saying it.
 *  - Light and depth: a key light that travels with the story, lit panel
 *    seams over soft drops, threads with a bloom once they carry an answer.
 *
 * Reduced motion pins INITIAL_TICK: the sentence written, every phrase
 * accounted for, four agents done, the answer settled - the whole argument in
 * one calm frame.
 */
export default function AthenaLabFleetV1() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement | null>(null);
  const { phase, reduced } = useSceneTick(ref, { cycle: CYCLE, tickMs: TICK_MS, still: INITIAL_TICK });
  const status = t.athenaPage.fleet.status;
  const scene = sceneAt(phase);
  return (
    <StageShell
      sectionRef={ref}
      status={statusAt(phase, status)}
      statusShort={statusShortAt(phase, status)}
      reduced={reduced}
    >
      <FitBox wide={WIDE} compact={COMPACT} label={t.athenaLab.fleet.v1.art}>
        {(narrow) => <Field scene={scene} act={actAt(phase)} layout={layoutFor(narrow)} reduced={reduced} />}
      </FitBox>
    </StageShell>
  );
}
