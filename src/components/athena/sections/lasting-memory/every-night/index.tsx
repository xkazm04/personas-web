"use client";

import { useRef } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import LabShell from "./shared/LabShell";
import { useLabClock } from "./shared/useLabClock";
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt } from "./data";
import Field from "./Field";
import { COMPACT_AR, WIDE_AR, layoutFor } from "./layout";
import { statusAt, statusShortAt } from "./status";

/**
 * Memory lab, v1 - "Every night, a little more", EVOLVED.
 *
 * The live section's story, unchanged: five ordinary days of working together,
 * end to end. Each day's talk builds up to the same line; at the end of a day
 * that had enough in it she sleeps on it and something she keeps comes down
 * onto a shelf that only ever grows; one quiet day never reaches the line and
 * gets no night; and two days later the first thing she ever kept lights up
 * and runs back into the day being worked.
 *
 * What this pass pushes is craft, not concept:
 *
 * - FIT. The field is an aspect-locked art box in the stage slot, so the whole
 *   scene is exactly one stage tall and keeps its shape on every screen.
 * - DEPTH AND LIGHT. Each day is a lit window that dims as it recedes; the
 *   night band is a sky with a moon per night; the shelf is a physical ledge
 *   with a lit lip, and what she keeps stands on it with a shadow under it.
 * - HIERARCHY. The kept thing and the sentence she wrote about it are now one
 *   card, so the only whole sentences in the frame sit where the eye ends -
 *   on the ledge - at reading size, instead of in a fourth row under it.
 * - CHOREOGRAPHY. Two voices in the talk (yours, hers); the recall is a spark
 *   that travels the route out of the card and lands in today's talk.
 *
 * Reduced motion pins INITIAL_TICK, the hold: five days lived, every card on
 * the ledge, the recall still traced. Clock: `../shared/useLabClock`.
 */
export default function MemoryLabEveryNight() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const { status } = t.athenaPage.memory;
  const sectionRef = useRef<HTMLElement | null>(null);
  const { phase, reduced } = useLabClock(sectionRef, {
    cycle: CYCLE,
    tickMs: TICK_MS,
    still: INITIAL_TICK,
    park: PARK_TICK,
  });
  const scene = sceneAt(phase);

  return (
    <LabShell
      sectionRef={sectionRef}
      artLabel={t.athenaSections.memory.v1.artLabel}
      ar={WIDE_AR}
      compactAr={COMPACT_AR}
      arMin={1.75}
      compact={compact}
      status={statusAt(phase, status)}
      statusShort={statusShortAt(phase, status)}
      steady={scene.holding}
      reduced={reduced}
    >
      <Field scene={scene} layout={layoutFor(compact)} reduced={reduced} />
    </LabShell>
  );
}
