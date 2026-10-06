"use client";

import { motion } from "framer-motion";
import { DrawCheck } from "@/components/athena/sections/her-workshop/variant-c/parts";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { Glyph, type Frame } from "../shared/art";
import { BRANDS, JOB_OF, type Scene } from "./data";
import type { V2Layout } from "./layout";

/**
 * The words in the plan: each room's name with its tool's real mark, and the
 * work she is doing in every room she was handed a key to.
 *
 * A room you kept a key to carries its name and nothing else, in the dim ink
 * of an unlit room - not a warning, not a lock. A room you opened gets its
 * name in full ink, then one piece of work that solidifies, runs and lands
 * with a drawn check.
 */
export default function Rooms({ scene, g, f, reduced }: { scene: Scene; g: V2Layout; f: Frame; reduced: boolean }) {
  const c = useTranslation().t.athenaLab.workshop.v2;
  return (
    <>
      {g.rooms.map((room, i) => {
        const state = scene.rooms[i];
        const lit = state !== "dark" && state !== "keyed";
        const job = JOB_OF[i];
        const running = state === "working" || state === "done";
        const done = state === "done";
        return (
          <div key={i}>
            <motion.span
              className="absolute flex items-center whitespace-nowrap font-semibold leading-none"
              style={{ ...f.box(room.label.x, room.label.y), ...f.fs(20, 15), gap: f.len(10, 6) }}
              initial={false}
              animate={{ opacity: scene.named ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : i * 0.06 }}
            >
              <Glyph
                src={`/tools/${BRANDS[i]}.svg`}
                color={lit ? BRAND_VAR.cyan : "var(--muted-dark)"}
                size={f.len(22, 15)}
                className="transition-[background-color] duration-700"
              />
              <span className={`transition-colors duration-700 ${lit ? "text-foreground" : "text-muted-dark"}`}>{c.rooms[i]}</span>
            </motion.span>

            {job !== null && (
              <motion.div
                className="absolute flex flex-col justify-center rounded-xl border backdrop-blur-sm"
                style={{
                  ...f.box(room.job.x, room.job.y, room.job.w, room.job.h),
                  gap: f.len(8, 4),
                  paddingInline: f.len(14, 8),
                  borderColor: tint("cyan", done ? 50 : 30),
                  backgroundColor: tint("cyan", done ? 10 : 6),
                  boxShadow: done ? brandShadow("cyan", 22, 24) : `inset 0 1px 0 ${tint("cyan", 20)}`,
                }}
                initial={false}
                animate={{ opacity: lit ? 1 : 0, y: lit ? 0 : 6 }}
                transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.35 }}
              >
                <span className="flex min-w-0 items-center leading-tight text-foreground" style={{ ...f.fs(19, 16), gap: f.len(10, 6) }}>
                  <span className="flex shrink-0 items-center justify-center" style={{ width: f.len(18, 14), height: f.len(18, 14) }}>
                    {done ? (
                      <DrawCheck reduced={reduced} className="h-full w-full text-brand-cyan" />
                    ) : (
                      <motion.span
                        className="h-3/4 w-3/4 rounded-full"
                        style={{ backgroundColor: running ? BRAND_VAR.cyan : tint("cyan", 30) }}
                        animate={running && !reduced ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                        transition={running && !reduced ? { duration: 1.6, repeat: Infinity } : { duration: 0.3 }}
                      />
                    )}
                  </span>
                  <span className="min-w-0">{c.jobs[job]}</span>
                </span>
                <span className="block overflow-hidden rounded-full" style={{ height: f.len(4, 3), backgroundColor: tint("cyan", 12) }} aria-hidden="true">
                  <span
                    className={`block h-full rounded-full ${reduced ? "" : "transition-[width] duration-[900ms] ease-linear"}`}
                    style={{ width: `${Math.round(scene.progress[i] * 100)}%`, backgroundColor: BRAND_VAR.cyan }}
                  />
                </span>
              </motion.div>
            )}
          </div>
        );
      })}
    </>
  );
}
