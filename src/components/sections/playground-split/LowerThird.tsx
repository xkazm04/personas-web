"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { BEATS, type MindRun } from "./shared/useMindRun";
import { BEAT_BRAND, DIMENSIONS, beatCaption, beatDetail, beatTitle } from "./shared/beats";

/**
 * Subtitles for the camera: the beat in frame, said as what it does for you,
 * with the concrete thing it produced. When the run completes, the subtitle
 * gives way to the outcome - four cards rising into the frame.
 */
export default function LowerThird({ run, height }: { run: MindRun; height: string }) {
  const { reduced } = run;
  const done = run.phase === "done";
  const idle = run.phase === "idle";
  const brand = done ? "emerald" : BEAT_BRAND[BEATS[run.focus]];
  return (
    <div
      className="absolute inset-x-0 bottom-0 flex flex-col justify-end px-5 pb-4"
      style={{ height, background: "linear-gradient(to top, color-mix(in srgb, var(--background) 92%, transparent) 55%, transparent)" }}
      aria-live="polite"
    >
      {done ? (
        <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {DIMENSIONS.map((d, i) => (
            <motion.li
              key={`${run.activeExample}-${d.key}`}
              // The outcome reads as four labels, not four clipped sentences:
              // the concrete result stays available to assistive tech only.
              className="flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3.5 stage:py-[2.2svh]"
              style={{ borderColor: tint(d.brand, 40), background: `color-mix(in srgb, var(--background) 86%, ${BRAND_VAR[d.brand]})` }}
              initial={reduced ? false : { opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg stage:h-[5svh] stage:w-[5svh]"
                style={{ background: tint(d.brand, 18), color: BRAND_VAR[d.brand] }}
                aria-hidden
              >
                <d.icon className="h-5 w-5 stage:h-[2.6svh] stage:w-[2.6svh]" />
              </span>
              <span className="min-w-0 text-[clamp(1.1rem,1.5vw,1.5rem)] font-semibold leading-tight tracking-tight text-foreground">
                {run.copy.dimensions[d.key]}
                <span className="sr-only">: {run.example.result[d.key]}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <motion.div
          key={idle ? "idle" : `${run.activeExample}-${run.focus}`}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-center"
        >
          <div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: BRAND_VAR[idle ? "cyan" : brand] }}>
            {idle ? run.lab.stylised : `${run.focus + 1} / ${BEATS.length} · ${beatTitle(run, run.focus)}`}
          </div>
          <p className="mt-1 text-[clamp(1.4rem,2.3vw,2.2rem)] font-semibold leading-tight tracking-tight text-foreground">
            {idle ? run.lab.idleHint : beatCaption(run, run.focus)}
          </p>
          <p className="mt-1 truncate font-mono text-base" style={{ color: idle ? "var(--muted-dark)" : BRAND_VAR[brand] }}>
            {idle ? run.copy.mindIdleHint : beatDetail(run, run.focus)}
          </p>
        </motion.div>
      )}
    </div>
  );
}
