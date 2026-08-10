"use client";

import { ASKED, CONVERSATIONS, TOLD } from "./copy";
import Conversation from "./Conversation";
import type { SceneState } from "./data";
import FactInFlight from "./FactInFlight";
import type { FieldLayout } from "./layout";
import Memory from "./Memory";
import ThreadLayer, { type Spark } from "./ThreadLayer";
import Voice from "./Voice";

/**
 * Everything on the field, placed from one set of percent rects.
 *
 * Nothing here decides WHEN anything happens: every piece reads its stage off
 * the `SceneState` that `data.ts` derives from the tick and composes itself
 * from that. This file only knows WHERE things are and what draws on what.
 *
 * The stack, back to front, and the order is the argument:
 *
 *   threads       underneath everything, because they are what everything else
 *                 is standing on — a thread passing a conversation goes behind
 *                 it, the way wiring does.
 *   memory        one body, holding the bottom of the field.
 *   conversations several places, each its own.
 *   the fact      in flight, over all of it, at its authored size.
 *   her           on top and alone, because there is only one of her.
 */
export default function Field({
  scene,
  layout,
  compact,
  reduced,
}: {
  scene: SceneState;
  layout: FieldLayout;
  compact: boolean;
  reduced: boolean;
}) {
  const sparks: Spark[] = layout.panels.map((_, i) => {
    if (scene.travel && i === TOLD) return "down";
    if (scene.reach && i === ASKED) return "up";
    if (scene.spread && i !== TOLD) return "up";
    return null;
  });

  return (
    <div className="absolute inset-0">
      <ThreadLayer
        layout={layout}
        drawn={scene.threads}
        sparks={sparks}
        unified={scene.unified}
        reduced={reduced}
      />

      <Memory
        layout={layout}
        stage={scene.band}
        landed={scene.landed}
        reach={scene.reach}
        unified={scene.unified}
        reduced={reduced}
      />

      {layout.panels.map((rect, i) => (
        <Conversation
          key={CONVERSATIONS[i].subject}
          rect={rect}
          tilt={layout.tilt[i]}
          talk={CONVERSATIONS[i]}
          stage={scene.panels[i]}
          said={scene.said[i]}
          chip={scene.chips[i]}
          active={scene.station === i}
          marked={i === ASKED && scene.marked}
          touched={scene.spread && i !== TOLD}
          unified={scene.unified}
          progress={scene.progress}
          compact={compact}
          window={layout.window}
          reduced={reduced}
        />
      ))}

      {scene.travel && <FactInFlight layout={layout} reduced={reduced} />}

      <Voice
        layout={layout}
        station={scene.station}
        speaking={scene.speaking}
        compact={compact}
        reduced={reduced}
      />
    </div>
  );
}
