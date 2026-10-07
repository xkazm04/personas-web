"use client";

import { useTranslation } from "@/i18n/useTranslation";
import GradientText from "@/components/GradientText";
import HoneycombMark from "@/components/HoneycombMark";
import HeroShell from "./shared/HeroShell";
import HeroCtas from "./shared/HeroCtas";
import MurmurationArt from "./MurmurationArt";
import { landingSectionsCopy } from "@/i18n/pending/landingSections";

/**
 * The /features hero, "Murmuration" (runner-up of the 2026-10-05 landing contest): the viewport is a living swarm of AI
 * agents (canvas). They drift in team clouds, a coach light keeps a thread to
 * every team, and each arriving event pulls the nearest team into a working
 * ring until it is handled. Opens on the swarm assembling the honeycomb mark
 * and bursting into teams (skippable, ~3s). The headline owns the left column
 * behind a scrim. Download and GitHub only: the features tour launcher lives
 * in the Design section's intro. The shell's negative top margin cancels the
 * InfoPageLayout navbar spacer so the hero owns exactly one viewport.
 */
export default function MurmurationHero() {
  const { t } = useTranslation();
  const copy = landingSectionsCopy.featuresHero;
  return (
    <HeroShell labelledBy="features-hero-heading" className="-mt-24 stage:-mt-(--nav-h)">
      <MurmurationArt />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 52% 78% at 14% 56%, color-mix(in srgb, var(--background) 92%, transparent) 0%, color-mix(in srgb, var(--background) 70%, transparent) 45%, transparent 78%)",
        }}
      />
      <div className="pointer-events-none relative z-10 mx-auto flex w-full flex-1 items-center px-6 py-24 sm:px-10 stage:max-w-(--stage-max-w) stage:py-0">
        <div className="max-w-[min(100%,max(52rem,50vw))] text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/50 bg-background/60 px-4 py-1.5 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            <HoneycombMark size={16} />
            {t.hero.badge}
          </p>
          <h1
            id="features-hero-heading"
            className="mt-[3svh] text-[clamp(2.75rem,min(4.6vw,8.2svh),6.5rem)] font-extrabold leading-[1.02] tracking-tight text-balance text-foreground"
          >
            <span className="block">{copy.line1}</span>
            <GradientText className="block pb-2">{copy.line2}</GradientText>
          </h1>
          <p className="mt-[2.4svh] text-[clamp(1.125rem,min(1.5vw,2.6svh),1.5rem)] leading-snug text-muted-dark">{copy.sub}</p>
          <div className="pointer-events-auto mt-[4.5svh]">
            <HeroCtas tour={false} />
          </div>
        </div>
      </div>
    </HeroShell>
  );
}
