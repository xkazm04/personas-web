"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Bot } from "lucide-react";
import { tint } from "@/lib/brand-theme";
import {
  CAT_OF,
  HUB,
  POS,
  RECALL,
  RECALL_STEP,
  RUN_LEN,
  color,
  recallAt,
  toRim,
  type MapNode,
} from "./MemoryLayers.constellation.data";

type P = MotionValue<number>;

/* A link between two memories; same-category links are solid, cross-category dashed. */
export function Link({ a, b, p, from }: { a: string; b: string; p: P; from?: number }) {
  const A = POS[a];
  const B = POS[b];
  const same = CAT_OF[a] === CAT_OF[b];
  const seed = from === undefined;
  const o = useTransform(p, seed ? [0, 1] : [from, from + RUN_LEN * 0.4], seed ? [1, 1] : [0, 1]);
  return (
    <motion.line
      x1={A.x}
      y1={A.y}
      x2={B.x}
      y2={B.y}
      stroke={same ? color(CAT_OF[a]) : "currentColor"}
      strokeOpacity={same ? 0.5 : 0.4}
      strokeWidth={same ? 1.4 : 1.3}
      strokeDasharray={same ? undefined : "4 5"}
      style={{ opacity: o }}
    />
  );
}

/* A memory node; run nodes pop in with a ring that settles to a faint "new" mark. */
export function Dot({ n, p, from }: { n: MapNode; p: P; from?: number }) {
  const seed = from === undefined;
  const grow = useTransform(p, seed ? [0, 1] : [from, from + 0.05], seed ? [1, 1] : [0, 1]);
  const ring = useTransform(p, seed ? [0, 1] : [from, from + 0.04, from + RUN_LEN * 0.9], seed ? [0, 0] : [0, 0.9, 0.4]);
  return (
    <g transform={`translate(${n.x} ${n.y})`}>
      {!seed && <motion.circle r={n.r + 7} fill="none" stroke={color(n.cat)} strokeWidth={1.2} style={{ opacity: ring }} />}
      <motion.circle r={n.r} fill={color(n.cat)} style={{ scale: grow, opacity: grow }} />
    </g>
  );
}

/* The run itself: a spark leaves the agent and lands where the new memory appears. */
export function Spark({ target, p, from }: { target: MapNode; p: P; from: number }) {
  const t = [from, from + RUN_LEN * 0.35];
  const x = useTransform(p, t, [HUB.x, target.x]);
  const y = useTransform(p, t, [HUB.y, target.y]);
  const opacity = useTransform(p, [from, from + 0.01, t[1] - 0.01, t[1]], [0, 1, 1, 0]);
  return <motion.circle r={4.5} fill={color(target.cat)} style={{ x, y, opacity }} />;
}

export function RecallSegment({ i, p }: { i: number; p: P }) {
  const a = POS[RECALL[i]];
  const b = RECALL[i + 1] === "HUB" ? toRim(a) : POS[RECALL[i + 1]];
  const s = recallAt(i);
  const o = useTransform(p, [s, s + RECALL_STEP * 0.8], [0, 1]);
  return (
    <motion.line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      style={{ opacity: o }}
    />
  );
}

export function RecallHalo({ i, p }: { i: number; p: P }) {
  const n = POS[RECALL[i]];
  const s = recallAt(i);
  const o = useTransform(p, [s - 0.01, s + 0.02], [0, 1]);
  return <motion.circle cx={n.x} cy={n.y} r={15} fill="none" stroke="currentColor" strokeWidth={1.6} style={{ opacity: o }} />;
}

export function RecallComet({ p }: { p: P }) {
  const pts = RECALL.map((id, i) => (id === "HUB" ? toRim(POS[RECALL[i - 1]]) : POS[id]));
  const stops = RECALL.map((_, i) => recallAt(i));
  const x = useTransform(p, stops, pts.map((q) => q.x));
  const y = useTransform(p, stops, pts.map((q) => q.y));
  const end = stops[stops.length - 1];
  const opacity = useTransform(p, [stops[0] - 0.01, stops[0], end, end + 0.02], [0, 1, 1, 0]);
  return <motion.circle r={5} fill="currentColor" style={{ x, y, opacity }} />;
}

/* The agent: an opaque disc (links stop at its rim) that pulses once on recall. */
export function Hub({ p }: { p: P }) {
  const end = recallAt(RECALL.length - 1);
  const pulse = useTransform(p, [end - 0.01, end + 0.03, 1], [1, 1.3, 1]);
  const glow = useTransform(p, [end - 0.02, end + 0.01], [0, 1]);
  return (
    <g>
      <motion.circle
        cx={HUB.x}
        cy={HUB.y}
        r={HUB.r + 10}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.4}
        strokeWidth={1.4}
        style={{ scale: pulse, opacity: glow, transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill="var(--background)" />
      <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill={tint("cyan", 12)} stroke={tint("cyan", 55)} strokeWidth={1.5} />
      <Bot x={HUB.x - 17} y={HUB.y - 17} width={34} height={34} strokeWidth={1.6} className="text-foreground" />
    </g>
  );
}
