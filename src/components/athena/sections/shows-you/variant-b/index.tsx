"use client";

// PROTOTYPE COPY — extract to src/i18n at assembly

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION, ANNOTATION_DIM, HEADLINE } from "@/components/athena/stage/athena-tokens";
import WorldUI from "./WorldUI";
import { GuideOrb, InsetMap, ProgressRail, TargetBrackets } from "./SceneParts";
import {
  COPY,
  CYCLE,
  INITIAL_TICK,
  STOPS,
  TICK_MS,
  WORLD,
  activeStopIndex,
  cameraAt,
  orbAt,
  resolvedCount,
} from "./data";

/**
 * "She shows you how" — variant B, "First person".
 *
 * Same walkthrough story as a scripted scene, but the CAMERA is the
 * difference: the stylized app UI is an SVG world larger than the frame,
 * and the whole scene's transform travels with Athena. Each stop the
 * camera glides and gently zooms to frame the target control up close
 * (ease-out arrival, a breath of hold, push off); between stops it pulls
 * back to reveal the whole UI — orientation, then focus again. Brackets
 * snap onto each target, her caption rides beside her, and a segmented
 * progress rail stays fixed at the frame's bottom edge. The UI never
 * dims, never blocks — she leads, you keep the wheel.
 *
 * DevToolsGrid baseline: deterministic tick clock, choreography as data
 * (stops with arrive/depart + pure cameraAt/orbAt), words only in-scene.
 * Reduced motion: NO interval, NO travel — pinned mid-scene at the
 * toggle stop, with a corner inset map standing in for camera movement.
 *
 * Wrapped in AthenaStage for the dev preview; the wrapper unwraps at
 * assembly (the /athena page owns one stage for all sections).
 */
export default function ShowsYouFirstPerson() {
  const reduced = useReducedMotion() ?? false;
  const [tick, setTick] = useState(INITIAL_TICK);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const cam = cameraAt(phase);
  const orb = orbAt(phase);
  const active = activeStopIndex(phase);
  const resolved = resolvedCount(phase);
  const activeStop = active >= 0 ? STOPS[active] : null;
  // The toggle flips mid-stop-2 — she shows it, then it happens.
  const toggleOn = phase >= STOPS[1].arrive + 2;

  // Camera as a viewBox-equivalent transform on the world group:
  // translate so the target lands at the viewBox center, then scale.
  const tx = WORLD.w / 2 - cam.x * cam.zoom;
  const ty = WORLD.h / 2 - cam.y * cam.zoom;

  return (
    <AthenaStage>
      <section className="relative min-h-dvh w-full overflow-hidden" aria-label={COPY.sceneAria}>
        {/* The world — full-bleed; `slice` keeps it edge-to-edge at 375→1440 */}
        <svg
          viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <motion.g
            style={{ transformOrigin: "0px 0px" }}
            initial={false}
            animate={{ x: tx, y: ty, scale: cam.zoom }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <WorldUI toggleOn={toggleOn} deployHot={activeStop?.id === "deploy"} reduced={reduced} />
            <AnimatePresence>
              {activeStop && (
                <TargetBrackets key={activeStop.id} rect={activeStop.target} reduced={reduced} />
              )}
            </AnimatePresence>
            <GuideOrb
              x={orb.x}
              y={orb.y}
              caption={orb.caption}
              captionW={activeStop?.captionW ?? 120}
              locked={orb.locked}
              reduced={reduced}
            />
          </motion.g>
        </svg>

        {/* HEADLINE corner — the one owned text band; art never fights it */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 max-w-xl p-6 sm:p-10">
          <div
            className="absolute -inset-x-10 -top-10 bottom-0 bg-gradient-to-b from-background/90 via-background/60 to-transparent"
            aria-hidden="true"
          />
          <p className={`relative ${ANNOTATION}`}>{COPY.eyebrow}</p>
          <h2 className={`relative mt-3 ${HEADLINE}`}>{COPY.headline}</h2>
        </div>

        {/* Reduced motion: inset map of the whole UI instead of camera travel */}
        {reduced && (
          <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-8">
            <InsetMap cam={cam} />
          </div>
        )}

        {/* Fixed bottom band — mono status + progress rail; does NOT travel */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div
            className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent"
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-3 px-6 pb-6 pt-2 sm:px-10 sm:pb-8">
            <span className={ANNOTATION_DIM}>{COPY.statusLine}</span>
            <ProgressRail activeIndex={active} resolved={resolved} reduced={reduced} />
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}
