"use client";

import { motion, useReducedMotion } from "framer-motion";
import { tint, type BrandKey } from "@/lib/brand-theme";
import { REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { MIGRATIONS, type MigrationKind } from "./data";
import { FLIGHTS, TL } from "./ledger-geometry";

/**
 * The three deleted noise surfaces — a footer notice popover, an
 * "auto-decided" fleet toast, and a failure toast. Each springs in styled
 * deliberately obnoxious (loud border, tinted fill, a close ✕ it never
 * earned), holds a beat, then flies to its documented destination on the
 * right: shrinking, tilting, and fading out as it crosses the stage.
 *
 * Two motion layers per card: the wrapper owns position (left/top percent
 * keyframes = the flight) and the inner owns the spring pop-in. Reduced
 * motion gates the `animate`/`whileInView` props — cards stay mounted at
 * their final composed state (migrated: opacity 0 at the destination).
 */

const KIND_ACCENT: Record<MigrationKind, BrandKey> = {
  notice: "amber",
  auto: "purple",
  error: "rose",
};

export default function NoiseSurfaces() {
  const reduced = useReducedMotion() ?? false;

  return (
    <>
      {MIGRATIONS.map((m, i) => {
        const f = FLIGHTS[i];
        const accent = KIND_ACCENT[m.kind];
        const src = { left: `${f.source.x}%`, top: `${f.source.y}%` };
        const dst = { left: `${f.dest.x}%`, top: `${f.dest.y}%` };

        return (
          <motion.div
            key={m.id}
            className="absolute w-[220px] max-w-[24%]"
            style={{
              ...(reduced ? dst : src),
              x: "-50%",
              y: "-50%",
              opacity: reduced ? 0 : undefined,
            }}
            initial={reduced ? false : { ...src, opacity: 1, scale: 1, rotate: 0 }}
            whileInView={
              reduced
                ? undefined
                : {
                    left: [src.left, src.left, dst.left, dst.left],
                    top: [src.top, src.top, dst.top, dst.top],
                    opacity: [1, 1, 0.55, 0],
                    scale: [1, 1, 0.45, 0.28],
                    rotate: [0, 0, 8, 12],
                  }
            }
            viewport={REPLAY}
            transition={{
              duration: TL.flyDuration,
              times: [0, 0.06, 0.82, 1],
              ease: "easeInOut",
              delay: TL.fly(i),
            }}
          >
            <motion.div
              className="rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md"
              style={{
                borderColor: tint(accent, 55),
                background: tint(accent, 12),
                boxShadow: `0 0 24px ${tint(accent, 18)}`,
              }}
              initial={reduced ? false : { opacity: 0, scale: 0.55, rotate: -8 }}
              whileInView={reduced ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
              viewport={REPLAY}
              transition={{ ...SPRING_POP, delay: TL.pop(i) }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{m.title}</p>
                <span
                  aria-hidden="true"
                  className="text-xs leading-none text-foreground/60"
                >
                  ✕
                </span>
              </div>
              <p className="mt-1 text-xs leading-snug text-foreground/70">{m.body}</p>
            </motion.div>
          </motion.div>
        );
      })}
    </>
  );
}
