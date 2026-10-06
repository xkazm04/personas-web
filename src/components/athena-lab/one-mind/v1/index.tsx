"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import StageShell from "../shared/StageShell";
import { useLoop } from "../shared/useLoop";
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt } from "./data";
import Field from "./Field";
import { layoutFor } from "./layout";
import { statusAt } from "./status";

/**
 * Lab v1 - "The Return", evolved. The page's closing section.
 *
 * The live section's story, kept whole: the conversations you have going sit
 * round the edge, she sits in the middle, and when you ask one of them
 * something its own history cannot answer, every other one gives up what it
 * holds and the answer comes back down a single thread, each line still
 * joined to where she heard it. Then one shared breath, and stillness.
 *
 * What this version pushes:
 *  - fit: exactly one stage. The tall hearth is re-cut for a wide field - two
 *    flanks of conversations, her at the top of the centre, the open
 *    conversation between the flanks - and every size (type, her, the ring) is
 *    a share of the art's height, so it holds from 1366x657 to 2560x1300.
 *  - the claim's three surfaces, without a sentence: each conversation wears
 *    how you had it (typed / spoken) and when (1h ago ... last week), and the
 *    question in the open one is SPOKEN - voice bar, then words.
 *  - the shared memory, made visible: each thread's bead lands as a light in
 *    a ring around her, and the ring turns while she works.
 *  - light and depth: one pool of light under her, every card rim-lit on the
 *    side that faces her, the lower threads passing behind the near glass.
 *  - one gesture per claim: each line of the answer, its hairline and the
 *    card it quotes all arrive on the same beat.
 *
 * Reduced motion pins the hold (INITIAL_TICK) - the same frame the moving
 * version ends on.
 */
export default function OneMindReturnLab() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const { status } = t.athenaPage.oneMind;
  const { ref, phase, reduced, running } = useLoop({
    cycle: CYCLE,
    tickMs: TICK_MS,
    still: INITIAL_TICK,
    park: PARK_TICK,
  });
  const layout = layoutFor(compact);
  const scene = sceneAt(phase, layout.cards.length);

  return (
    <StageShell
      sectionRef={ref}
      label={t.athenaLab.oneMind.v1.aria}
      status={statusAt(phase, status, false)}
      statusShort={statusAt(phase, status, true)}
      settled={scene.holding}
      running={running}
      compactHeight="h-[46rem]"
    >
      <Field scene={scene} layout={layout} reduced={reduced} running={running} />
    </StageShell>
  );
}
