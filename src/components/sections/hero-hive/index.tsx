"use client";

import { useRef, type PointerEvent } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import GradientText from "@/components/GradientText";
import HeroShell from "./shared/HeroShell";
import HeroCtas from "./shared/HeroCtas";
import HiveFloor from "./HiveFloor";
import s from "./hive.module.css";
import { landingSectionsCopy } from "@/i18n/pending/landingSections";

/**
 * The landing hero, "Hive" (winner of the 2026-10-05 landing contest): the lower half of the viewport is a honeycomb
 * floor of AI agents seen in perspective, stretching to a lit horizon. Events
 * fall onto it as drops of light, ripple out, and hand off cell to cell along
 * a team until the finished work rises as a pillar ("Booked", "Fixed"). A
 * slow light sweeps the floor (the coaching), and the pointer tilts the
 * whole hive. The headline is a centred poster above the horizon.
 */
export default function HiveHero() {
  const copy = landingSectionsCopy.hero;
  const still = useStillMotion();
  // Loads the hidden-tab class toggle that pauses the floor's CSS loops.
  usePageVisibility();
  const sceneRef = useRef<HTMLDivElement>(null);

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    sceneRef.current?.style.setProperty("--tilt", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
  };

  return (
    <HeroShell labelledBy="hero-heading">
        <div className="absolute inset-0" onPointerMove={still ? undefined : tilt}>
          <div ref={sceneRef} role="img" aria-label={copy.aria} className={s.scene}>
            <HiveFloor />
          </div>
          {/* Horizon light and the fog that owns the headline's sky. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 14% at 50% 50%, color-mix(in oklab, var(--brand-cyan) 22%, transparent), transparent 70%), linear-gradient(to bottom, var(--background) 0%, color-mix(in oklab, var(--background) 90%, transparent) 33%, transparent 49%)",
            }}
          />
        </div>
        <div className="pointer-events-none relative z-10 mx-auto flex w-full flex-col items-center px-6 pt-[9svh] text-center sm:px-10 stage:max-w-(--stage-max-w) stage:pt-[4svh]">
          <h1
            id="hero-heading"
            className="text-[clamp(2.5rem,min(4.8vw,7.6svh),7rem)] font-extrabold leading-[1.02] tracking-tight text-balance text-foreground"
          >
            <span className="whitespace-nowrap">{copy.line1}</span>{" "}
            <GradientText className="whitespace-nowrap pb-2">{copy.line2}</GradientText>
          </h1>
          <p className="mt-[1.6svh] max-w-3xl text-[clamp(1.125rem,min(1.4vw,2.4svh),1.5rem)] leading-snug text-muted-dark">{copy.sub}</p>
          <div className="pointer-events-auto mt-[3svh]">
            <HeroCtas align="center" trust={false} />
          </div>
        </div>
    </HeroShell>
  );
}
