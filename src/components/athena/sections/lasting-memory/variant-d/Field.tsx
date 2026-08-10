"use client";

import { motion } from "framer-motion";
import { atStage } from "@/components/athena/stage/stages";
import Chamber from "./Chamber";
import { SOURCE } from "./copy";
import type { SceneState } from "./data";
import Flow from "./Flow";
import type { FieldLayout } from "./layout";
import Shelf from "./Shelf";
import Working from "./Working";
import Zones from "./Zones";

/**
 * The frame, back to front. The order carries two decisions.
 *
 * The COOLING VEIL sits above the three zones and everything in them, and
 * below the flow and below her. So while she rests the working surface and the
 * shelf go dark together — the field genuinely quiets — while the material
 * moving through her, and she herself, stay lit. That is the whole reading of
 * the sleeping stage in one stacking order: the room goes dark, the work goes
 * on inside her.
 *
 * The FLOW is above the veil rather than under it for the same reason, and it
 * is above the shelf so a stream arrives on top of the slot it is filling
 * instead of disappearing behind it.
 *
 * Everything is placed in the same percent space, so nothing is projected and
 * nothing needs keeping in sync.
 */
export default function Field({
  scene,
  caption,
  captionPrev,
  parity,
  layout,
  reduced,
}: {
  scene: SceneState;
  caption: string | null;
  captionPrev: string | null;
  parity: number;
  layout: FieldLayout;
  reduced: boolean;
}) {
  const landing = scene.keeping
    ? Array.from({ length: scene.kept - scene.keptPrev }, (_, i) => scene.keptPrev + i)
    : [];
  const sources = landing.map((i) => SOURCE[i] % layout.scraps);
  const pass = scene.drawing || scene.distilling || scene.keeping;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <Zones
        layout={layout}
        now={scene.now}
        chamber={scene.chamber}
        shelf={scene.shelf}
        resting={scene.resting}
        reduced={reduced}
      />

      <Working
        layout={layout}
        stage={scene.now}
        talkTicks={scene.talkTicks}
        sources={sources}
        resting={scene.resting}
        reduced={reduced}
      />

      <Shelf
        layout={layout}
        stage={scene.shelf}
        kept={scene.kept}
        keptPrev={scene.keptPrev}
        hushed={scene.hushed}
        holding={scene.holding}
        reduced={reduced}
      />

      {/* The room going dark around her. */}
      <motion.span
        className="pointer-events-none absolute inset-0 bg-background"
        initial={false}
        animate={{ opacity: scene.veil }}
        transition={{ duration: reduced ? 0 : 0.8, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <Flow
        layout={layout}
        active={pass}
        drawing={scene.drawing}
        keeping={scene.keeping}
        sources={sources}
        landing={landing}
        refused={scene.refused}
        reduced={reduced}
      />

      <Chamber
        layout={layout}
        shown={atStage(scene.chamber, "shell")}
        resting={scene.resting}
        distilling={scene.distilling}
        pressure={scene.pressure}
        caption={caption}
        captionPrev={captionPrev}
        parity={parity}
        holding={scene.holding}
        reduced={reduced}
      />
    </div>
  );
}
