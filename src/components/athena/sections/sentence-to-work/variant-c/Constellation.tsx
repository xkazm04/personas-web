"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, filamentsFor, nodePoint, nodeStateAt, nodesFor } from "./data";
import { WorkLight } from "./WorkLight";

/**
 * The work, while you are not watching it.
 *
 * Eight small lights and a loose thread between them — never a chart, never a
 * board, never a queue with rows. The sky composes in layers like everything
 * else on this page: the thread and the unlit rings take shape as you leave,
 * the lights come up one after another a beat later, the few worth naming get
 * their words after that, and then they settle one by one across the deepest
 * part of the night.
 *
 * One of them will not finish. It reaches something only you can answer and it
 * WAITS — a steady amber ring that never blinks red, never times out and never
 * decides for you. It is still waiting when you get back, which is the whole
 * argument: nothing was guessed while you were gone.
 *
 * On your return the sky goes `quiet`: it recedes and lets its words go,
 * because the answer now lives in one panel on the ground. Only the amber one
 * keeps speaking, and it is saying the same thing the panel is.
 *
 * Compact drops three lights rather than shrinking any type.
 */
export function Constellation({
  stage,
  phase,
  compact,
  quiet,
  reduced,
}: {
  stage: ModuleStage;
  phase: number;
  compact: boolean;
  /** The answer has moved indoors: the sky recedes and hands its words over. */
  quiet: boolean;
  reduced: boolean;
}) {
  if (!atStage(stage, "shell")) return null;
  const named = atStage(stage, "detail");
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${reduced ? "" : "transition-opacity duration-1000"}`}
      style={{ opacity: quiet ? 0.5 : 1 }}
      aria-hidden="true"
    >
      {/* The thread. Drawn with a non-scaling stroke so stretching the box to
          the field never thickens one axis. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        {filamentsFor(compact).map((f, i) => (
          <motion.line
            key={f.id}
            x1={f.a.x}
            y1={f.a.y}
            x2={f.b.x}
            y2={f.b.y}
            stroke={tint("cyan", 16)}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, delay: i * 0.08 }}
          />
        ))}
      </svg>

      {nodesFor(compact).map((node, i) => {
        const point = nodePoint(node, compact);
        if (!point) return null;
        const state = nodeStateAt(node, phase);
        const task = node.task === null ? null : COPY.work.tasks[node.task];
        return (
          <motion.span
            key={node.id}
            className="absolute"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, delay: i * 0.09 }}
          >
            <WorkLight
              node={node}
              state={state}
              label={state === "waiting" ? COPY.work.waiting : task}
              showLabel={state === "waiting" || (named && task !== null)}
              faded={quiet && state !== "waiting"}
              reduced={reduced}
            />
          </motion.span>
        );
      })}
    </div>
  );
}
