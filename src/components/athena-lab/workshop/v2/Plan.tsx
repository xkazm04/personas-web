"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { KEPT_DOOR, type Scene } from "./data";
import type { Door, V2Layout } from "./layout";

/**
 * The drawing itself: walls, doors, and the light in the rooms.
 *
 * Blueprint vocabulary - a fine grid, wall lines with a soft bloom, and the
 * architect's door symbol: a leaf hinged at one side of the gap and a dashed
 * quarter-arc for its swing. A closed door is just its leaf lying across the
 * gap, part of the wall. When a key arrives the leaf swings into the room
 * (a CSS rotate about the hinge, so the draw stays exact), its arc draws, and
 * the room's floor lights. The two doors you kept never move. When she stops
 * at one, its leaf flares - the wall holding, said in light.
 */

const ease = "cubic-bezier(0.34, 1.3, 0.64, 1)";

function DoorMark({ d, open, flare, reduced }: { d: Door; open: boolean; flare: boolean; reduced: boolean }) {
  const r = (deg: number) => (deg * Math.PI) / 180;
  const end = (deg: number) => [d.hx + d.len * Math.cos(r(deg)), d.hy + d.len * Math.sin(r(deg))];
  const [cx, cy] = end(d.base);
  const [ox, oy] = end(d.base + d.swing);
  const arc = `M ${cx} ${cy} A ${d.len} ${d.len} 0 0 ${d.swing > 0 ? 1 : 0} ${ox} ${oy}`;
  return (
    <g>
      <motion.path
        d={arc}
        fill="none"
        stroke={tint("cyan", 40)}
        strokeWidth={1.5}
        strokeDasharray="4 5"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6, delay: reduced || !open ? 0 : 0.4 }}
      />
      <line
        x1={d.hx}
        y1={d.hy}
        x2={cx}
        y2={cy}
        stroke={flare ? BRAND_VAR.cyan : tint("cyan", open ? 85 : 60)}
        strokeWidth={flare ? 6 : 4}
        strokeLinecap="round"
        style={{
          transformBox: "view-box",
          transformOrigin: `${d.hx}px ${d.hy}px`,
          transform: `rotate(${open ? d.swing : 0}deg)`,
          transition: reduced ? "none" : `transform 0.9s ${ease}, stroke 0.4s, stroke-width 0.4s`,
          filter: flare ? `drop-shadow(0 0 6px ${BRAND_VAR.cyan})` : undefined,
        }}
      />
      <circle cx={d.hx} cy={d.hy} r={4} fill={tint("cyan", 80)} />
    </g>
  );
}

export default function Plan({ scene, g, reduced }: { scene: Scene; g: V2Layout; reduced: boolean }) {
  const id = useId().replace(/:/g, "");
  const fade = (on: boolean, d = 0.8) => ({
    initial: false as const,
    animate: { opacity: on ? 1 : 0 },
    transition: { duration: reduced ? 0 : d },
  });

  return (
    <svg viewBox={`0 0 ${g.W} ${g.H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 H 0 V 20" fill="none" stroke={tint("cyan", 7)} strokeWidth={1} />
        </pattern>
        <radialGradient id={`${id}-lamp`} cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor={tint("cyan", 22)} />
          <stop offset="100%" stopColor={tint("cyan", 4)} />
        </radialGradient>
        <filter id={`${id}-bloom`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Drafting paper under the whole plan */}
      <motion.g {...fade(scene.walls, 1.2)}>
        {g.rooms.map((room, i) => (
          <rect key={i} x={room.box.x} y={room.box.y} width={room.box.w} height={room.box.h} fill={`url(#${id}-grid)`} />
        ))}
      </motion.g>

      {/* The light in every room she holds a key to */}
      {g.rooms.map((room, i) => {
        const lit = scene.rooms[i] !== "dark" && scene.rooms[i] !== "keyed";
        return (
          <motion.rect
            key={i}
            x={room.box.x + 3}
            y={room.box.y + 3}
            width={room.box.w - 6}
            height={room.box.h - 6}
            fill={`url(#${id}-lamp)`}
            {...fade(lit, 0.9)}
          />
        );
      })}

      {/* The walls - the lines you drew - before and after they are drawn */}
      <motion.path d={g.walls} fill="none" stroke={tint("cyan", 22)} strokeWidth={1.5} strokeDasharray="5 7" {...fade(!scene.walls, 0.5)} />
      <motion.path d={g.walls} fill="none" stroke={tint("cyan", 40)} strokeWidth={10} filter={`url(#${id}-bloom)`} {...fade(scene.named, 1)} />
      <motion.path
        d={g.walls}
        fill="none"
        stroke={tint("cyan", 78)}
        strokeWidth={4}
        strokeLinecap="square"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: scene.walls ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.4, ease: "easeInOut" }}
      />

      <motion.g {...fade(scene.walls, 0.6)}>
        {g.rooms.map((room, i) => (
          <DoorMark
            key={i}
            d={room.door}
            open={scene.rooms[i] !== "dark" && scene.rooms[i] !== "keyed"}
            flare={i === KEPT_DOOR && scene.stopped}
            reduced={reduced}
          />
        ))}
      </motion.g>
    </svg>
  );
}
