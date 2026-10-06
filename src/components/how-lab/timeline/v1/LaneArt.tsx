"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { AGENT, BG, FG, RULES, WARN, mix, seg } from "../shared/motion";
import { PANEL_H, PANEL_X, W, XB, XE, XS, nodeX, runnerAt, starts, total, type Status, type TrackTiming } from "./data";

/* One lane's drawing: a recessed groove, segments that light as the runner
 * passes, step nodes, the runner itself, and the lane's ending - a rail that
 * cracks with sparks (rules) or a finish flag that flares (agent). */

const STATUS_COLOR: Record<Status, string> = { ok: FG, warn: WARN, error: RULES };
const SPARKS = [-150, -110, -70, -30, 20, 60];

type Props = { kind: "rules" | "agent"; timing: TrackTiming; top: number; rail: number; t: MotionValue<number> };

function Segment({ i, timing, end, rail, t, color }: { i: number; timing: TrackTiming; end: number; rail: number; t: MotionValue<number>; color: string }) {
  const n = timing.ms.length;
  const from = i === 0 ? XS : nodeX(i - 1, n, end);
  const s = starts(timing)[i];
  const scaleX = useTransform(t, (v) => seg(v, s, s + timing.ms[i]));
  const lit = useTransform(t, (v) => (v >= s + timing.ms[i] ? 1 : 0.25));
  const x = nodeX(i, n, end);
  return (
    <g>
      <motion.rect x={from} y={rail - 3} width={x - from} height={6} rx={3} fill={color} style={{ scaleX, originX: 0 }} />
      {x !== end && (
        <>
          <circle cx={x} cy={rail} r={10} fill={BG} stroke={mix(color, 45)} strokeWidth={2} />
          <motion.circle cx={x} cy={rail} r={5} fill={color} style={{ opacity: lit }} />
        </>
      )}
    </g>
  );
}

/** One spark flying out of the break: its two ends travel outward as the burst runs. */
function Spark({ angle, rail, burst }: { angle: number; rail: number; burst: MotionValue<number> }) {
  const cx = XB + 14;
  const [dx, dy] = [Math.cos((angle * Math.PI) / 180), Math.sin((angle * Math.PI) / 180)];
  const x1 = useTransform(burst, (b) => cx + dx * (12 + 14 * b));
  const y1 = useTransform(burst, (b) => rail + dy * (12 + 14 * b));
  const x2 = useTransform(burst, (b) => cx + dx * (18 + 30 * b));
  const y2 = useTransform(burst, (b) => rail + dy * (18 + 30 * b));
  const opacity = useTransform(burst, (b) => (b > 0 && b < 1 ? 1 - b : 0));
  return <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={WARN} strokeWidth={2.5} strokeLinecap="round" style={{ opacity }} />;
}

export default function LaneArt({ kind, timing, top, rail, t }: Props) {
  const rules = kind === "rules";
  const color = rules ? RULES : AGENT;
  const end = rules ? XB : XE;
  const done = total(timing);
  const rx = useTransform(t, (v) => {
    const { x } = runnerAt(timing, end, Math.max(0, v));
    if (!rules || v < done) return x;
    const k = Math.max(0, 1 - (v - done) / 420);
    return x - 12 + Math.sin((v - done) / 18) * 5 * k;
  });
  const broke = useTransform(t, (v) => seg(v, done, done + 160));
  const burst = useTransform(t, (v) => seg(v, done, done + 560));
  const fade = useTransform(burst, (b) => (b > 0 && b < 1 ? 1 - b : 0));
  const ringR = useTransform(burst, (b) => 10 + b * 46);

  return (
    <g>
      <rect x={PANEL_X} y={top} width={W - PANEL_X - 6} height={PANEL_H} rx={22} fill={mix(color, 5)} stroke={mix(color, 24)} strokeWidth={1.5} />
      <rect x={PANEL_X + 22} y={top + 1} width={W - PANEL_X - 50} height={1.5} fill="url(#tl1-sheen)" />
      {/* the groove; past the break the rules rail is a dashed ghost that never gets used */}
      <rect x={XS} y={rail - 6} width={end - XS} height={12} rx={6} fill={mix(FG, 7)} stroke={mix(FG, 10)} />
      {rules && <line x1={XB + 34} y1={rail} x2={XE} y2={rail} stroke={mix(FG, 16)} strokeWidth={4} strokeDasharray="3 12" strokeLinecap="round" />}
      {timing.status.map((st, i) => (
        <Segment key={i} i={i} timing={timing} end={end} rail={rail} t={t} color={rules ? STATUS_COLOR[st] : AGENT} />
      ))}
      <circle cx={XS} cy={rail} r={8} fill={BG} stroke={mix(FG, 40)} strokeWidth={2} />

      {/* the ending */}
      {rules ? (
        <g>
          <g opacity={0.22} stroke={FG} strokeWidth={3}>
            <line x1={XE} y1={rail - 46} x2={XE} y2={rail + 16} />
          </g>
          <motion.path
            d={`M ${XB - 4} ${rail - 16} L ${XB + 8} ${rail - 6} L ${XB - 2} ${rail} L ${XB + 12} ${rail + 7} L ${XB + 2} ${rail + 18} M ${XB + 20} ${rail - 14} L ${XB + 30} ${rail - 3} L ${XB + 22} ${rail + 4} L ${XB + 34} ${rail + 16}`}
            fill="none"
            stroke={RULES}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: broke }}
          />
          {SPARKS.map((a) => (
            <Spark key={a} angle={a} rail={rail} burst={burst} />
          ))}
        </g>
      ) : (
        <g>
          <motion.circle cx={XE} cy={rail} r={ringR} fill="none" stroke={AGENT} strokeWidth={2} style={{ opacity: fade }} />
          <line x1={XE} y1={rail - 54} x2={XE} y2={rail + 16} stroke={FG} strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
          <rect x={XE + 1.5} y={rail - 54} width={36} height={24} fill="url(#tl1-check)" stroke={mix(FG, 50)} strokeWidth={1} />
          <motion.circle cx={XE} cy={rail} r={11} fill={AGENT} style={{ opacity: broke }} />
        </g>
      )}

      {/* the runner */}
      <motion.g style={{ x: rx }}>
        <circle cx={0} cy={rail} r={20} fill={color} opacity={0.18} filter="url(#tl1-blur)" />
        <circle cx={0} cy={rail} r={9} fill={color} stroke={BG} strokeWidth={2.5} />
        <circle cx={-2.5} cy={rail - 2.5} r={2.6} fill={BG} opacity={0.7} />
      </motion.g>
    </g>
  );
}
