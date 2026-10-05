"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { BEATS, type MindRun } from "../shared/useMindRun";
import { BEAT_BRAND, DIMENSIONS, beatCaption, beatDetail, beatTitle } from "../shared/beats";

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
              className="min-w-0 rounded-xl border p-3.5 stage:p-[2svh]"
              style={{ borderColor: tint(d.brand, 35), background: `color-mix(in srgb, var(--background) 88%, ${BRAND_VAR[d.brand]})` }}
              initial={reduced ? false : { opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em]" style={{ color: BRAND_VAR[d.brand] }}>
                <d.icon className="h-3.5 w-3.5" aria-hidden />
                {run.copy.dimensions[d.key]}
              </div>
              <p className="mt-1.5 line-clamp-3 text-[clamp(1rem,1.2vw,1.2rem)] leading-snug text-foreground [overflow-wrap:anywhere]">{run.example.result[d.key]}</p>
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
