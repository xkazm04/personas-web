"use client";

import { motion } from "framer-motion";
import { type BrandKey, BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { CAUSE, LINKS, PARTS, WORST } from "./copy";

/**
 * A project's inner structure - the second level of detail the descent
 * resolves. From altitude a plot is a slab and a health strip; once the
 * camera is down, its parts and the links between them surface on the plot
 * itself, so going closer shows MORE, never just bigger.
 *
 * World space, like the plot it sits in: the camera scales it. The links are
 * non-scaling strokes, so they stay hairlines at both altitudes (a map draws
 * its roads the same weight at every zoom). On the plot she came for, one
 * part is the cause: it lights rose as the detail opens and turns emerald
 * when the fix commits.
 */
export default function Terrain({
  index,
  tone,
  shown,
  cause,
  live,
  reduced,
}: {
  index: number;
  tone: BrandKey;
  shown: boolean;
  /** Only the plot she came for carries a cause. */
  cause: "hidden" | "found" | "fixed" | null;
  live: boolean;
  reduced: boolean;
}) {
  const fade = reduced ? { duration: 0 } : { duration: 0.6, delay: shown ? 0.25 : 0 };
  const lit = index === WORST && cause !== "hidden" && cause !== null;
  const key: BrandKey = cause === "fixed" ? "emerald" : "rose";

  return (
    <motion.span
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={fade}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {LINKS.map(([a, b]) => {
          const hot = lit && (a === CAUSE || b === CAUSE);
          return (
            <line
              key={`${a}-${b}`}
              x1={PARTS[a].x * 100}
              y1={PARTS[a].y * 100}
              x2={PARTS[b].x * 100}
              y2={PARTS[b].y * 100}
              stroke={hot ? tint(key, 70) : tint(tone, 40)}
              strokeWidth={hot ? 1.4 : 1}
              vectorEffect="non-scaling-stroke"
              strokeDasharray={hot && cause === "found" ? "3 2" : undefined}
            />
          );
        })}
      </svg>

      {PARTS.map((p, i) => {
        const isCause = lit && i === CAUSE;
        return (
          <span
            key={i}
            className="absolute aspect-square w-[4.5%] -translate-x-1/2 -translate-y-1/2 rounded-[2px] transition-colors duration-500"
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              backgroundColor: isCause ? BRAND_VAR[key] : tint(tone, 55),
              boxShadow: isCause ? brandShadow(key, 10, 80) : undefined,
            }}
          >
            {isCause && (
              <motion.span
                className="absolute -inset-[120%] rounded-full border"
                style={{ borderColor: tint(key, 60) }}
                initial={false}
                animate={
                  live && cause === "found"
                    ? { scale: [0.4, 1.3], opacity: [0.9, 0] }
                    : { scale: 1, opacity: cause === "fixed" ? 0.5 : 0.8 }
                }
                transition={
                  live && cause === "found"
                    ? { duration: 1.4, repeat: Infinity, ease: "easeOut" }
                    : { duration: reduced ? 0 : 0.4 }
                }
              />
            )}
          </span>
        );
      })}
    </motion.span>
  );
}
