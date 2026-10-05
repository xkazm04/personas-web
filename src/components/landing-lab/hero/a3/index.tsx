"use client";

import { useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import HeroShell from "../shared/a/HeroShell";
import HeroText from "../shared/a/HeroText";
import { useHeroRunning } from "../shared/a/useHeroRunning";
import { A3_CSS } from "./css";
import Ribbons from "./Ribbons";

/**
 * Landing lab - Hero A3 "Weave": one wide braid of light. Strands tangle on the
 * left (events), pinch through a glowing Overseer knot and leave as ordered
 * lanes on the right (teams at work); pulses of light ride the strands.
 * Stylised, not a screenshot.
 */
export default function HeroA3() {
  const { t } = useTranslation();
  const c = t.landingLab.heroA.a3;
  const ref = useRef<HTMLElement>(null);
  const running = useHeroRunning(ref);
  const still = useStillMotion();
  return (
    <HeroShell sectionRef={ref} className="a3-root">
      <style>{A3_CSS}</style>
      <div className="absolute inset-0" data-running={running}>
        <Ribbons
          running={running}
          label={`${c.aria} ${t.landingLab.heroA.stylised}`}
          tags={{ event: c.tagEvent, team: c.tagTeam, overseer: c.tagOverseer }}
        />
      </div>
      {/* Floor of the composition: the weave fades into the typography zone. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-background via-background/85 via-30% to-transparent to-62%" />
      <div className="relative z-10 mx-auto flex w-full flex-1 self-stretch items-end pb-[clamp(2.5rem,7svh,5rem)] stage:max-w-(--stage-max-w)">
        <div className="mx-auto w-full max-w-5xl">
          <HeroText line1={c.line1} line2={c.line2} sub={c.sub} still={still} align="center" scale={0.82} inline eyebrow={false} />
        </div>
      </div>
    </HeroShell>
  );
}
