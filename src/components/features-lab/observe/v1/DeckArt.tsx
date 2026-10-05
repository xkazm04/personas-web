"use client";

import { memo } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { beat } from "../shared/motion";
import { AGENTS, AXIS_Y, BAR_H, CHROME_H, DECK, FOOT_Y, H, LANE, LAP_LEN, METRICS, SPANS, TRACK, TYPE_META, W, latest, laneY, type Span } from "./data";

/* The drawn layer of V1: the lit glass deck, its time grid, the lanes of span
 * bars drifting left from the "now" seam, and the light the seam throws. */

const FG = "var(--foreground)";
const EM = BRAND_VAR.emerald;
const STEP = (TRACK.x1 - TRACK.x0) / 3; // 5 s

const SpanBar = memo(function SpanBar({ s, x, dim, lit, text }: { s: Span; x: number; dim: boolean; lit: boolean; text: boolean }) {
  const meta = TYPE_META[s.type];
  const c = BRAND_VAR[meta.brand];
  const Icon = meta.icon;
  const y = laneY(s.lane) - BAR_H / 2;
  const w = Math.max(BAR_H, s.dur * LAP_LEN);
  const failed = s.type === "execution.failed";
  if (text) {
    if (s.cost <= 0 || w <= 74) return null;
    return (
      <text x={x + w - 8} y={y + BAR_H / 2 + 5} textAnchor="end" fontSize={14} fontFamily="var(--font-mono, monospace)" fill={FG} fillOpacity={dim ? 0.14 : 0.85}>
        ${s.cost.toFixed(2)}
      </text>
    );
  }
  return (
    <g style={{ opacity: dim ? 0.14 : 1, transition: "opacity 300ms" }}>
      <rect x={x} y={y} width={w} height={BAR_H} rx={8} fill={tint(meta.brand, lit ? 34 : 22)} stroke={c} strokeOpacity={lit ? 1 : 0.7} strokeWidth={lit ? 2 : 1.2} />
      {failed && <rect x={x} y={y} width={w} height={BAR_H} rx={8} fill="url(#ob1-hatch)" />}
      <Icon x={x + 7} y={y + 7} width={14} height={14} color={c} strokeWidth={2.4} />
    </g>
  );
});

function SeamFlash({ lane, lap }: { lane: number; lap: MotionValue<number> }) {
  const fresh = useTransform(lap, (l) => latest(lane, l).fresh);
  const r = useTransform(fresh, (f) => 6 + f * 12);
  const opacity = useTransform(fresh, (f) => f * 0.35);
  const c = BRAND_VAR[AGENTS[lane].brand];
  return (
    <g>
      <motion.circle cx={TRACK.x1} cy={laneY(lane)} r={r} fill={c} style={{ opacity }} />
      <circle cx={TRACK.x1} cy={laneY(lane)} r={4.5} fill={c} stroke="var(--background)" strokeWidth={2} />
    </g>
  );
}

