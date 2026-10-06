"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import { captionAt, statusAt } from "../shared/narration";
import Shell from "../shared/Shell";
import { useSceneClock } from "../shared/useSceneClock";
import { BEATS, CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt } from "./data";
import Field from "./Field";
import { layoutFor } from "./layout";

/**
 * Athena lab - Nothing quietly rots, v1: "The Flight", evolved.
 *
 * Same story, same camera, same trick as the live section: an aerial field of
 * every project you own; she checks all of them at once, goes to the worst,
 * the camera follows her DOWN (one scale + pan on the world), the project
 * opens, she opens the fix, the camera lifts back out. Type rides a screen
 * layer at the projected position of what it names, so the descent resolves
 * more detail instead of bigger type.
 *
 * What v1 pushes:
 *   depth   plots stand on raised slabs over contoured ground; banks of haze
 *           sit between the camera and the ground and part around the target
 *           on the way down (parallax), so the camera passes THROUGH air.
 *   detail  a second level of terrain: each plot's inner structure resolves
 *           only once the camera has landed, and on the one she came for, the
 *           part that is actually wrong lights up - the cause, found on the
 *           ground, wired by a hairline into the sentence that names it.
 *   light   the frame darkens around the target once down (the key light
 *           follows her attention); she draws her route before she flies it.
 *   type    labels and the opened detail size from the field (`cqh`), so the
 *           detail is the dominant thing on screen at every stage size.
 *   fit     one stage tall on desktop; the detail docks beside the plot with
 *           content height, so a 1366x657 laptop never clips it.
 *
 * Reduced motion pins INITIAL_TICK - the bottom of the descent just after the
 * fix commits - and does not rewind.
 */
export default function AthenaLabPortfolioFlight() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const copy = t.athenaPage.portfolio;
  const { ref, phase, reduced, live } = useSceneClock({
    cycle: CYCLE,
    tickMs: TICK_MS,
    park: PARK_TICK,
    pinned: INITIAL_TICK,
  });
  const layout = layoutFor(compact);
  const scene = sceneAt(phase, layout.islands);

  return (
    <Shell
      sectionRef={ref}
      label={t.athenaLab.portfolio.aria.flight}
      status={statusAt(phase, BEATS, copy.status)}
      live={live}
    >
      <Field
        scene={scene}
        caption={captionAt(phase, BEATS, copy.caption)}
        layout={layout}
        live={live}
        reduced={reduced}
      />
    </Shell>
  );
}
