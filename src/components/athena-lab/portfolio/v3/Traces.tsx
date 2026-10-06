"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { type BrandKey, tint } from "@/lib/brand-theme";
import type { VitalsState } from "./data";
import { ATTENTION_LANES, DAYS, QUIET_DAY, revived, SPAN, TODAY, wave, WORST_LANE, type WallLayout } from "./waves";

/**
 * The wall itself: one heartbeat per project across the last two weeks.
 *
 * The traces draw as her playhead passes (a clip that grows with the sweep),
 * so the wall is literally being looked at, not just shown. Once read, the
 * healthy recede, the ones that are not fine take their colour, and the one
 * that went flat turns rose - with the span it has been quiet for lit behind
 * it. When the fix is in, its trace carries on PAST today, emerald.
 *
 * Non-scaling hairlines on a stretched viewBox: the wall fills whatever box
 * the stage gives it while every stroke stays crisp.
 */

function keyOf(j: number, v: VitalsState): { key: BrandKey; alpha: number } {
  if (!v.sorted) return { key: "cyan", alpha: 80 };
  if (j === WORST_LANE) return v.marked ? { key: "rose", alpha: v.healed ? 50 : 95 } : { key: "amber", alpha: 90 };
  if ((ATTENTION_LANES as readonly number[]).includes(j)) return { key: "amber", alpha: 85 };
  return { key: "cyan", alpha: 38 };
}

export default function Traces({ v, L, reduced }: { v: VitalsState; L: WallLayout; reduced: boolean }) {
  const n = L.n;
  const uid = useId().replace(/:/g, "");
  const H = n * 100;
  const quietX = (QUIET_DAY / DAYS) * TODAY;
  const tween = reduced ? { duration: 0 } : { duration: 0.9, ease: "linear" as const };

  return (
    <svg
      className="absolute"
      style={{ left: `${L.x0}%`, width: `${L.x1 - L.x0}%`, top: `${L.lanes.y}%`, height: `${L.lanes.h}%` }}
      viewBox={`0 0 ${SPAN} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${uid}-seen`}>
          <motion.rect x="0" y="0" height={H} initial={false} animate={{ width: v.sweep * TODAY }} transition={tween} />
        </clipPath>
        <clipPath id={`${uid}-next`}>
          <motion.rect
            x={TODAY}
            y="0"
            height={H}
            initial={false}
            animate={{ width: v.healed ? SPAN - TODAY : 0 }}
            transition={reduced ? { duration: 0 } : { duration: 2.2, ease: "linear" }}
          />
        </clipPath>
      </defs>

      {/* Days and lanes */}
      {Array.from({ length: DAYS + 1 }, (_, d) => (
        <line key={d} x1={(d / DAYS) * TODAY} x2={(d / DAYS) * TODAY} y1="0" y2={H} stroke={tint("cyan", 7)} vectorEffect="non-scaling-stroke" />
      ))}
      {Array.from({ length: n + 1 }, (_, j) => (
        <line key={j} x1="0" x2={SPAN} y1={j * 100} y2={j * 100} stroke={tint("cyan", 9)} vectorEffect="non-scaling-stroke" />
      ))}

      {/* How long it has been quiet */}
      <motion.rect
        x={quietX}
        y={WORST_LANE * 100 + 6}
        width={TODAY - quietX}
        height={88}
        rx={6}
        fill={tint("rose", 10)}
        stroke={tint("rose", 40)}
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{ opacity: v.pinned && !v.healed ? 1 : v.pinned ? 0.45 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
      />

      <g clipPath={`url(#${uid}-seen)`}>
        {Array.from({ length: n }, (_, j) => {
          const { key, alpha } = keyOf(j, v);
          return (
            <polyline
              key={j}
              points={wave(j, 0, TODAY)}
              fill="none"
              strokeWidth={j === WORST_LANE && v.marked ? 2.2 : 1.6}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                stroke: tint(key, alpha),
                filter: `drop-shadow(0 0 3px ${tint(key, alpha * 0.6)})`,
                transition: reduced ? undefined : "stroke .6s",
              }}
            />
          );
        })}
      </g>

      {/* Past today: the beat coming back */}
      <polyline
        points={revived(WORST_LANE)}
        clipPath={`url(#${uid}-next)`}
        fill="none"
        strokeWidth={2.2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ stroke: tint("emerald", 95), filter: `drop-shadow(0 0 4px ${tint("emerald", 60)})` }}
      />

      {/* Today */}
      <line x1={TODAY} x2={TODAY} y1="0" y2={H} stroke={tint("cyan", 40)} strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
