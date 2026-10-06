"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { GROUND } from "./geometry";

/**
 * What sits in the garden's own drawing: the moon and a few stars (after
 * hours - you are elsewhere) and the soil's strata. The sky, the soil and the
 * lit horizon themselves are painted by `Earth`, across the whole slot, so
 * the world runs edge to edge whatever shape the stage gives it. Every colour is a brand tint over the page
 * background, so the same scene reads as night in dark themes and as a pale
 * cut-away in light ones.
 */

const STARS = [
  [96, 40], [228, 118], [352, 54], [470, 150], [604, 36], [690, 120], [930, 48],
  [1012, 142], [1128, 70], [1246, 30], [1318, 132], [1430, 58], [1530, 154], [160, 210], [1390, 214],
] as const;

const STRATA = [
  { y: GROUND + 96, d: "M 0 416 C 260 404, 520 430, 800 418 S 1340 404, 1600 420" },
  { y: GROUND + 210, d: "M 0 530 C 300 516, 560 544, 860 530 S 1360 518, 1600 534" },
  { y: GROUND + 330, d: "M 0 650 C 240 638, 600 664, 900 648 S 1380 640, 1600 654" },
] as const;

export default function Backdrop({ uid, live }: { uid: string; live: boolean }) {
  return (
    <g aria-hidden="true">
      <defs>
        <mask id={`${uid}-moon`}>
          <circle r="26" fill="white" />
          <circle r="24" cx="11" cy="-7" fill="black" />
        </mask>
      </defs>


      {STRATA.map((s) => (
        <path key={s.y} d={s.d} fill="none" stroke={tint("cyan", 10)} strokeWidth={1.5} strokeDasharray="2 8" />
      ))}

      {/* Moon - a crescent cut from two discs */}
      <g transform="translate(1340 78)">
        <circle r="40" fill={tint("cyan", 6)} />
        <circle r="26" fill={tint("cyan", 55)} mask={`url(#${uid}-moon)`} />
      </g>

      {STARS.map(([x, y], i) => (
        <motion.circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 2 : 1.4}
          fill={tint("cyan", 70)}
          initial={false}
          animate={live ? { opacity: [0.25, 0.9, 0.25] } : { opacity: 0.55 }}
          transition={live ? { duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.37 } : { duration: 0 }}
        />
      ))}
    </g>
  );
}
