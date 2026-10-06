"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, frame } from "./shared/art";
import Shell from "./shared/Shell";
import { useSceneClock } from "./shared/useSceneClock";
import { useStretch } from "./shared/useStretch";
import Chips from "./Chips";
import { CYCLE, DEFAULT_LINE, STILL_TICK, TICK_MS, sceneAt, statusAt, tally } from "./data";
import Field from "./Field";
import Handle from "./Handle";
import { WIDE_H, WIDE_W, layoutFor } from "./layout";
import Tallies from "./Tallies";

/**
 * Workshop lab v3 - "The Line You Set".
 *
 * The claim told as a field you can touch. Every piece of work sits at the
 * height of what is at stake in it - fixing a typo near the floor, a refund
 * or a release near the top - and one line, yours, cuts across. Under it she
 * simply does the work; over it, the work comes to you. Then "however much
 * you hand her" is shown literally: ten times the work lands, then a hundred
 * times, and her tally races into the hundreds while yours grows only by what
 * is over the line. The line takes one bright pass and does not move.
 *
 * And then it is handed to the visitor: the line has a handle, and dragging
 * it (or arrow keys on it) re-sorts every piece of work on the spot. You
 * decide how far she goes; whatever you decide, it holds.
 *
 * Reduced motion pins the settled field - all the volume landed, the two
 * tallies final - and the handle still works, instantly.
 */
export default function WorkshopLineYouSet() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const c = t.athenaSections.workshop.v3;
  const { ref, phase, reduced } = useSceneClock({ cycle: CYCLE, still: STILL_TICK, tickMs: TICK_MS });
  const [line, setLine] = useState(DEFAULT_LINE);
  const scene = sceneAt(phase);
  const stretch = useStretch(WIDE_W, WIDE_H);
  const g = layoutFor(compact, stretch.k);
  const f = frame(g.W, g.H);
  const [status, statusShort] = statusAt(scene.beat, c);
  const { done, yours, named } = tally(phase, line);

  return (
    <Shell sectionRef={ref} status={status} statusShort={statusShort} settled={scene.calm} reduced={reduced}>
      <ArtBox w={g.W} h={g.H} label={c.art} measureRef={stretch.ref}>
        <Field scene={scene} phase={phase} line={line} g={g} reduced={reduced} />
        <Chips phase={phase} line={line} g={g} f={f} reduced={reduced} />
        <Tallies done={done} yours={yours} named={named} mood={scene.busy ? "busy" : "rest"} g={g} f={f} reduced={reduced} />
        <Handle line={line} setLine={setLine} drawn={scene.drawn} invite={scene.invite} g={g} f={f} reduced={reduced} />
      </ArtBox>
    </Shell>
  );
}
