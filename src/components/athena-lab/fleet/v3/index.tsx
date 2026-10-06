"use client";

import { useRef } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { atStage } from "@/components/athena/stage/stages";
import FitBox from "../shared/FitBox";
import Spotlight from "../shared/Spotlight";
import StageShell from "../shared/StageShell";
import { useSceneTick } from "../shared/useSceneTick";
import Bubble from "./Bubble";
import Courier from "./Courier";
import { CYCLE, INITIAL_TICK, TICK_MS, sceneAt, statusKey } from "./data";
import Hub from "./Hub";
import { COMPACT, WIDE, layoutFor } from "./layout";
import Routes from "./Routes";
import Station from "./Station";

/**
 * Athena lab - Fleet orchestration, V3: "The Dispatch".
 *
 * A different take on "a sentence becomes a working team": the claim told as
 * a PLACE. Your tools - the help desk, the inbox, the issue tracker, product
 * analytics - stand around her as a little lit world, and a sentence turns
 * into a team that goes out into it.
 *
 * You say one sentence into the bubble over her head. Phrase by phrase it
 * becomes a job: the phrase lights in a teammate's colour, a route draws from
 * her pad to the tool that job needs, and a small figure in that colour steps
 * onto the pad. The team waits for your Start. Then all four leave at once,
 * each FOLLOWING its own route, hover at their tools while a ring closes
 * round each at its own pace, and fly home the moment they are done, leaving
 * what they found under the tool. With the team home, the bubble that held
 * your question turns over and holds her answer - and it goes to the team.
 *
 * Reduced motion pins INITIAL_TICK: the team home on the pad, every tool
 * answered, the bubble holding the answer.
 */
export default function AthenaLabFleetV3() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement | null>(null);
  const { phase, reduced } = useSceneTick(ref, { cycle: CYCLE, tickMs: TICK_MS, still: INITIAL_TICK });
  const s = t.athenaPage.fleet.status;
  const key = statusKey(phase);
  const scene = sceneAt(phase);
  const tasks = t.athenaPage.fleet.tasks;
  const awake = atStage(scene.bubble, "chosen");
  return (
    <StageShell
      sectionRef={ref}
      status={s[key]}
      statusShort={key === "planning" ? s.piecesShort : s[`${key}Short`]}
      reduced={reduced}
    >
      <FitBox wide={WIDE} compact={COMPACT} label={t.athenaLab.fleet.v3.art}>
        {(narrow) => {
          const L = layoutFor(narrow);
          return (
            <>
              <Spotlight at={L.light[scene.act]} reduced={reduced} />
              <Routes layout={L} routed={scene.routed} errand={scene.errand} answering={atStage(scene.answer, "shell")} reduced={reduced} />
              {L.stations.map((geom, i) => (
                <Station
                  key={i}
                  i={i}
                  geom={geom}
                  isle={L.isle}
                  labelW={L.labelW}
                  task={tasks[i]}
                  routed={scene.routed[i]}
                  busy={scene.errand[i] === "there"}
                  work={scene.work[i]}
                  done={scene.done[i]}
                  reduced={reduced}
                />
              ))}
              <Hub hub={L.hub} start={L.start} awake={awake} busy={scene.start === "gone" && scene.answer === "ghost"} state={scene.start} reduced={reduced} />
              {L.stations.map((_, i) => (
                <Courier key={i} i={i} layout={L} errand={scene.errand[i]} reduced={reduced} />
              ))}
              <Bubble rect={L.bubble} stage={scene.bubble} clauses={scene.clauses} lit={scene.lit} answer={scene.answer} reduced={reduced} />
            </>
          );
        }}
      </FitBox>
    </StageShell>
  );
}
