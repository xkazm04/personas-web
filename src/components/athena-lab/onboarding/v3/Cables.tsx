"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { ROUNDS, cardAt, socket, tile } from "./script";

/**
 * The wire from a tool in your tray to the slot she dropped it into: it
 * appears with the handshake and stays while that card is on the board, so
 * the board shows WHERE each agent's tools come from. Drawn in the art box's
 * percent space (non-scaling stroke keeps one weight at every size); fades,
 * never draws, so the stretch of that space cannot skew a dash animation.
 */
export function Cables({ phase, reduced }: { phase: number; reduced: boolean }) {
  const card = cardAt(phase);
  if (card.round >= ROUNDS.length || card.launched) return null;
  const r = ROUNDS[card.round];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      {r.tools.map((ti, k) => {
        if (card.sockets[k] === "empty") return null;
        const a = tile(ti);
        const b = socket(k);
        const x0 = a.x + a.w;
        const y0 = a.y + a.h / 2;
        const x1 = b.x;
        const y1 = b.y + b.h / 2;
        const mx = (x0 + x1) / 2;
        const d = `M${x0} ${y0} C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
        const on = card.sockets[k] === "connected";
        return (
          <motion.path
            key={`${card.round}-${k}`}
            d={d}
            fill="none"
            stroke={tint(on ? "emerald" : "cyan", on ? 55 : 45)}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${tint("cyan", 40)})`, transition: reduced ? undefined : "stroke 500ms" }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.5 }}
          />
        );
      })}
    </svg>
  );
}
