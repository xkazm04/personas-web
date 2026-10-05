"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Bolt, ClockFace, Envelope, HashMark, Laptop, Padlock } from "../shared/glyphs";
import { beat } from "../shared/motion";
import { STOPS } from "./trailGeometry";

/* The drawn landmark at each stop of the trail. Each is always drawn and comes
 * up to full strength when the traveller reaches its stop. */

const [S1, S2, S3, S4] = STOPS;
const FG = "var(--foreground)";

function Lit({ p, at, children }: { p: MotionValue<number>; at: number; children: React.ReactNode }) {
  const opacity = useTransform(p, (v) => 0.35 + 0.65 * beat(v, at, 0.05));
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

/** Stop 1: the installer drops into your laptop. */
function Install({ p }: { p: MotionValue<number> }) {
  const c = BRAND_VAR.cyan;
  const y = useTransform(p, (v) => -26 * (1 - beat(v, 0, 0.07)));
  return (
    <Lit p={p} at={S1.at}>
      <Laptop x={S1.x - 44} y={S1.y - 38} s={104} c={c} />
      <motion.g style={{ y }}>
        <path d={`M${S1.x - 44} ${S1.y - 116} V${S1.y - 78} M${S1.x - 58} ${S1.y - 92} L${S1.x - 44} ${S1.y - 78} L${S1.x - 30} ${S1.y - 92}`} stroke={c} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.g>
    </Lit>
  );
}

/** Stop 2: a speech bubble of plain words. */
function Describe({ p }: { p: MotionValue<number> }) {
  const c = BRAND_VAR.purple;
  const x = S2.x;
  const y = S2.y - 66;
  return (
    <Lit p={p} at={S2.at}>
      <path
        d={`M${x - 58} ${y - 30} h116 a14 14 0 0 1 14 14 v30 a14 14 0 0 1 -14 14 h-48 l-14 16 l-6 -16 h-48 a14 14 0 0 1 -14 -14 v-30 a14 14 0 0 1 14 -14 Z`}
        fill={tint("purple", 14)}
        stroke={c}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {[[-40, 34], [-40, 72], [-40, 50]].map(([dx, len], i) => (
        <line key={i} x1={x + dx} x2={x + dx + len + (i === 1 ? 6 : 0)} y1={y - 14 + i * 14} y2={y - 14 + i * 14} stroke={c} strokeWidth={3} strokeLinecap="round" strokeOpacity={0.85} />
      ))}
    </Lit>
  );
}

/** Stop 3: the agent plugged into Gmail and Slack, keys under lock. */
function Build({ p }: { p: MotionValue<number> }) {
  const c = BRAND_VAR.emerald;
  const env: [number, number] = [S3.x + 82, S3.y + 84];
  const hash: [number, number] = [S3.x + 170, S3.y + 46];
  return (
    <Lit p={p} at={S3.at}>
      <path d={`M${S3.x + 14} ${S3.y + 14} C${S3.x + 30} ${S3.y + 70} ${env[0] - 40} ${env[1]} ${env[0] - 22} ${env[1]}`} stroke={c} strokeWidth={2.4} fill="none" strokeDasharray="5 5" />
      <path d={`M${S3.x + 18} ${S3.y + 8} C${S3.x + 70} ${S3.y + 30} ${hash[0] - 60} ${hash[1]} ${hash[0] - 22} ${hash[1]}`} stroke={c} strokeWidth={2.4} fill="none" strokeDasharray="5 5" />
      <Envelope x={env[0]} y={env[1]} s={40} c={BRAND_VAR.cyan} />
      <HashMark x={hash[0]} y={hash[1]} s={38} c={BRAND_VAR.purple} />
      <Padlock x={S3.x + 40} y={S3.y + 58} s={26} c={BRAND_VAR.amber} />
    </Lit>
  );
}

/** Stop 4: a clock for the schedule, a bolt for events. */
function Run({ p }: { p: MotionValue<number> }) {
  const c = BRAND_VAR.amber;
  return (
    <Lit p={p} at={S4.at}>
      <line x1={S4.x} x2={S4.x} y1={S4.y - 20} y2={S4.y - 44} stroke={FG} strokeOpacity={0.3} strokeWidth={2} />
      <ClockFace x={S4.x - 16} y={S4.y - 66} s={42} c={c} />
      <Bolt x={S4.x + 28} y={S4.y - 66} s={32} c={c} />
    </Lit>
  );
}

export default function Landmarks({ p }: { p: MotionValue<number> }) {
  return (
    <g>
      <Install p={p} />
      <Describe p={p} />
      <Build p={p} />
      <Run p={p} />
    </g>
  );
}
