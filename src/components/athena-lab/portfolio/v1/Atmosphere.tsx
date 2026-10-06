"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import type { Point } from "./layout";

/**
 * The air between the camera and the ground - what turns a scale into a
 * flight. All SCREEN layer, all transform/opacity:
 *
 *   haze      soft banks of cloud at altitude. They sit closer to the camera
 *             than the ground, so on the way down they grow faster than the
 *             field and part around the target (parallax), and on the way up
 *             they gather back. You pass THROUGH them.
 *   route     the line she draws to the one that needs you, a beat before
 *             she flies it - intent before motion.
 *   spotlight once down, the frame darkens around the one she came for: the
 *             key light of the scene follows her attention.
 *   altimeter a ruler on the frame's edge whose ticks spread as the camera
 *             descends - the instrument that says "lower", without a word.
 */

const HAZE = [
  { x: 18, y: 30, w: 34, h: 26 },
  { x: 66, y: 22, w: 40, h: 30 },
  { x: 44, y: 70, w: 46, h: 28 },
  { x: 86, y: 74, w: 26, h: 22 },
] as const;

/** Where along her route the dots sit (0 = her, 1 = the target). */
const DOTS = [0.08, 0.17, 0.26, 0.35, 0.44, 0.53, 0.62, 0.71, 0.8, 0.89];

const TRAVEL = { duration: 2.3, ease: [0.65, 0, 0.25, 1] } as const;

export default function Atmosphere({
  near,
  landed,
  route,
  from,
  to,
  focus,
  scale,
  reduced,
}: {
  near: boolean;
  landed: boolean;
  route: boolean;
  /** Her station at altitude and the target's centre (screen percent). */
  from: Point;
  to: Point;
  /** Where the target lands on screen at the bottom of the descent. */
  focus: Point;
  /** Current camera zoom, for the altimeter. */
  scale: number;
  reduced: boolean;
}) {
  const move = reduced ? { duration: 0 } : TRAVEL;
  const ctrl = { x: to.x, y: from.y };

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: `${focus.x}% ${focus.y}%` }}
        initial={false}
        animate={{ scale: near ? 3.2 : 1, opacity: near ? 0 : 1 }}
        transition={move}
      >
        {HAZE.map((h) => (
          <span
            key={`${h.x}-${h.y}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              width: `${h.w}%`,
              height: `${h.h}%`,
              background: `radial-gradient(closest-side, ${tint("cyan", 9)}, transparent)`,
            }}
          />
        ))}
      </motion.div>

      {/* Her route: a dotted flight line, laid down from her to the target */}
      {DOTS.map((u) => {
        const v = 1 - u;
        const x = v * v * from.x + 2 * v * u * ctrl.x + u * u * to.x;
        const y = v * v * from.y + 2 * v * u * ctrl.y + u * u * to.y;
        return (
          <motion.span
            key={u}
            className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${x}%`, top: `${y}%`, backgroundColor: tint("cyan", 75) }}
            initial={false}
            animate={{ opacity: route ? 1 : 0, scale: route ? 1 : 0.4 }}
            transition={reduced ? { duration: 0 } : { duration: 0.25, delay: route ? u * 0.5 : 0 }}
          />
        );
      })}

      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 36% 46% at ${focus.x}% ${focus.y}%, transparent 45%, color-mix(in srgb, var(--background) 62%, transparent) 100%)`,
        }}
        initial={false}
        animate={{ opacity: landed ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.9 }}
      />

      {/* Altimeter */}
      <div
        className="absolute bottom-[18%] right-[1.2%] top-[18%] w-3 overflow-hidden max-sm:hidden"
        style={{ maskImage: "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)" }}
      >
        <motion.div
          className="absolute inset-x-0 -inset-y-full"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, ${tint("cyan", 45)} 0 1px, transparent 1px 14px)`,
          }}
          initial={false}
          animate={{ scaleY: scale }}
          transition={move}
        />
        <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2" style={{ backgroundColor: tint("cyan", 85) }} />
      </div>
    </div>
  );
}
