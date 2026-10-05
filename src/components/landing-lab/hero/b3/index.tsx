"use client";

import { useRef, type PointerEvent } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import GradientText from "@/components/GradientText";
import HeroShell from "../shared/b/HeroShell";
import HeroCtas from "../shared/b/HeroCtas";
import LabTour from "../shared/b/LabTour";
import TunnelScene from "./TunnelScene";

/**
 * Landing lab - Hero B3 "Depth": the viewport is a view down into your own
 * machine. Out of a breathing core, rings - teams of AI agents - fly toward
 * you through a stream of sparks; each names the job it carries as it nears
 * ("Inbox triage", "Code review") and turns to "Delivered" as it arrives.
 * The pointer steers the vanishing point. Headline bottom-left, behind a
 * scrim that owns the corner.
 */
export default function LabVariant() {
  const { t } = useTranslation();
  const copy = t.landingLab.heroB.b3;
  const still = useStillMotion();
  // Loads the hidden-tab class toggle that pauses the tunnel's CSS loops.
  usePageVisibility();
  const sceneRef = useRef<HTMLDivElement>(null);

  const steer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const el = sceneRef.current;
    if (!el) return;
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  return (
    <LabTour>
      <HeroShell labelledBy="hero-b3-heading">
        <div className="absolute inset-0" onPointerMove={still ? undefined : steer}>
          <TunnelScene ref={sceneRef} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 62% 66% at 6% 94%, color-mix(in oklab, var(--background) 96%, transparent) 0%, color-mix(in oklab, var(--background) 82%, transparent) 50%, transparent 82%), radial-gradient(ellipse 120% 100% at 64% 42%, transparent 55%, color-mix(in oklab, var(--background) 70%, transparent) 100%)",
            }}
          />
        </div>
        <div className="pointer-events-none relative z-10 mx-auto flex w-full flex-1 items-end px-6 pb-[8svh] pt-24 sm:px-10 stage:max-w-(--stage-max-w) stage:pt-0">
          <div className="max-w-[min(100%,max(46rem,48vw))] text-center lg:text-left">
            <h1
              id="hero-b3-heading"
              className="text-[clamp(2.75rem,min(5.6vw,9.4svh),7.5rem)] font-extrabold leading-[0.98] tracking-tight text-balance text-foreground"
            >
              <span className="block">{copy.line1}</span>
              <GradientText className="block pb-2">{copy.line2}</GradientText>
            </h1>
            <p className="mt-[2svh] max-w-2xl text-[clamp(1.125rem,min(1.4vw,2.4svh),1.5rem)] leading-snug text-muted-dark">{copy.sub}</p>
            <div className="pointer-events-auto mt-[3.6svh]">
              <HeroCtas />
            </div>
          </div>
        </div>
      </HeroShell>
    </LabTour>
  );
}
