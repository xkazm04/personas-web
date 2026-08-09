"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { NOTIFICATIONS } from "./data";
import { CARD, SPOTS, T, cardCenter, flightDelta, trailPath, originAt } from "./geometry";

/*
 * The chaos→calm mechanics (kept from the round-1 winner): seven
 * interruption cards spring in over the work with slight rotation, hold,
 * then lift off and stream along thin traced arcs into the calm glow.
 *
 * Two nested motion groups per card, both self-driving whileInView with
 * REPLAY (once:false) so the whole sequence replays on re-entry:
 *   outer — springy chaos entrance (rotation → messy settled tilt),
 *   inner — the delayed flight: lift, arc toward the glow, shrink, fade.
 * Under reduced motion both gates drop and the card renders its end-state
 * (already held: opacity 0) — elements are never unmounted.
 */

export function NotificationFlights({ reduced }: { reduced: boolean }) {
  return (
    <g>
      {/* Traced flight arcs, under the cards */}
      {NOTIFICATIONS.map((n, i) => (
        <motion.path
          key={n.title}
          d={trailPath(i)}
          fill="none"
          stroke={tint(n.tone, 45)}
          strokeWidth="1.2"
          opacity={reduced ? 0 : undefined}
          {...(reduced
            ? {}
            : {
                initial: { pathLength: 0, opacity: 0 },
                whileInView: { pathLength: [0, 1, 1], opacity: [0, 0.55, 0] },
                viewport: REPLAY,
                transition: { delay: T.flight(i), duration: 1.05, ease: "easeOut" },
              })}
        />
      ))}

      {NOTIFICATIONS.map((n, i) => {
        const s = SPOTS[i];
        const { cx, cy } = cardCenter(i);
        const { dx, dy } = flightDelta(i);
        return (
          <motion.g
            key={n.title}
            opacity={reduced ? 0 : undefined}
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.55, rotate: s.rot },
                  whileInView: { opacity: 1, scale: 1, rotate: s.settle },
                  viewport: REPLAY,
                  transition: { ...SPRING_POP, delay: T.pop(i) },
                })}
            style={originAt(cx, cy)}
          >
            <motion.g
              {...(reduced
                ? {}
                : {
                    initial: { x: 0, y: 0, scale: 1, opacity: 1 },
                    whileInView: {
                      x: [0, dx * 0.3, dx],
                      y: [0, -26, dy],
                      scale: [1, 1.04, 0.2],
                      opacity: [1, 1, 0],
                    },
                    viewport: REPLAY,
                    transition: {
                      delay: T.flight(i),
                      duration: 0.95,
                      times: [0, 0.3, 1],
                      ease: "easeIn",
                    },
                  })}
              style={originAt(cx, cy)}
            >
              <rect
                x={s.x} y={s.y} width={CARD.w} height={CARD.h} rx={CARD.r}
                fill={tint(n.tone, 12)} stroke={tint(n.tone, 45)}
              />
              {/* Badge dot — the nag */}
              <circle cx={s.x + CARD.w - 14} cy={s.y + 14} r={5} fill={tint(n.tone, 80)} />
              <text
                x={s.x + 16} y={s.y + 25} fontSize={15} fontWeight={600}
                className="fill-current text-foreground"
              >
                {n.title}
              </text>
              <text
                x={s.x + 16} y={s.y + 44} fontSize={12.5}
                className="fill-current text-muted-dark"
              >
                {n.sub}
              </text>
            </motion.g>
          </motion.g>
        );
      })}
    </g>
  );
}
