"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import { captionAt, statusAt } from "../shared/narration";
import Shell from "../shared/Shell";
import { useSceneClock } from "../shared/useSceneClock";
import { BEATS, CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, vitalsAt } from "./data";
import Traces from "./Traces";
import Wall from "./Wall";
import Watcher from "./Watcher";
import { wallLayout } from "./waves";

/**
 * Athena lab - Nothing quietly rots, v3: "Vital signs".
 *
 * Rot is quiet because nothing alarms when a project simply stops - so this
 * direction draws your portfolio as a wall of heartbeats: every project's
 * pulse over the last two weeks, with YOUR week across the top (a launch, an
 * offsite, hiring, board prep - you were elsewhere). She is the playhead:
 * one line sweeping every project at once, each trace drawing as she passes.
 * One of them slowed on the third day and then went flat. At today the wall
 * sorts itself; worst first, she pins the day it went quiet, names what it
 * stands on right at the foot of the pin, opens the finding and starts the
 * fix - and past today, that lane beats again, emerald.
 *
 * The difference from the other two directions: v1 is space (a camera over a
 * map), v2 is depth (what is under the surface), v3 is TIME - the rot is a
 * duration, and you can see exactly how long nobody heard it.
 *
 * Fit: the wall is drawn in percent of the stage slot (a size container), its
 * strokes non-scaling and its type sized from the slot, so it fills a laptop
 * stage and a 1440p one alike. Phones keep the first six lanes.
 *
 * Reduced motion pins INITIAL_TICK: the fix just taken, the whole story on
 * the wall at once.
 */
export default function AthenaLabPortfolioVitals() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const copy = t.athenaPage.portfolio;
  const { ref, phase, reduced, live } = useSceneClock({
    cycle: CYCLE,
    tickMs: TICK_MS,
    park: PARK_TICK,
    pinned: INITIAL_TICK,
  });
  const v = vitalsAt(phase);
  const L = wallLayout(compact);

  return (
    <Shell
      sectionRef={ref}
      label={t.athenaLab.portfolio.aria.vitals}
      status={statusAt(phase, BEATS, copy.status)}
      live={live}
    >
      <div className="absolute inset-0 rounded-2xl border px-3 py-3 sm:px-5 sm:py-4" style={{ borderColor: "color-mix(in srgb, var(--brand-cyan) 14%, transparent)", backgroundColor: "color-mix(in srgb, var(--background) 45%, transparent)" }}>
        <div className="relative h-full w-full">
          <Traces v={v} L={L} reduced={reduced} />
          <Wall v={v} L={L} reduced={reduced} />
          <Watcher v={v} L={L} caption={captionAt(phase, BEATS, copy.caption)} live={live} reduced={reduced} />
        </div>
      </div>
    </Shell>
  );
}
