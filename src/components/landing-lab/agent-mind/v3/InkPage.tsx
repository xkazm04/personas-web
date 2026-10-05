"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { BEATS, type MindRun } from "../shared/useMindRun";
import { BEAT_BRAND, beatTitle } from "../shared/beats";
import { ART, SPOTS, journey } from "./art";
import Vignette from "./Vignette";
import Caption from "./Caption";

const INK = "var(--foreground)";
const PENCIL = "color-mix(in srgb, var(--foreground) 30%, transparent)";

/**
 * The agent mind as a drawing. The whole plan is pencilled in from the start
 * (the idle and reduced-motion frame is a complete sketch); as the run moves,
 * the pen inks the line from beat to beat and draws each vignette, and a
 * wash of colour blooms behind it. A finished run is a finished page.
 */
export default function InkPage({ run }: { run: MindRun }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = { wash: `am3w${uid}`, rough: `am3r${uid}` };
  const idle = run.phase === "idle";
  const status = (b: number) => (idle ? "pending" : run.statusOf(b));
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative min-h-[300px] flex-1 [container-type:size] stage:min-h-0">
        <div
          role="img"
          aria-label={run.lab.illustration}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: `min(100cqw, calc(100cqh * ${ART.w / ART.h}))`, aspectRatio: `${ART.w} / ${ART.h}` }}
        >
          <svg viewBox={`0 0 ${ART.w} ${ART.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <defs>
              <filter id={ids.wash} x="-30%" y="-30%" width="160%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={3} seed={7} result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale={26} xChannelSelector="R" yChannelSelector="G" />
                <feGaussianBlur stdDeviation={1.2} />
              </filter>
              <filter id={ids.rough} x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={3} result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g filter={`url(#${ids.rough})`}>
              {SPOTS.slice(0, -1).map((_, i) => (
                <g key={i}>
                  <path d={journey(i)} fill="none" stroke={PENCIL} strokeWidth={1.5} strokeDasharray="2 6" strokeLinecap="round" />
                  <motion.path
                    d={journey(i)}
                    fill="none"
                    stroke={INK}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    initial={false}
                    animate={{ pathLength: status(i + 1) === "pending" ? 0 : 1 }}
                    transition={run.reduced ? { duration: 0 } : { duration: 0.6, ease: "easeInOut" }}
                  />
                </g>
              ))}
            </g>
            {BEATS.map((b, i) => (
              <Vignette
                key={`${run.activeExample ?? "idle"}-${b}`}
                beat={i}
                status={status(i)}
                focused={!idle && run.isRunning && run.focus === i}
                brand={BEAT_BRAND[b]}
                tools={run.example.tools}
                reduced={run.reduced}
                ids={ids}
              />
            ))}
          </svg>
          {BEATS.map((b, i) => {
            const st = status(i);
            const brand = BEAT_BRAND[b];
            return (
              <div
                key={b}
                className="absolute flex max-w-[34%] -translate-x-1/2 items-start gap-1.5 rounded-md px-1.5 text-base font-semibold leading-snug tracking-tight"
                style={{ left: `${(SPOTS[i].x / ART.w) * 100}%`, top: `${((SPOTS[i].y + 96) / ART.h) * 100}%`, background: "var(--am3-paper)" }}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors duration-500"
                  style={{ borderColor: st === "pending" ? PENCIL : BRAND_VAR[brand], color: st === "pending" ? "var(--muted-dark)" : BRAND_VAR[brand] }}
                >
                  {i + 1}
                </span>
                <span className={`text-center transition-colors duration-500 ${i === 2 ? "max-w-[15rem]" : "whitespace-nowrap"} ${st === "pending" ? "text-muted-dark" : "text-foreground"}`}>{beatTitle(run, i)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Caption run={run} />
    </div>
  );
}
