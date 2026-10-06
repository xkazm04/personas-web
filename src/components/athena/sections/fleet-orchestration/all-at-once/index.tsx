"use client";

import { useRef } from "react";
import { atStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import FitBox from "./shared/FitBox";
import StageShell from "./shared/StageShell";
import { useSceneTick } from "./shared/useSceneTick";
import Answer from "./Answer";
import { CYCLE, INITIAL_TICK, TICK_MS, sceneAt, statusKey } from "./data";
import Dial from "./Dial";
import { COMPACT, WIDE, layoutFor } from "./layout";
import Roster from "./Roster";
import Sentence from "./Sentence";
import StartControl from "./StartControl";

/**
 * Athena lab - Fleet orchestration, V2: "All At Once".
 *
 * A different take on "a sentence becomes a working team": the claim told as
 * TIME. What a team gives you that one pair of hands cannot is side by side.
 *
 * You say one sentence; she takes it and sits at the centre of a dial. Phrase
 * by phrase a teammate joins - the phrase lights in its own colour, a ring in
 * that colour appears around her, a row joins the team with the tool it works
 * in. Nothing turns until you press Start. Then four rings fill at once, each
 * teammate riding the tip of its own ring at its own pace, while a faint
 * outer track crawls round at the pace of one person doing the same four jobs
 * end to end. When the last ring closes, the four findings line up at twelve
 * o'clock, the answer assembles beside the dial and goes to the team - while
 * the outer track, a third of the way round when the team finished, is still
 * crawling on task 3 of 4. The gap between them is the argument.
 *
 * Reduced motion pins INITIAL_TICK: all four rings closed, findings lined up,
 * the answer sent, the one-at-a-time track only part of the way round.
 */
export default function AthenaLabFleetV2() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement | null>(null);
  const { phase, reduced } = useSceneTick(ref, { cycle: CYCLE, tickMs: TICK_MS, still: INITIAL_TICK });
  const s = t.athenaPage.fleet.status;
  const key = statusKey(phase);
  const scene = sceneAt(phase);
  return (
    <StageShell
      sectionRef={ref}
      status={s[key]}
      statusShort={key === "planning" ? s.piecesShort : s[`${key}Short`]}
      reduced={reduced}
    >
      <FitBox wide={WIDE} compact={COMPACT} label={t.athenaSections.fleet.v2.art}>
        {(narrow) => {
          const L = layoutFor(narrow);
          return (
            <>
              <Sentence rect={L.sentence} stage={scene.sentence} clauses={scene.clauses} lit={scene.lit} compact={narrow} reduced={reduced} />
              <StartControl rect={L.start} state={scene.start} bare={narrow} reduced={reduced} />
              <Dial rect={L.dial} scene={scene} reduced={reduced} />
              {/* Compact: the team and the answer share one slot - the team
                  hands over to the answer the moment it opens, no ghost first. */}
              <Roster rect={L.roster} scene={scene} yielded={narrow && atStage(scene.result, "shell")} reduced={reduced} />
              <Answer rect={L.answer} stage={scene.result} ghost={scene.answerGhost && !narrow} reduced={reduced} />
            </>
          );
        }}
      </FitBox>
    </StageShell>
  );
}