export default function DeckArt({ lap, p, filter, label }: { lap: MotionValue<number>; p: MotionValue<number>; filter: string | null; label: string }) {
  const stripX = useTransform(lap, (l) => -l * LAP_LEN);
  const seamScale = useTransform(p, (v) => beat(v, 0.05, 0.3));
  const lanesOp = useTransform(p, (v) => beat(v, 0.2, 0.35));
  const top = LANE.y0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label} fill="none">
      <defs>
        <radialGradient id="ob1-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={EM} stopOpacity={0.16} />
          <stop offset="1" stopColor={EM} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="ob1-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={FG} stopOpacity={0.07} />
          <stop offset="0.3" stopColor={FG} stopOpacity={0.015} />
          <stop offset="1" stopColor={FG} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="ob1-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={FG} stopOpacity={0} />
          <stop offset="0.5" stopColor={FG} stopOpacity={0.35} />
          <stop offset="1" stopColor={FG} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="ob1-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={EM} stopOpacity={0} />
          <stop offset="1" stopColor={EM} stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="ob1-seam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={EM} stopOpacity={0} />
          <stop offset="0.15" stopColor={EM} stopOpacity={1} />
          <stop offset="0.85" stopColor={EM} stopOpacity={1} />
          <stop offset="1" stopColor={EM} stopOpacity={0} />
        </linearGradient>
        <pattern id="ob1-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={BRAND_VAR.rose} strokeOpacity={0.45} strokeWidth={2.5} />
        </pattern>
        <clipPath id="ob1-track">
          <rect x={TRACK.x0 - 4} y={top} width={TRACK.x1 - TRACK.x0 + 4} height={FOOT_Y - top} />
        </clipPath>
        <linearGradient id="ob1-fade-g" x1={TRACK.x0} x2={TRACK.x0 + 70} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity={0} />
          <stop offset="1" stopColor="white" stopOpacity={1} />
        </linearGradient>
        <mask id="ob1-fade" maskUnits="userSpaceOnUse" x={TRACK.x0 - 4} y={top} width={TRACK.x1 - TRACK.x0 + 8} height={FOOT_Y - top}>
          <rect x={TRACK.x0 - 4} y={top} width={TRACK.x1 - TRACK.x0 + 8} height={FOOT_Y - top} fill="url(#ob1-fade-g)" />
        </mask>
        {/* A cost label fades in once its span has cleared the seam, so no figure is ever cut. */}
        <linearGradient id="ob1-text-g" x1={TRACK.x0} x2={TRACK.x1} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity={0} />
          <stop offset={70 / (TRACK.x1 - TRACK.x0)} stopColor="white" stopOpacity={1} />
          <stop offset={1 - 190 / (TRACK.x1 - TRACK.x0)} stopColor="white" stopOpacity={1} />
          <stop offset={1 - 130 / (TRACK.x1 - TRACK.x0)} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <mask id="ob1-textfade" maskUnits="userSpaceOnUse" x={TRACK.x0 - 4} y={top} width={TRACK.x1 - TRACK.x0 + 8} height={FOOT_Y - top}>
          <rect x={TRACK.x0 - 4} y={top} width={TRACK.x1 - TRACK.x0 + 8} height={FOOT_Y - top} fill="url(#ob1-text-g)" />
        </mask>
      </defs>

      {/* Light and glass */}
      <ellipse cx={DECK.x + DECK.w / 2} cy={H * 0.62} rx={DECK.w * 0.62} ry={H * 0.5} fill="url(#ob1-glow)" />
      <rect x={DECK.x} y={DECK.y} width={DECK.w} height={DECK.h} rx={22} fill="var(--background)" fillOpacity={0.88} stroke={FG} strokeOpacity={0.13} />
      <rect x={DECK.x} y={DECK.y} width={DECK.w} height={DECK.h} rx={22} fill="url(#ob1-sheen)" />
      <line x1={DECK.x + 30} x2={DECK.x + DECK.w - 30} y1={DECK.y + 0.75} y2={DECK.y + 0.75} stroke="url(#ob1-edge)" strokeWidth={1.5} />
      <line x1={DECK.x} x2={DECK.x + DECK.w} y1={CHROME_H} y2={CHROME_H} stroke={FG} strokeOpacity={0.08} />
      <line x1={DECK.x} x2={DECK.x + DECK.w} y1={METRICS.y + METRICS.h} y2={METRICS.y + METRICS.h} stroke={FG} strokeOpacity={0.08} />
      {[1, 2, 3].map((i) => (
        <line key={i} x1={DECK.x + (DECK.w / 4) * i} x2={DECK.x + (DECK.w / 4) * i} y1={METRICS.y + 18} y2={METRICS.y + METRICS.h - 18} stroke={FG} strokeOpacity={0.08} />
      ))}
      <line x1={DECK.x} x2={DECK.x + DECK.w} y1={FOOT_Y} y2={FOOT_Y} stroke={FG} strokeOpacity={0.08} />

      {/* Lanes and the time grid */}
      <motion.g style={{ opacity: lanesOp }}>
        {AGENTS.map((a, i) => (
          <rect key={a.id} x={DECK.x + 1} y={LANE.y0 + i * LANE.h} width={DECK.w - 2} height={LANE.h} fill={FG} fillOpacity={i % 2 ? 0.022 : 0} />
        ))}
        {[1, 2, 3].map((k) => (
          <line key={k} x1={TRACK.x1 - k * STEP} x2={TRACK.x1 - k * STEP} y1={AXIS_Y + 12} y2={FOOT_Y - 8} stroke={FG} strokeOpacity={0.1} strokeDasharray="2 6" />
        ))}
        <rect x={TRACK.x1 - 150} y={top} width={150} height={FOOT_Y - top} fill="url(#ob1-light)" />
        {(["bars", "text"] as const).map((layer) => (
          <g key={layer} mask={layer === "text" ? "url(#ob1-textfade)" : "url(#ob1-fade)"} clipPath="url(#ob1-track)">
            <motion.g style={{ x: stripX }}>
              {SPANS.flat().map((s) => {
                const on = filter !== null && s.type.startsWith(filter);
                const dim = filter !== null && !on;
                return [0, -1].map((k) => (
                  <SpanBar key={`${s.key}:${k}`} s={s} x={TRACK.x1 + (s.at + k) * LAP_LEN} dim={dim} lit={on} text={layer === "text"} />
                ));
              })}
            </motion.g>
          </g>
        ))}
      </motion.g>

      {/* The now seam */}
      <motion.line
        x1={TRACK.x1}
        x2={TRACK.x1}
        y1={AXIS_Y + 6}
        y2={FOOT_Y - 4}
        stroke="url(#ob1-seam)"
        strokeWidth={2.5}
        style={{ scaleY: seamScale, transformBox: "fill-box", transformOrigin: "center" }}
      />
      <motion.g style={{ opacity: lanesOp }}>
        {AGENTS.map((a, i) => (
          <SeamFlash key={a.id} lane={i} lap={lap} />
        ))}
      </motion.g>
    </svg>
  );
}
