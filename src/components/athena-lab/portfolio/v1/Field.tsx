"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { atStage } from "@/components/athena/stage/stages";
import Atmosphere from "./Atmosphere";
import { CAUSE, PARTS, PROJECTS, WORST } from "./copy";
import type { SceneState } from "./data";
import Ground from "./Ground";
import Island from "./Island";
import Labels from "./Labels";
import {
  ALTITUDE,
  cameraOn,
  centerOf,
  panelRect,
  pointIn,
  project,
  projectRect,
  type FieldLayout,
} from "./layout";
import NearPanel from "./NearPanel";
import Presence from "./Presence";

/**
 * The field, and the camera over it.
 *
 *   WORLD   the ground and the plots, carried by ONE camera (an outer pan and
 *           an inner scale about the top-left, so a world point p always
 *           lands at t + s*p - exactly what `project` computes).
 *   SCREEN  everything that carries type, and the air: names, the opened
 *           detail, Athena, the haze, her route and the spotlight - placed at
 *           the projected position of what they belong to, so type never
 *           magnifies and the descent resolves more detail, not bigger.
 *
 * New in v1: the leader. Once down, a hairline runs from the part of the
 * project that is actually wrong straight into the opened detail - the cause
 * on the terrain and the sentence that names it are one gesture.
 */

const TRAVEL = { duration: 2.3, ease: [0.65, 0, 0.25, 1] } as const;

export default function Field({
  scene,
  caption,
  layout,
  live,
  reduced,
}: {
  scene: SceneState;
  caption: string | null;
  layout: FieldLayout;
  live: boolean;
  reduced: boolean;
}) {
  const target = layout.islands[WORST];
  const near = useMemo(
    () => cameraOn(centerOf(target), layout.nearZoom, layout.nearFocus),
    [layout, target],
  );
  const camera = scene.near ? near : ALTITUDE;
  const move = reduced ? { duration: 0 } : TRAVEL;
  const open = scene.near && atStage(scene.panel, "shell");

  const panel = panelRect(target, near, layout);
  const shot = projectRect(target, near);
  const stem =
    !layout.panel.side && panel.y > shot.y + shot.h
      ? { x: shot.x + shot.w / 2, y: shot.y + shot.h, h: panel.y - shot.y - shot.h }
      : null;
  const causeAt = project(pointIn(target, PARTS[CAUSE].x, PARTS[CAUSE].y), near);
  const leader =
    layout.panel.side && scene.cause !== "hidden" && open
      ? { x: causeAt.x, y: causeAt.y, w: panel.x - causeAt.x }
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
          <Ground landed={scene.landed} reduced={reduced} />
          {layout.islands.map((rect, i) => (
            <Island
              key={i}
              index={i}
              rect={rect}
              tilt={layout.tilt[i]}
              stage={scene.stages[i]}
              tone={scene.tones[i]}
              settled={scene.settled}
              restless={scene.restless}
              bad={PROJECTS[i].bad}
              dim={scene.near && i !== WORST}
              landed={scene.landed}
              cause={i === WORST ? scene.cause : null}
              live={live}
              reduced={reduced}
            />
          ))}
        </motion.div>
      </motion.div>

      <Atmosphere
        near={scene.near}
        landed={scene.landed}
        route={scene.route}
        from={layout.rest}
        to={centerOf(target)}
        focus={centerOf(shot)}
        scale={camera.s}
        reduced={reduced}
      />

      <Labels
        layout={layout}
        camera={scene.labelsNear ? near : ALTITUDE}
        tones={scene.tones}
        shown={scene.labels}
        muted={open ? WORST : null}
        avoid={open ? panel : null}
        reduced={reduced}
      />

      {leader && (
        <motion.span
          className="pointer-events-none absolute h-px origin-left"
          style={{
            left: `${leader.x}%`,
            top: `${leader.y}%`,
            width: `${leader.w}%`,
            backgroundColor: tint(scene.cause === "fixed" ? "emerald" : "rose", 60),
          }}
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}

      <NearPanel
        rect={panel}
        auto={layout.panel.side}
        stem={stem}
        stage={scene.panel}
        beckon={scene.beckon}
        open={open}
        live={live}
        reduced={reduced}
      />

      <Presence
        at={station}
        caption={caption}
        surveying={scene.surveying}
        traveling={scene.station === "target" || (scene.near && !atStage(scene.panel, "shell"))}
        live={live}
        reduced={reduced}
      />
    </div>
  );
}
