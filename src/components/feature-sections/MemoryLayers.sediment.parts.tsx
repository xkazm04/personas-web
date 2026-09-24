"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Play } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import {
  CARD_H,
  CARD_W,
  CARD_X,
  CATCH,
  COL_RIGHT,
  COL_X,
  FINAL_TOPS,
  INNER_W,
  INNER_X,
  LABEL_X,
  POP,
  RECALLED,
  RISE,
  RUN_CARDS,
  RUN_START,
  STRATA,
  TOP_BAND_Y,
  grainFlight,
  growthStops,
  interp,
  scatter,
} from "./MemoryLayers.sediment.model";

type P = MotionValue<number>;

/** Labels scale up on phones, where the whole picture shrinks. */
const LABEL = "text-[16px] max-sm:text-[21px]";

/** One category stratum: grows with each run, riding on the strata below it. */
export function Stratum({ i, progress }: { i: number; progress: P }) {
  const s = STRATA[i];
  const stops = growthStops(i);
  const scaleY = useTransform(progress, stops.t, stops.v);
  const y = useTransform(progress, (p) =>
    STRATA.slice(0, i).reduce((m, x, j) => m + x.h * (1 - interp(p, growthStops(j))), 0),
  );
  return (
    <motion.g style={{ y }}>
      <motion.g style={{ scaleY, originY: 1, transformBox: "fill-box" }}>
        <rect x={INNER_X} y={FINAL_TOPS[i]} width={INNER_W} height={s.h} fill={tint(s.brand, 34)} />
        {scatter(17 + i * 31, 14).map((g, k) => (
          <circle
            key={k}
            cx={INNER_X + 6 + g.x * (INNER_W - 12)}
            cy={FINAL_TOPS[i] + 5 + g.y * (s.h - 10)}
            r={g.r}
            fill={BRAND_VAR[s.brand]}
            opacity={0.75}
          />
        ))}
        <rect x={INNER_X} y={FINAL_TOPS[i]} width={INNER_W} height={2} fill={BRAND_VAR[s.brand]} />
      </motion.g>
    </motion.g>
  );
}

/** A grain in flight; mounted only while the animation plays. */
export function FallingGrain({ run, j, progress }: { run: number; j: number; progress: P }) {
  const f = grainFlight(run, j);
  const x = useTransform(progress, f.t, f.x);
  const y = useTransform(progress, f.t, f.y);
  const end = f.t[f.t.length - 1];
  const opacity = useTransform(progress, [f.t[0] - 0.001, f.t[0], end, end + 0.03], [0, 1, 1, 0]);
  return <motion.circle r={3.4} fill={BRAND_VAR[f.brand]} style={{ x, y, opacity }} />;
}

/** The important grain of stratum i: pops, glows, rises to the recall band. */
export function RecalledGrain({ i, progress, filterId }: { i: number; progress: P; filterId: string }) {
  const g = RECALLED[i];
  const d = i * 0.008;
  const scale = useTransform(progress, [POP[0] + d, POP[1] + d], [0, 1]);
  const x = useTransform(progress, [RISE[0] + d, RISE[1]], [g.fromX - g.toX, 0]);
  const y = useTransform(progress, [RISE[0] + d, RISE[1]], [g.fromY - TOP_BAND_Y, 0]);
  return (
    <motion.g style={{ x, y }}>
      <motion.g style={{ scale, originX: 0.5, originY: 0.5, transformBox: "fill-box" }}>
        <circle cx={g.toX} cy={TOP_BAND_Y} r={12} fill={BRAND_VAR[g.brand]} opacity={0.6} filter={`url(#${filterId})`} />
        <circle cx={g.toX} cy={TOP_BAND_Y} r={6.5} fill={BRAND_VAR[g.brand]} />
        <circle cx={g.toX - 2} cy={TOP_BAND_Y - 2} r={1.8} fill="white" opacity={0.85} />
      </motion.g>
    </motion.g>
  );
}

