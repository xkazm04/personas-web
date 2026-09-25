"use client";

import { backOut, easeIn, motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/* Geometry and moving parts of the nested-vault illustration (see .art.tsx for the beats). */
export const W = 760;
export const H = 480;
const GAP = 36; // degrees of opening in each ring
const LATCH_ANGLE = -45; // where every ring's notch locks
const LABEL_ANGLE = -140; // where the engraved labels sit

interface RingSpec {
  r: number;
  w: number;
  color: BrandKey;
  turn: number;
  beat: [number, number];
  label: string;
  labelR: number;
}

export const RINGS: RingSpec[] = [
  { r: 90, w: 18, color: "rose", turn: 270, beat: [0.2, 0.4], label: "AES-256-GCM", labelR: 111 },
  { r: 142, w: 20, color: "purple", turn: -240, beat: [0.4, 0.6], label: "OS keychain", labelR: 164 },
  { r: 196, w: 22, color: "cyan", turn: 210, beat: [0.6, 0.8], label: "Device", labelR: 216 },
];

const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (r: number, deg: number) => [r * Math.cos(rad(deg)), r * Math.sin(rad(deg))] as const;

/** A clockwise arc centred on `mid` degrees, for text that reads upright. */
function arcPath(r: number, mid: number, span = 90) {
  const [x0, y0] = polar(r, mid - span / 2);
  const [x1, y1] = polar(r, mid + span / 2);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** Dash pattern for a circle of radius r with one GAP-degree opening centred at the top. */
function gapDash(r: number) {
  const c = 2 * Math.PI * r;
  const g = (c * GAP) / 360;
  return { strokeDasharray: `${(c - g).toFixed(2)} ${g.toFixed(2)}`, transform: `rotate(${-90 + GAP / 2})` };
}

export const rotateStyle = { transformBox: "fill-box", transformOrigin: "center" } as const;

export function Ring({ spec, progress, pathId }: { spec: RingSpec; progress: MotionValue<number>; pathId: string }) {
  const { r, w, color, turn, beat, label, labelR } = spec;
  const [b0, b1] = beat;
  const rotate = useTransform(progress, [b0, b1], [0, turn], { ease: backOut });
  const latchX = useTransform(progress, [b1 - 0.04, b1], [14, 0], { ease: easeIn });
  const flash = useTransform(progress, [b1 - 0.01, b1 + 0.03, b1 + 0.14], [0, 0.55, 0.22]);
  const labelOpacity = useTransform(progress, [b1 - 0.02, b1 + 0.04], [0.5, 1]);
  const band = gapDash(r);
  const edgeIn = gapDash(r - w / 2 + 1.5);
  const edgeOut = gapDash(r + w / 2 - 1.5);
  const notchLocal = LATCH_ANGLE - turn;
  const rivets = [1, 2, 3, 4, 5].map((k) => -90 + GAP / 2 + (k * (360 - GAP)) / 6);

  return (
    <g>
      {/* the turning ring */}
      <motion.g style={{ ...rotateStyle, rotate }}>
        {/* pins the fill-box to the ring centre */}
        <circle r={r + w} fill="none" stroke="none" />
        {/* lock glow: flares at the click and settles, openings stay open */}
        <motion.g style={{ opacity: flash }} filter="url(#nv-soft)">
          <circle r={r} fill="none" stroke={BRAND_VAR[color]} strokeWidth={w + 12} {...band} />
        </motion.g>
        <circle r={r} fill="none" stroke={tint(color, 62)} strokeWidth={w} {...band} />
        <circle r={r - w / 2 + 1.5} fill="none" stroke={BRAND_VAR[color]} strokeWidth={1.2} {...edgeIn} />
        <circle r={r + w / 2 - 1.5} fill="none" stroke={BRAND_VAR[color]} strokeWidth={1.2} {...edgeOut} />
        {rivets.map((a) => {
          const [x, y] = polar(r, a);
          return <circle key={a} cx={x} cy={y} r={2.2} fill="var(--background)" opacity={0.55} />;
        })}
        {/* the notch the latch drops into */}
        <g transform={`rotate(${notchLocal})`}>
          <rect x={r + w / 2 - 9} y={-5} width={10} height={10} rx={1.5} fill="var(--background)" />
        </g>
      </motion.g>

      {/* the fixed latch */}
      <g transform={`rotate(${LATCH_ANGLE})`}>
        <motion.rect
          x={r + w / 2 - 8}
          y={-4}
          width={20}
          height={8}
          rx={2}
          fill={BRAND_VAR[color]}
          style={{ x: latchX }}
        />
      </g>

      {/* engraved label, just outside its ring */}
      <path id={pathId} d={arcPath(labelR, LABEL_ANGLE)} fill="none" />
      <motion.text
        fill={BRAND_VAR[color]}
        fontSize={14}
        letterSpacing={1.2}
        className="font-mono"
        style={{ opacity: labelOpacity }}
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {label}
        </textPath>
      </motion.text>
    </g>
  );
}

export function Bolts({ progress, side }: { progress: MotionValue<number>; side: 1 | -1 }) {
  const x = useTransform(progress, [0.8, 0.9], [-46 * side, 0], { ease: backOut });
  return (
    <g>
      {/* frame the bolts shoot into */}
      <rect
        x={side > 0 ? 300 : -316}
        y={-86}
        width={16}
        height={172}
        rx={4}
        fill="var(--foreground)"
        fillOpacity={0.06}
        stroke="var(--foreground)"
        strokeOpacity={0.18}
      />
      <motion.g style={{ x }}>
        {[-52, 0, 52].map((y) => (
          <rect
            key={y}
            x={side > 0 ? 190 : -306}
            y={y - 7}
            width={116}
            height={14}
            rx={7}
            fill="var(--foreground)"
            fillOpacity={0.2}
            stroke="var(--foreground)"
            strokeOpacity={0.3}
          />
        ))}
      </motion.g>
    </g>
  );
}

