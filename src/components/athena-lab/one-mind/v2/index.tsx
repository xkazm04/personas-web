"use client";

import { atStage } from "@/components/athena/stage/stages";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import StageShell from "../shared/StageShell";
import { useLoop } from "../shared/useLoop";
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt } from "./data";
import { layoutFor } from "./layout";
import Line from "./Line";
import Moment from "./Moment";
import Sky from "./Sky";
import { statusAt } from "./status";

/**
 * Lab v2 - "One Day". The same claim, told in TIME instead of in parallel.
 *
 * The live section shows many conversations at once. This one follows one
 * person through one day: at your desk in the morning, on a walk at midday
 * with no screen at all, in a different project in the evening. Each time,
 * she picks up exactly where you left off - what you said in the morning is
 * the first thing she tells you at noon, what you settled at noon is what her
 * evening answer stands on.
 *
 * Two visual rules carry it without a sentence of explanation:
 *  - the WORLD changes colour with the hour (your words, the surfaces, the
 *    light travelling the sky: amber, green, violet); SHE does not - her
 *    words, her face, her line are the same cyan in every moment;
 *  - one line runs under the whole day with the same face at every stop, and
 *    what you said rides it from one moment into the next.
 *
 * Reduced motion pins the hold: the whole day on screen, every stop lit.
 */
export default function OneMindOneDay() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const lab = t.athenaLab.oneMind.v2;
  const live = t.athenaPage.oneMind.status;
  const { ref, phase, reduced, running } = useLoop({
    cycle: CYCLE,
    tickMs: TICK_MS,
    still: INITIAL_TICK,
    park: PARK_TICK,
  });
  const layout = layoutFor(compact);
  const scene = sceneAt(phase);
  const spoke = scene.moments.map((s) => atStage(s, "detail"));
  const stop = layout.stops[scene.sun];
  const reach = scene.holding
    ? 1
    : Math.min(1, (layout.axis === "x" ? stop.x + 12 : stop.y + 14) / 100);

  return (
    <StageShell
      sectionRef={ref}
      label={lab.aria}
      status={statusAt(phase, lab.status, live, false)}
      statusShort={statusAt(phase, lab.status, live, true)}
      settled={scene.holding}
      running={running}
      compactHeight="h-[52rem]"
    >
      {layout.sky && layout.skyPath && (
        <Sky
          path={layout.skyPath}
          points={layout.sky}
          sun={scene.sun}
          captions={lab.moments.map((m) => `${m.time} · ${m.place}`)}
          lit={scene.moments.map((s) => atStage(s, "shell"))}
          reduced={reduced}
        />
      )}

      {layout.moments.map((rect, i) => (
        <Moment
          key={i}
          index={i}
          rect={rect}
          stage={scene.moments[i]}
          current={!scene.holding && scene.current === i}
          recalled={scene.recalled[i]}
          shipped={scene.shipped}
          speaking={running && scene.current === i && !spoke[i]}
          talking={running && i === 1 && scene.current === 1 && !scene.holding}
          captionInside={!layout.sky}
          reduced={reduced}
        />
      ))}

      <Line
        layout={layout}
        reach={reach}
        spoke={spoke}
        tokens={scene.tokens}
        labels={lab.tokens}
        chorus={scene.chorus}
        together={scene.together}
        reduced={reduced}
        running={running}
      />
    </StageShell>
  );
}
