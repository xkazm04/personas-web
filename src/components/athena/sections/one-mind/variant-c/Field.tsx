"use client";

import Answer from "./Answer";
import ConversationCard from "./ConversationCard";
import { SOURCE_OF } from "./copy";
import type { SceneState } from "./data";
import type { FieldLayout } from "./layout";
import Presence from "./Presence";
import Threads from "./Threads";

/**
 * The hearth, back to front.
 *
 * Three layers and no camera: the threads underneath (so a strand crossing a
 * conversation goes behind it), the conversations and the open one on top of
 * them, and her above everything — the only thing in the frame that is not a
 * surface.
 *
 * Everything is placed in the same percent space, which is what a section
 * that never travels buys: type sits in the art at its authored size, at
 * every viewport, with nothing projected and nothing to keep in sync.
 */
export default function Field({
  scene,
  layout,
  reduced,
}: {
  scene: SceneState;
  layout: FieldLayout;
  reduced: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <Threads
        layout={layout}
        cards={scene.cards}
        gathering={scene.working}
        trunkDrawn={scene.trunk}
        answering={scene.working && scene.trunk}
        sourced={scene.sourced}
        together={scene.together}
        reduced={reduced}
      />

      {layout.cards.map((rect, i) => (
        <ConversationCard
          key={i}
          index={i}
          rect={rect}
          stage={scene.cards[i]}
          sourced={scene.sourced && SOURCE_OF.some((s) => s === i)}
          chorus={scene.chorus}
          together={scene.together}
          reduced={reduced}
        />
      ))}

      <Answer
        layout={layout}
        stage={scene.panel}
        rowsIn={scene.rowsIn}
        chorus={scene.chorus}
        together={scene.together}
        reduced={reduced}
      />

      <Presence
        at={layout.her}
        reaching={scene.reaching}
        working={scene.working}
        chorus={scene.chorus}
        together={scene.together}
        reduced={reduced}
      />
    </div>
  );
}
