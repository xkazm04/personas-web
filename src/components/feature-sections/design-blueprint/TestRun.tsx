"use client";

import { motion } from "framer-motion";
import { DIM_BY_KEY } from "./shared/dims";
import { GATE, MAST, PIPE_Y, RUN_MS, RUN_T, RUN_X, RUN_Y, TANK } from "./geometry";

const S = RUN_MS / 1000;
const at = (i: number) => RUN_T[i] * S;

/**
 * The finale: one email runs the finished machine end to end. It leaves the
 * schedule, passes through the agent (memory fills a little), waits at the
 * review gate while it opens, becomes the message and leaves as an event
 * from the mast. One-shot; reduced motion shows the gate shut and no token.
 */
export default function TestRun({ running, run }: { running: boolean; run: number }) {
  const memory = DIM_BY_KEY.memory.ink;
  const review = DIM_BY_KEY.review.ink;
  const events = DIM_BY_KEY.events.ink;
  const door = { x: (GATE.a + GATE.b) / 2 - 3, y: PIPE_Y - 22, w: 6, h: 44 };
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
        animate={running ? { y: [door.y, door.y, door.y - 30, door.y - 30, door.y], opacity: [1, 1, 0.5, 0.5, 1] } : { y: door.y, opacity: 1 }}
        transition={running ? { duration: S, times: [0, RUN_T[2], RUN_T[2] + 0.06, RUN_T[3] + 0.04, RUN_T[3] + 0.12] } : { duration: 0 }}
      />
      {/* memory fills a little as the email is handled */}
      <motion.rect
        x={TANK.cx - TANK.rx + 3}
        width={TANK.rx * 2 - 6}
        fill={memory}
        initial={false}
        animate={running ? { y: [TANK.top + TANK.h, TANK.top + TANK.h - 12, TANK.top + TANK.h - 22], height: [0, 12, 22], opacity: 0.35 } : { y: TANK.top + TANK.h - 22, height: 22, opacity: 0.3 }}
        transition={running ? { duration: 1.2, delay: at(1) } : { duration: 0 }}
      />
      {running && (
        <>
          <motion.circle
            r={9}
            fill="var(--brand-cyan)"
            style={{ filter: "drop-shadow(0 0 6px var(--brand-cyan))" }}
            initial={{ cx: RUN_X[0], cy: RUN_Y[0], opacity: 0 }}
            animate={{ cx: RUN_X, cy: RUN_Y, opacity: [0, 1, 1, 1, 1, 1, 0] }}
            transition={{ duration: S, times: RUN_T, ease: "easeInOut" }}
          />
          <motion.path
            d="M-6 -4 H6 V4 H-6 Z M-6 -4 L0 1 L6 -4"
            fill="none"
            stroke="var(--background)"
            strokeWidth={1.6}
            initial={{ x: RUN_X[0], y: RUN_Y[0], opacity: 0 }}
            animate={{ x: RUN_X, y: RUN_Y, opacity: [0, 1, 1, 1, 1, 1, 0] }}
            transition={{ duration: S, times: RUN_T, ease: "easeInOut" }}
          />
          {[0, 0.35].map((delay) => (
            <motion.circle
              key={delay}
              cx={MAST.x}
              cy={MAST.top}
              fill="none"
              stroke={events}
              strokeWidth={2}
              initial={{ r: 4, opacity: 0 }}
              animate={{ r: 46, opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.1, delay: S * 0.95 + delay, ease: "easeOut" }}
            />
          ))}
        </>
      )}
    </g>
  );
}
