"use client";

import { tint } from "@/lib/brand-theme";
import Answer from "./Answer";
import ConversationCard from "./ConversationCard";
import { rowOf } from "./copy";
import type { SceneState } from "./data";
import type { FieldLayout } from "./layout";
import Presence from "./Presence";
import Threads from "./Threads";

/**
 * The hearth, back to front: the light she casts, the threads, the
 * conversations and the open one, and her above everything.
 *
 * The light is the new bottom layer. One warm pool sits under her and spills
 * onto the top of the open conversation, so the scene is lit from where she
 * is - the cards' rim lights (./ConversationCard) face the same point - and
 * the eye always comes back to the middle.
 */

/** The field is about 2.4x as wide as tall on the stage; the memory ring
 *  takes its angles in that space so each light lands where its thread does. */
const ASPECT = 2.4;

export default function Field({
  scene,
  layout,
  reduced,
  running,
}: {
  scene: SceneState;
  layout: FieldLayout;
  reduced: boolean;
  running: boolean;
}) {
  const angles = layout.exits.map(
    (e) => (Math.atan2(e.y - layout.her.y, (e.x - layout.her.x) * ASPECT) * 180) / Math.PI,
  );

  return (
    <div className="absolute inset-0">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 34% 46% at ${layout.her.x}% ${layout.her.y + 8}%, ${tint("cyan", 13)}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <Threads
        layout={layout}
        cards={scene.cards}
        gathering={scene.working}
        trunkDrawn={scene.trunk}
        answering={scene.working && scene.trunk}
        rowsIn={scene.rowsIn}
        together={scene.together}
        reduced={reduced}
        running={running}
      />

      {layout.cards.map((rect, i) => (
        <ConversationCard
          key={i}
          index={i}
          rect={rect}
          side={layout.sides[i]}
          stage={scene.cards[i]}
          sourced={rowOf(i) >= 0 && scene.rowsIn > rowOf(i)}
          chorus={scene.chorus}
          together={scene.together}
          reduced={reduced}
          running={running}
        />
      ))}

      <Answer
        layout={layout}
        stage={scene.panel}
        speaking={scene.speaking}
        asked={scene.asked}
        rowsIn={scene.rowsIn}
        chorus={scene.chorus}
        together={scene.together}
        reduced={reduced}
        running={running}
      />

      <Presence
        at={layout.her}
        angles={angles}
        motes={scene.motes}
        spin={scene.spin}
        reaching={scene.reaching}
        working={scene.working}
        chorus={scene.chorus}
        together={scene.together}
        reduced={reduced}
        running={running}
      />
    </div>
  );
}
