"use client";

import { motion } from "framer-motion";
import { DIM_BY_KEY } from "./shared/dims";
import type { Machine } from "./shared/machine";
import { GATE, gateWindow, MAST, PIPE_Y, RUN_MS, runPoints, TANK } from "./geometry";

const S = RUN_MS / 1000;

/**
 * The finale: the machine the visitor's answers built is test-run end to end.
 * Each email leaves the schedule (or the webhook), passes through the agent
 * (memory fills a little), waits at the review gate while it opens - only if
 * the machine has a gate and the email needs it - becomes the message and
 * leaves as an event from the mast. With 'Ask only for urgent' a routine email
 * passes straight through and an urgent one waits.
 *
 * Always mounted, so the DOM shape never depends on reduced motion: `shown`
 * (the sheet is finished) and `running` (the finale is playing) gate only the
 * animate props. Not running, it rests on the end pose: gate shut, tank
 * filled, no token.
 */
export default function TestRun({
  machine,
  shown,
  running,
  run,
  labels,
}: {
  machine: Machine;
  shown: boolean;
  running: boolean;
  run: number;
  labels: { routine: string; urgent: string };
}) {
  const memory = DIM_BY_KEY.memory.ink;
  const review = DIM_BY_KEY.review.ink;
  const events = DIM_BY_KEY.events.ink;
  const door = { x: (GATE.a + GATE.b) / 2 - 3, y: PIPE_Y - 22, w: 6, h: 44 };
  const tracks = runPoints(machine);
  const gate = gateWindow(tracks);
  const doorOn = shown && machine.gate !== "none" ? 1 : 0;
  const end = Math.max(...tracks.map((tr) => tr.t[tr.t.length - 2]));
  return (
    <g key={run}>
      {/* the review gate's door */}
      <motion.rect
        x={door.x}
        width={door.w}
        height={door.h}
        rx={3}
        fill={review}
        initial={false}
        animate={
          running && gate
            ? { y: [door.y, door.y, door.y - 30, door.y - 30, door.y], opacity: [1, 1, 0.5, 0.5, 1] }
            : { y: door.y, opacity: doorOn }
        }
        transition={
          running && gate
            ? { duration: S, times: [0, gate.hold, gate.hold + 0.06, gate.open + 0.08, gate.open + 0.16] }
            : { duration: running ? 0.4 : 0 }
        }
      />
      {/* memory fills a little as the email is handled */}
      <motion.rect
        x={TANK.cx - TANK.rx + 3}
        width={TANK.rx * 2 - 6}
        fill={memory}
        initial={false}
        animate={
          running
            ? { y: [TANK.top + TANK.h, TANK.top + TANK.h - 12, TANK.top + TANK.h - 22], height: [0, 12, 22], opacity: 0.35 }
            : { y: TANK.top + TANK.h - 22, height: 22, opacity: shown ? 0.3 : 0 }
        }
        transition={running ? { duration: 1.2, delay: tracks[0].t[1] * S } : { duration: 0 }}
      />
      {tracks.map((tr) => {
        const move = { duration: S, times: tr.t, ease: "easeInOut" } as const;
        const label = tr.kind === "routine" ? labels.routine : tr.kind === "urgent" ? labels.urgent : null;
        return (
          <g key={tr.kind}>
            <motion.circle
              r={9}
              fill="var(--brand-cyan)"
              style={{ filter: "drop-shadow(0 0 6px var(--brand-cyan))" }}
              initial={{ cx: tr.x[0], cy: tr.y[0], opacity: 0 }}
              animate={running ? { cx: tr.x, cy: tr.y, opacity: tr.opacity } : { opacity: 0 }}
              transition={running ? move : { duration: 0 }}
            />
            <motion.path
              d="M-6 -4 H6 V4 H-6 Z M-6 -4 L0 1 L6 -4"
              fill="none"
              stroke="var(--background)"
              strokeWidth={1.6}
              initial={{ x: tr.x[0], y: tr.y[0], opacity: 0 }}
              animate={running ? { x: tr.x, y: tr.y, opacity: tr.opacity } : { opacity: 0 }}
              transition={running ? move : { duration: 0 }}
            />
            {label && (
              <motion.text
                textAnchor="middle"
                fontSize={12}
                fontFamily="var(--font-geist-mono)"
                fill="color-mix(in srgb, var(--foreground) 80%, transparent)"
                initial={{ x: tr.x[0], y: tr.y[0] - 16, opacity: 0 }}
                animate={running ? { x: tr.x, y: tr.y.map((y) => y - 16), opacity: tr.opacity } : { opacity: 0 }}
                transition={running ? move : { duration: 0 }}
              >
                {label}
              </motion.text>
            )}
          </g>
        );
      })}
      {[0, 0.35].map((delay) => (
        <motion.circle
          key={delay}
          cx={MAST.x}
          cy={MAST.top}
          fill="none"
          stroke={events}
          strokeWidth={2}
          initial={{ r: 4, opacity: 0 }}
          animate={running ? { r: 46, opacity: [0, 0.9, 0] } : { r: 4, opacity: 0 }}
          transition={running ? { duration: 1.1, delay: S * (end + 0.05) + delay, ease: "easeOut" } : { duration: 0 }}
        />
      ))}
    </g>
  );
}
