"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CARD_ORDER, ROWS, type PhraseKey, type SceneState } from "./data";
import type { Box, Geo } from "./geometry";

/**
 * The lines between the two sides, drawn in one SVG layer whose viewBox IS the
 * art's design space (the box is aspect-locked, so nothing stretches):
 *
 *   keep     a detail lifts out of your message and arcs into the column -
 *            a spark rides the arc and the trace fades once it lands.
 *   recall   month two: a spark from EVERY card into the last reply, and the
 *            traces stay, quietly, for the rest of the loop.
 */

type Pt = { x: number; y: number };

function curve(a: Pt, b: Pt): [Pt, Pt, Pt, Pt] {
  const dx = b.x - a.x;
  return [a, { x: a.x + dx * 0.3, y: Math.max(6, a.y - 70) }, { x: b.x - dx * 0.35, y: b.y }, b];
}

const d = ([a, b, c, e]: [Pt, Pt, Pt, Pt]) => `M ${a.x} ${a.y} C ${b.x} ${b.y} ${c.x} ${c.y} ${e.x} ${e.y}`;

/** Pure cubic Bezier samples, so a spark can ride the curve as keyframes. */
function samples([a, b, c, e]: [Pt, Pt, Pt, Pt], n = 14) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    xs.push(u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * e.x);
    ys.push(u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * e.y);
  }
  return { xs, ys };
}

const mid = (b: Box): Pt => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

function pillOf(geo: Geo, row: number, k: PhraseKey) {
  return geo.rows[row].pills.find((p) => p.key === k)!;
}

function Spark({ path, delay, reduced }: { path: [Pt, Pt, Pt, Pt]; delay: number; reduced: boolean }) {
  if (reduced) return null;
  const { xs, ys } = samples(path);
  return (
    <motion.circle
      r={5}
      fill={BRAND_VAR.cyan}
      style={{ filter: `drop-shadow(0 0 6px ${tint("cyan", 80)})` }}
      initial={{ cx: xs[0], cy: ys[0], opacity: 0 }}
      animate={{ cx: xs, cy: ys, opacity: [0, 1, 1, 1, 0] }}
      transition={{ duration: 0.85, delay, ease: "easeInOut" }}
    />
  );
}

export default function Flights({ geo, scene, compact, reduced }: { geo: Geo; scene: SceneState; compact: boolean; reduced: boolean }) {
  const cardEnd = (b: Box): Pt => (compact ? { x: b.x + b.w * 0.2, y: b.y } : { x: b.x, y: b.y + b.h / 2 });
  const reply = geo.rows[2].reply;
  const into: Pt = compact ? mid(reply) : { x: reply.x + reply.w, y: reply.y + reply.h / 2 };

  return (
    <svg viewBox={`0 0 ${geo.W} ${geo.H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none" aria-hidden="true">
      {/* Lifting out of your message, into the column. */}
      {ROWS.map((row, r) =>
        row.keeps.map((k, i) => {
          const path = curve({ x: pillOf(geo, r, k).x + pillOf(geo, r, k).w / 2, y: pillOf(geo, r, k).y }, cardEnd(geo.cards[k]));
          const live = scene.flying.includes(k);
          return (
            <g key={k}>
              <motion.path
                d={d(path)}
                stroke={tint("cyan", 60)}
                strokeWidth={2}
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: live ? 1 : 0, opacity: live ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { pathLength: { duration: 0.8, delay: i * 0.18 }, opacity: { duration: live ? 0.2 : 0.8 } }}
              />
              {live && <Spark path={path} delay={i * 0.18} reduced={reduced} />}
            </g>
          );
        }),
      )}

      {/* Month two: everything she carries, into the reply. */}
      {CARD_ORDER.map((k, i) => {
        const path = curve(cardEnd(geo.cards[k]), into);
        return (
          <g key={k}>
            <motion.path
              d={d(path)}
              stroke={tint("cyan", scene.recall === 1 ? 70 : 26)}
              strokeWidth={scene.recall === 1 ? 2 : 1.4}
              strokeLinecap="round"
              className="duration-700 transition-[stroke,stroke-width]"
              initial={false}
              animate={{ pathLength: scene.recall > 0 ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : { duration: scene.recall > 0 ? 0.8 : 0.3, delay: scene.recall === 1 ? i * 0.12 : 0 }}
            />
            {scene.recall === 1 && <Spark path={path} delay={i * 0.12} reduced={reduced} />}
          </g>
        );
      })}
    </svg>
  );
}
