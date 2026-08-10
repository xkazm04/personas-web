"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { atStage } from "@/components/athena/stage/stages";
import { PROJECTS, WORST } from "./copy";
import type { SceneState } from "./data";
import Island from "./Island";
import Labels from "./Labels";
import {
  ALTITUDE,
  cameraOn,
  centerOf,
  panelRect,
  projectRect,
  type FieldLayout,
} from "./layout";
import NearPanel from "./NearPanel";
import Presence from "./Presence";

/**
 * The field, and the camera over it.
 *
 * Two layers, and the split is the whole variant:
 *
 *   WORLD   the plots and the ground they sit on, carried by ONE transform.
 *           Altitude is a scale and a pan on a single group — never a
 *           `left`/`top` on anything, never a filter, so the descent is a
 *           compositor job whatever the field is holding.
 *   SCREEN  every element that carries type — names, the opened detail, and
 *           Athena — placed at the projected position of what it belongs to.
 *
 * The camera is split into two nested transforms on purpose. Composing a
 * translate and a scale in one property means depending on the order a
 * library happens to serialise them in; nesting states it: the inner scales
 * about the field's top-left, the outer pans, so a world point p always
 * lands at t + s·p — which is exactly what `project` computes for the
 * screen layer.
 *
 * The ground grid is the altimeter. It is the one thing on the field with no
 * meaning at all, and it is doing the most work: squares that double in size
 * are what make a scale read as a descent rather than as a zoom.
 */

const TRAVEL = { duration: 2.3, ease: [0.65, 0, 0.25, 1] } as const;

export default function Field({
  scene,
  caption,
  layout,
  reduced,
}: {
  scene: SceneState;
  /** Her five words for this beat — a wording concern, so it arrives from
   *  `./status` rather than out of the choreography. */
  caption: string | null;
  layout: FieldLayout;
  reduced: boolean;
}) {
  const near = useMemo(
    () => cameraOn(centerOf(layout.islands[WORST]), layout.nearZoom, layout.nearFocus),
    [layout],
  );
  const camera = scene.near ? near : ALTITUDE;
  const move = reduced ? { duration: 0 } : TRAVEL;
  const open = scene.near && atStage(scene.panel, "shell");

  const target = layout.islands[WORST];
  const panel = panelRect(target, near, layout);
  const shot = projectRect(target, near);
  const stem =
    panel.y > shot.y + shot.h
      ? { x: shot.x + shot.w / 2, y: shot.y + shot.h, h: panel.y - shot.y - shot.h }
      : null;

  const station =
    scene.station === "near"
      ? layout.nearStation
      : scene.station === "target"
        ? centerOf(target)
        : layout.rest;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "0 0" }}
        initial={false}
        animate={{ x: `${camera.tx}%`, y: `${camera.ty}%` }}
        transition={move}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: "0 0" }}
          initial={false}
          animate={{ scale: camera.s }}
          transition={move}
        >
          {/* The ground */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${tint("cyan", 7)} 1px, transparent 1px), linear-gradient(to bottom, ${tint("cyan", 7)} 1px, transparent 1px)`,
              backgroundSize: "8.3333% 12.5%",
            }}
          />

          {layout.islands.map((rect, i) => (
            <Island
              key={PROJECTS[i].name}
              index={i}
              rect={rect}
              tilt={layout.tilt[i]}
              stage={scene.stages[i]}
              tone={scene.tones[i]}
              settled={scene.settled}
              restless={scene.restless}
              bad={PROJECTS[i].bad}
              dim={scene.near && i !== WORST}
              reduced={reduced}
            />
          ))}
        </motion.div>
      </motion.div>

      <Labels
        layout={layout}
        camera={scene.labelsNear ? near : ALTITUDE}
        tones={scene.tones}
        shown={scene.labels}
        muted={open ? WORST : null}
        avoid={open ? panel : null}
        reduced={reduced}
      />

      <NearPanel
        rect={panel}
        stem={stem}
        stage={scene.panel}
        beckon={scene.beckon}
        open={open}
        reduced={reduced}
      />

      <Presence
        at={station}
        caption={caption}
        surveying={scene.surveying}
        traveling={scene.station === "target" || (scene.near && !atStage(scene.panel, "shell"))}
        reduced={reduced}
      />
    </div>
  );
}
