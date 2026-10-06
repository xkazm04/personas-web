"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { captionAt, statusAt } from "../shared/narration";
import Shell from "../shared/Shell";
import { useSceneClock } from "../shared/useSceneClock";
import { BEATS, CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, gardenAt } from "./data";
import Earth from "./Earth";
import Garden from "./Garden";
import Lantern from "./Lantern";
import Overlay, { PhoneCard } from "./Overlay";

/**
 * Athena lab - Nothing quietly rots, v2: "Roots".
 *
 * Rot is the word, so this direction draws it literally: your projects as a
 * garden at night, in cross-section - each one a plant above ground, and the
 * things it stands on as roots below it. While you are elsewhere she walks
 * the whole garden with a light. One plant is leaning; from above that is all
 * anyone could see. She goes DOWN - along its stem, under the ground, root by
 * root - and the run that went bad lights up behind her until she reaches the
 * cause. The finding opens beside it; she starts the fix, and the run heals
 * from the cause back up while the plant lifts. Rot is quiet because it
 * happens underneath: she is the one who looks underneath.
 *
 * Words: the SectionIntro trio, plant names at their feet, the cause's name,
 * the live section's translated finding, five-word captions, one status line.
 *
 * Fit: the garden is a fixed-aspect box (`data-stage-art`, 1600:720) that
 * grows with the stage slot; its type is sized from the slot (`cqh`), and
 * `Earth` runs the sky, soil and horizon out to the slot's edges, so a tall
 * or narrow stage never leaves the garden floating. Phones keep a wider box
 * centred on the plant she goes for and crop the edges.
 *
 * Reduced motion pins INITIAL_TICK: down at the cause, the fix just taken.
 */
export default function AthenaLabPortfolioRoots() {
  const { t } = useTranslation();
  const copy = t.athenaPage.portfolio;
  const { ref, phase, reduced, live } = useSceneClock({
    cycle: CYCLE,
    tickMs: TICK_MS,
    park: PARK_TICK,
    pinned: INITIAL_TICK,
  });
  const g = gardenAt(phase);

  return (
    <Shell
      sectionRef={ref}
      label={t.athenaLab.portfolio.aria.roots}
      status={statusAt(phase, BEATS, copy.status)}
      live={live}
      slotClassName="flex min-h-[28rem] flex-col justify-center overflow-hidden"
    >
      <Earth />
      <div
        data-stage-art
        className="relative aspect-[1600/720] w-full max-sm:left-1/2 max-sm:w-[60rem] max-sm:max-w-none max-sm:-translate-x-1/2"
        style={{ ["--art-ar" as string]: 1600 / 720 }}
      >
        <Garden g={g} live={live} reduced={reduced} />
        <Overlay g={g} live={live} reduced={reduced} />
        {/* No caption while she is on her way down - the run lighting behind
            her is the narration there. */}
        <Lantern
          g={g}
          caption={g.where === "down" && !g.open ? null : captionAt(phase, BEATS, copy.caption)}
          live={live}
          reduced={reduced}
        />
      </div>
      <PhoneCard g={g} live={live} reduced={reduced} />
    </Shell>
  );
}
