"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { cableSamples, deskIn, hubIn, hubOut, socketIn } from "./iso";

/**
 * Work flowing once the floor is started: a bright packet leaves a plugged
 * tool, runs its cable into the hub, and out along a desk's cable to the
 * agent that uses it. Positions are sampled from the same Bezier the cables
 * are drawn with, so a packet never leaves its wire.
 *
 * An ambient loop: it runs only while `live` (in view, tab in front, motion
 * allowed); otherwise each packet rests mid-route, so the still frame still
 * says "work is moving through here".
 */

/** Which socket feeds which desk (Slack → digest, Gmail → inbox, GitHub → PRs). */
const ROUTES = [0, 1, 2] as const;

export function Packets({ plugged, live, reduced }: { plugged: boolean[]; live: boolean; reduced: boolean }) {
  return (
    <g>
      {ROUTES.map((socket, desk) => {
        if (!plugged[socket]) return null;
        const a = cableSamples(socketIn(socket), hubIn(socket), 10);
        const b = cableSamples(hubOut(desk), deskIn(desk), 10);
        const xs = [...a.x, ...b.x];
        const ys = [...a.y, ...b.y];
        const mid = Math.floor(xs.length * (0.3 + desk * 0.2));
        const moving = live && !reduced;
        return (
          <motion.circle
            key={desk}
            r={5}
            fill={BRAND_VAR.cyan}
            style={{ filter: `drop-shadow(0 0 6px ${tint("cyan", 80)})` }}
            initial={false}
            animate={moving ? { cx: xs, cy: ys, opacity: [0, 1, 1, 1, 0] } : { cx: xs[mid], cy: ys[mid], opacity: 1 }}
            transition={
              moving
                ? { duration: 2.6, repeat: Infinity, delay: desk * 0.8, ease: "linear", repeatDelay: 0.4 }
                : { duration: 0 }
            }
          />
        );
      })}
    </g>
  );
}
