"use client";

import { useRef } from "react";
import { RotateCw, ScanEye } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import HealingSection from "../shared/HealingSection";
import { CASE_COLOR } from "../shared/cases";
import { useLoopGate, useStepLoop } from "../shared/useStepLoop";
import { BEATS, LOOP, V3_CASES, beatMs } from "./data";
import Camera, { FRAME, SHOT_COLOR } from "./Camera";

/*
 * Features lab - healing V3 "Close-up": one failure followed by a camera. The
 * storyboard has four shots (it fails, it works out why, it fixes it, it tells
 * you after); the camera starts on the whole board, pushes in on each shot in
 * turn, pulls back, and moves on to the next failure. You can drive the camera
 * (overview or any shot) and switch failures. Reduced motion and the server
 * render show the whole board, complete.
 */
export default function HealingV3() {
  const t = useTranslation().t.featuresLab.healing;
  const ref = useRef<HTMLDivElement>(null);
  const { running } = useLoopGate(ref);
  const [step, setStep] = useStepLoop(LOOP, beatMs, running, 0);
  const caseIdx = Math.floor(step / BEATS);
  const focus = step % BEATS;
  const caseId = V3_CASES[caseIdx];
  const login = caseId === "login";
  const s = t.v3.shots;
  const titles = [s.fails, s.why, login ? s.stops : s.fixes, login ? s.asks : s.after];

  const go = (f: number) => setStep(caseIdx * BEATS + f);
  const next = () => setStep(((caseIdx + 1) % V3_CASES.length) * BEATS + (running ? 1 : 0));
  const k = CASE_COLOR[caseId];

  return (
    <HealingSection lede={t.v3.lede}>
      <div
        ref={ref}
        className="relative mx-auto w-full text-[8px] sm:text-[11px] md:text-[13px] stage:[font-size:clamp(13px,min(calc(100cqh/31.4),calc(100cqw/57)),26px)]"
        style={{ maxWidth: `${FRAME.w}em` }}
      >
        <div
          data-tour-diagram="healing"
          role="img"
          aria-label={t.v3.artLabel}
          style={{ height: `${FRAME.h}em` }}
        >
          <Camera t={t} caseId={caseId} focus={focus} titles={titles} running={running} />
        </div>

        <div className="mt-[0.8em] flex flex-wrap items-center justify-between gap-[0.6em]">
          <span
            className="inline-flex items-center gap-[0.45em] rounded-full border px-[0.8em] py-[0.25em] text-[0.9em] font-semibold text-foreground"
            style={{ borderColor: tint(k, 50), background: tint(k, 12) }}
          >
            <span className="h-[0.55em] w-[0.55em] rounded-full" style={{ background: BRAND_VAR[k] }} />
            {t.cases[caseId].name}
            <span className="ml-[0.3em] font-mono text-[0.8em] font-normal uppercase tracking-[0.14em] text-foreground/60">{t.stylised}</span>
          </span>

          <div role="group" aria-label={t.v3.camera} className="flex items-center gap-[0.35em]">
            <CamButton on={focus === 0} onClick={() => go(0)} label={t.v3.overview}>
              <ScanEye className="h-[1.1em] w-[1.1em]" aria-hidden />
              {t.v3.overview}
            </CamButton>
            {titles.map((title, i) => (
              <CamButton
                key={i}
                on={focus === i + 1}
                onClick={() => go(i + 1)}
                label={t.v3.shotOf.replace("{n}", String(i + 1)).replace("{title}", title)}
                color={login && i >= 2 ? "rose" : SHOT_COLOR[i]}
              >
                <span className="font-mono">{i + 1}</span>
              </CamButton>
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-[0.45em] rounded-full border border-glass px-[0.9em] py-[0.25em] text-[0.9em] font-medium text-foreground/85 transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <RotateCw className="h-[1em] w-[1em]" aria-hidden />
            {t.v3.another}
          </button>
        </div>
      </div>
    </HealingSection>
  );
}

function CamButton({
  on,
  onClick,
  label,
  color = "cyan",
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  color?: BrandKey;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-[2em] min-w-[2em] items-center justify-center gap-[0.4em] rounded-full border px-[0.6em] text-[0.9em] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        borderColor: on ? tint(color, 65) : "var(--border-glass)",
        background: on ? tint(color, 18) : "transparent",
        color: on ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 72%, transparent)",
      }}
    >
      {children}
    </button>
  );
}
