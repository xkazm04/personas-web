"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { STEP } from "@/components/athena/stage/stages";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Gaze, Wash } from "./Attention";
import { COPY } from "./copy";
import type { SceneState } from "./data";
import FindingPanel from "./FindingPanel";
import { carry, noticePath, recede, type FieldLayout } from "./layout";
import { Drift } from "./parts";
import ProjectLight from "./ProjectLight";
import Watcher from "./Watcher";

/**
 * The whole field, in one composed image.
 *
 * Back to front, and the order is the argument: her light under everything,
 * yours moving across it, the line she draws when she finally has something to
 * say, the constellation of things you own, the one she is holding out to you,
 * the page she wrote about it, and her.
 *
 * Only two things ever move in layout terms, and neither of them actually does:
 * the light she carries forward rides a field-sized transform layer, and the
 * rest of the constellation steps back on a scale and a blur. Nothing is
 * inserted, nothing is removed, so the field can never jump — which matters
 * more here than anywhere, because the section's whole claim is that it is
 * showing you the same six things the entire time.
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
  const uid = useId();
  const path = useMemo(() => noticePath(layout), [layout]);
  const carried = carry(layout, scene.surfaced);
  const step = recede(layout);
  const weeks = (layout.compact ? COPY.elapsedShort : COPY.elapsed)[scene.weeks];
  const whisper = scene.resolved ? COPY.finding.resolved : weeks;

  const healthOf = (i: number) =>
    i === layout.subject
      ? scene.subjectHealth
      : i === layout.runnerUp
        ? scene.runnerUpHealth
        : 0;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Wash layout={layout} alert={scene.alert} reduced={reduced} />
      <Gaze at={layout.gaze[scene.gaze]} spread={layout.gazeSpread} reduced={reduced} />

      {/* The one line she draws: her, to the thing nobody was looking at. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`${uid}-look`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={layout.watcher.y}
            x2="0"
            y2={layout.cells[layout.subject].at.y}
          >
            <stop offset="0%" stopColor={tint("cyan", 72)} />
            <stop offset="100%" stopColor={tint("cyan", 22)} />
          </linearGradient>
        </defs>
        <motion.path
          d={path}
          fill="none"
          stroke={`url(#${uid}-look)`}
          strokeWidth="0.26"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: scene.thread ? 1 : 0, opacity: scene.thread ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.7, ease: "easeInOut" }}
        />
        {scene.thread && !reduced && (
          <motion.path
            d={path}
            fill="none"
            stroke={BRAND_VAR.cyan}
            strokeWidth="0.62"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 70)})` }}
            initial={{ pathLength: 0.1, pathOffset: 0, opacity: 0 }}
            animate={{ pathLength: 0.1, pathOffset: [0, 0.9], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </svg>

      {/* Everything else you own — it steps back while she shows you one thing */}
      <motion.div
        className={`absolute inset-0 ${reduced ? "" : "transition-[filter] duration-700 ease-out"}`}
        style={{
          filter: scene.surfaced ? "blur(2px)" : "blur(0px)",
          transformOrigin: step.origin,
        }}
        initial={false}
        animate={{ scale: scene.surfaced ? step.scale : 1, opacity: scene.surfaced ? 0.8 : 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.75, ease: "easeOut" }}
      >
        {layout.cells.map((cell, i) =>
          i === layout.subject ? null : (
            <ProjectLight
              key={COPY.projects[i]}
              cell={cell}
              name={COPY.projects[i]}
              stage={scene.cell}
              health={healthOf(i)}
              base={layout.base}
              lead={i * STEP}
              watching={scene.watching}
              reduced={reduced}
            />
          ),
        )}
      </motion.div>

      {/* The one she is holding out to you */}
      <Drift dx={carried.x} dy={carried.y} reduced={reduced}>
        <ProjectLight
          cell={layout.cells[layout.subject]}
          name={COPY.projects[layout.subject]}
          stage={scene.cell}
          health={scene.subjectHealth}
          base={layout.base}
          lead={layout.subject * STEP}
          dusty
          lifted={scene.surfaced}
          elapsed={whisper || undefined}
          resolved={scene.resolved}
          watching={scene.watching}
          reduced={reduced}
        />
      </Drift>

      <FindingPanel
        rect={layout.panel}
        stage={scene.panel}
        health={scene.subjectHealth}
        open={scene.report}
        reduced={reduced}
      />

      <Watcher at={layout.watcher} alert={scene.alert} reduced={reduced} />
    </div>
  );
}
