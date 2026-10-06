"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import StageShell from "../shared/StageShell";
import { useLoop } from "../shared/useLoop";
import { TILE_CONTENT } from "./copy";
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, arriveAt, sceneAt } from "./data";
import Forward from "./Forward";
import { layoutFor } from "./layout";
import { statusAt } from "./status";
import Tile from "./Tile";

/**
 * Lab v3 - "One Face". The same claim, told as IDENTITY.
 *
 * v1 shows many conversations pooling into one memory; v2 follows one day.
 * This one asks what "the same person" looks like. Every conversation you
 * have going is a window on a wall - typed, spoken, one per project - each
 * slightly out of true, each its own thing. Then they fall into register and
 * a face develops through all of them at once: the wall was one person the
 * whole time.
 *
 * Then the proof that she is one person and not one picture: a window comes
 * forward and you ask the question you ask after time away - "where were
 * we?" - and she answers with exactly where THAT conversation stopped. It
 * goes back, a window on the other side comes forward, same question, its
 * own answer. Finally every window flashes on one beat and the face holds.
 *
 * Reduced motion pins the first window open on her answer, in front of the
 * whole face - both halves of the claim in one calm frame.
 */
export default function OneMindOneFace() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const lab = t.athenaLab.oneMind.v3;
  const live = t.athenaPage.oneMind;
  const names = [...live.conversations.map((c) => c.name), ...lab.extras];
  const { ref, phase, reduced, running } = useLoop({
    cycle: CYCLE,
    tickMs: TICK_MS,
    still: INITIAL_TICK,
    park: PARK_TICK,
  });
  const layout = layoutFor(compact);
  const scene = sceneAt(phase);
  const contentOf = (tile: number) => TILE_CONTENT[layout.order[tile]];
  const nameOf = (tile: number) => {
    const n = contentOf(tile).name;
    return n === null ? null : names[n];
  };

  return (
    <StageShell
      sectionRef={ref}
      label={lab.aria}
      status={statusAt(phase, lab.status, live.status, false)}
      statusShort={statusAt(phase, lab.status, live.status, true)}
      settled={scene.holding}
      running={running}
      compactHeight="h-[48rem]"
    >
      {layout.tiles.map((rect, i) => (
        <Tile
          key={i}
          index={i}
          rect={rect}
          content={contentOf(i)}
          name={nameOf(i)}
          portrait={layout.portrait}
          arrived={phase >= arriveAt(i, layout.cols)}
          registered={scene.registered}
          forward={layout.forward[scene.open.which]?.tile === i}
          chorus={scene.chorus}
          together={scene.together}
          reduced={reduced}
          running={running}
        />
      ))}

      {layout.forward.map((f, k) => (
        <Forward
          key={k}
          open={scene.open.which === k}
          tile={layout.tiles[f.tile]}
          card={f.card}
          content={contentOf(f.tile)}
          name={nameOf(f.tile)}
          ask={lab.ask}
          reply={lab.replies[k]}
          label={lab.reopened}
          asked={scene.open.asked}
          answered={scene.open.answered}
          reduced={reduced}
        />
      ))}
    </StageShell>
  );
}