/** A run: dim until its beat, then lit for good. Its dots are what it deposits. */
export function RunCard({ k, progress }: { k: number; progress: P }) {
  const cy = RUN_CARDS[k];
  const opacity = useTransform(progress, [RUN_START[k], RUN_START[k] + 0.04], [0.32, 1]);
  const ring = useTransform(progress, [RUN_START[k], RUN_START[k] + 0.04, RUN_START[k] + 0.2], [0, 1, 0.35]);
  return (
    <motion.g style={{ opacity }}>
      <rect x={CARD_X} y={cy - CARD_H / 2} width={CARD_W} height={CARD_H} rx={12} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.2} />
      <motion.rect
        x={CARD_X - 3}
        y={cy - CARD_H / 2 - 3}
        width={CARD_W + 6}
        height={CARD_H + 6}
        rx={15}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.55}
        strokeWidth={1.5}
        style={{ opacity: ring }}
      />
      <Play x={CARD_X + 12} y={cy - 9} width={18} height={18} strokeWidth={2} />
      {STRATA.map((s, i) => (
        <circle key={s.key} cx={CARD_X + 50 + i * 14} cy={cy} r={4} fill={BRAND_VAR[s.brand]} />
      ))}
    </motion.g>
  );
}

/** Corner brackets at the column's top edge that close on the recalled grains. */
export function RecallBracket({ progress }: { progress: P }) {
  const opacity = useTransform(progress, [CATCH[0], CATCH[1]], [0.3, 1]);
  const left = useTransform(progress, [CATCH[0], CATCH[1]], [-10, 0]);
  const right = useTransform(progress, [CATCH[0], CATCH[1]], [10, 0]);
  const stroke = { fill: "none", stroke: BRAND_VAR.emerald, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const y0 = TOP_BAND_Y - 22;
  const y1 = TOP_BAND_Y + 22;
  return (
    <motion.g aria-hidden style={{ opacity }}>
      <motion.path d={`M ${COL_X + 22} ${y0} H ${COL_X + 12} V ${y1} H ${COL_X + 22}`} strokeWidth={3} {...stroke} style={{ x: left }} />
      <motion.path d={`M ${COL_RIGHT - 22} ${y0} H ${COL_RIGHT - 12} V ${y1} H ${COL_RIGHT - 22}`} strokeWidth={3} {...stroke} style={{ x: right }} />
      <path
        d={`M ${COL_RIGHT + 4} ${TOP_BAND_Y} H ${COL_RIGHT + 34} M ${COL_RIGHT + 27} ${TOP_BAND_Y - 6} L ${COL_RIGHT + 34} ${TOP_BAND_Y} L ${COL_RIGHT + 27} ${TOP_BAND_Y + 6}`}
        strokeWidth={2.5}
        {...stroke}
      />
    </motion.g>
  );
}

/** The six words: Run, Recall, and one per stratum. */
export function Labels() {
  return (
    <>
      <text x={CARD_X + CARD_W / 2} y={RUN_CARDS[0] - CARD_H / 2 - 14} textAnchor="middle" className={LABEL} fontWeight={500} fill="currentColor" fillOpacity={0.85}>
        Run
      </text>
      <text x={LABEL_X} y={TOP_BAND_Y + 5.5} className={LABEL} fontWeight={600} fill={BRAND_VAR.emerald}>
        Recall
      </text>
      {STRATA.map((s, i) => {
        const cy = FINAL_TOPS[i] + s.h / 2;
        return (
          <g key={s.key}>
            <line aria-hidden x1={COL_RIGHT + 4} x2={COL_RIGHT + 26} y1={cy} y2={cy} stroke={BRAND_VAR[s.brand]} strokeOpacity={0.6} strokeWidth={1.5} />
            <circle aria-hidden cx={COL_RIGHT + 34} cy={cy} r={4} fill={BRAND_VAR[s.brand]} />
            <text x={LABEL_X} y={cy + 5.5} className={LABEL} fontWeight={500} fill="currentColor" fillOpacity={0.85}>
              {s.label}
            </text>
          </g>
        );
      })}
    </>
  );
}
