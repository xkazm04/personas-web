"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { AGENT, BG, FG, RULES, mix, seg } from "../shared/motion";
import Shape from "./Shape";
import { CASES, HOLE_R, HOLE_Y, JAMS, PLATE, SHAPES, bump, holeX, landAt } from "./data";

/* The sorter plate: a lit slab with depth, four cut-out holes. A hole flashes
 * rose when the rules jam the whole request against it, and glows emerald
 * once the agent seats a piece in it. */

/** Always darker than the plate around it, in light and dark themes alike. */
const HOLE_FILL = `color-mix(in srgb, ${BG} 72%, black)`;

function Hole({ i, c, p }: { i: number; c: number; p: MotionValue<number> }) {
  const [a, b] = CASES[c].need;
  const order = CASES[c].need.indexOf(i);
  const jam = i === a ? JAMS[0] : i === b ? JAMS[1] : -1;
  const flash = useTransform(p, (v) => (jam < 0 ? 0 : bump(v, jam - 0.01, jam + 0.06)));
  const glow = useTransform(p, (v) => (order < 0 ? 0 : seg(v, landAt(order) + 0.03, landAt(order) + 0.07)));
  const x = holeX(i);
  return (
    <g transform={`translate(${x} ${HOLE_Y})`}>
      <motion.g style={{ opacity: glow }}>
        <Shape kind={SHAPES[i]} r={HOLE_R + 12} fill={mix(AGENT, 18)} filter="url(#tl2-blur)" />
      </motion.g>
      <Shape kind={SHAPES[i]} r={HOLE_R} fill={HOLE_FILL} stroke={mix(FG, 34)} strokeWidth={2} />
      <g transform="translate(0 4)">
        <Shape kind={SHAPES[i]} r={HOLE_R - 4} fill="none" stroke={mix(FG, 10)} strokeWidth={6} />
      </g>
      <motion.g style={{ opacity: flash }}>
        <Shape kind={SHAPES[i]} r={HOLE_R + 3} fill="none" stroke={RULES} strokeWidth={4} />
      </motion.g>
      <motion.g style={{ opacity: glow }}>
        <Shape kind={SHAPES[i]} r={HOLE_R + 3} fill="none" stroke={AGENT} strokeWidth={3} />
      </motion.g>
    </g>
  );
}

export default function Plate({ c, p }: { c: number; p: MotionValue<number> }) {
  const { x, y, w, h, depth } = PLATE;
  return (
    <g>
      <ellipse cx={x + w / 2} cy={y + h + depth + 18} rx={w * 0.52} ry={20} fill={FG} opacity={0.08} filter="url(#tl2-blur)" />
      <rect x={x} y={y + depth} width={w} height={h} rx={22} fill={mix(FG, 16)} />
      <rect x={x} y={y} width={w} height={h} rx={22} fill="url(#tl2-plate)" stroke={mix(FG, 26)} strokeWidth={1.5} />
      <rect x={x + 24} y={y + 1} width={w - 48} height={1.5} fill={FG} opacity={0.22} />
      {SHAPES.map((_, i) => (
        <Hole key={i} i={i} c={c} p={p} />
      ))}
    </g>
  );
}
