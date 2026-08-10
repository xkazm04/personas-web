"use client";

import { motion } from "framer-motion";
import { type BrandKey, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, STEP, type ModuleStage } from "@/components/athena/stage/stages";
import { DIMS, STRIP } from "./copy";
import type { Tone } from "./data";
import type { Rect } from "./layout";
import { rectStyle, Sheen, Slot } from "./parts";

/**
 * One project, seen from the air.
 *
 * It lives in WORLD space, so it is terrain: the camera scales it, and its
 * strokes and strip thicken as the camera comes down, which is the point.
 * Nothing here carries type — the name rides the screen layer so it reads at
 * the same size from every altitude.
 *
 * The strip along the bottom is the project's health, one bar per dimension.
 * It arrives blank: a plot has no verdict until the survey reaches it. When
 * it does, the bars that are NOT fine light and the rest stay quiet, which
 * is the whole claim — most of a project is always fine, and the two ticks
 * that are not are the only thing worth your attention.
 */

const TONE: Record<Tone, { key: BrandKey; border: number; fill: number; glow: number }> = {
  waiting: { key: "cyan", border: 20, fill: 3, glow: 0 },
  calm: { key: "cyan", border: 16, fill: 4, glow: 0 },
  attention: { key: "amber", border: 46, fill: 10, glow: 20 },
  worst: { key: "rose", border: 62, fill: 13, glow: 30 },
  handled: { key: "emerald", border: 50, fill: 8, glow: 20 },
};

/** The reticle the camera puts on the one it came for. */
function grow(r: Rect, d: number): Rect {
  return { x: r.x - d, y: r.y - d * 1.4, w: r.w + d * 2, h: r.h + d * 2.8 };
}

export default function Island({
  index,
  rect,
  tilt,
  stage,
  tone,
  settled,
  restless,
  bad,
  dim,
  reduced,
}: {
  index: number;
  rect: Rect;
  tilt: number;
  stage: ModuleStage;
  tone: Tone;
  settled: boolean;
  restless: boolean;
  bad: readonly number[];
  dim: boolean;
  reduced: boolean;
}) {
  const solid = atStage(stage, "shell");
  const strip = atStage(stage, "body");
  const read = atStage(stage, "detail");
  const t = TONE[tone];
  // The calm recede once the field has been sorted — quieter still, never
  // gone. A portfolio you can no longer see is not a portfolio in view.
  const quiet = settled && tone === "calm";
  const asking = (tone === "attention" || tone === "worst") && restless && !reduced;
  const ring = tone === "worst" || tone === "handled";

  return (
    <>
      {ring && (
        <motion.span
          className="pointer-events-none absolute rounded-2xl border"
          style={{
            ...rectStyle(grow(rect, 1.6)),
            borderColor: tint(t.key, 45),
            boxShadow: brandShadow(t.key, 22, 22),
          }}
          initial={reduced ? false : { opacity: 0, scale: 1.16 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}
      <Slot
        rect={rect}
        solid={solid}
        waiting
        reduced={reduced}
        tilt={tilt}
        round="rounded-lg"
        className="flex flex-col justify-end overflow-hidden p-[5%]"
        style={{
          borderColor: tint(t.key, quiet ? 12 : t.border),
          backgroundColor: tint(t.key, quiet ? 3 : t.fill),
          boxShadow: t.glow ? brandShadow(t.key, 26, t.glow) : undefined,
          opacity: dim ? 0.5 : 1,
        }}
      >
        <Sheen on={tone === "handled"} reduced={reduced} />

        {/* "this one is still asking" — a slow breath, never a blink */}
        {asking && (
          <motion.span
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: tint(t.key, 14) }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
          />
        )}

        {/* Health, one bar per dimension */}
        <span className="flex h-[56%] items-end gap-[2.5%]" aria-hidden="true">
          {Array.from({ length: DIMS }, (_, j) => {
            const lit = read && bad.includes(j);
            return (
              <motion.span
                key={j}
                className="min-w-0 flex-1 origin-bottom rounded-[1px]"
                style={{
                  height: `${STRIP[(j + index) % STRIP.length]}%`,
                  backgroundColor: lit ? tint(t.key, 85) : tint("cyan", quiet ? 14 : 22),
                  boxShadow: lit ? brandShadow(t.key, 8, 60) : undefined,
                }}
                // A dimension going bad is a moment, not a colour swap: the
                // bar SPIKES past the calm ones as the survey reads it, so
                // the field can be scanned for trouble from any altitude.
                initial={reduced ? false : { scaleY: 0, opacity: 0 }}
                animate={{ scaleY: strip ? (lit ? 1.45 : 1) : 0, opacity: strip ? 1 : 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : lit
                      ? { type: "spring", bounce: 0.45, duration: 0.7 }
                      : { duration: 0.4, delay: j * STEP * 0.5 }
                }
              />
            );
          })}
        </span>
      </Slot>
    </>
  );
}
