"use client";

import { useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import HeroShell from "../shared/a/HeroShell";
import HeroText from "../shared/a/HeroText";
import SignalCanvas from "./SignalCanvas";

/**
 * Landing lab - Hero A1 "Signal field": a full-viewport canvas where events
 * stream in, land on personas that work in teams, and results flow back to an
 * Overseer whose sweep coaches the field. Stylised, not a screenshot.
 */
export default function HeroA1() {
  const { t } = useTranslation();
  const c = t.landingLab.heroA.a1;
  const ref = useRef<HTMLElement>(null);
  const still = useStillMotion();
  const legend = [
    { dot: "bg-brand-cyan", label: c.legendEvents },
    { dot: "bg-brand-emerald", label: c.legendAgents },
    { dot: "bg-brand-amber", label: c.legendOverseer },
  ];
  return (
    <HeroShell sectionRef={ref}>
      <SignalCanvas label={`${c.aria} ${t.landingLab.heroA.stylised}`} />
      {/* Scrim: owns the typography zone so the field never fights the words. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_80%_at_16%_52%,var(--background)_0%,color-mix(in_srgb,var(--background)_65%,transparent)_42%,transparent_100%)]"
      />
      <div className="relative z-10 mx-auto w-full stage:max-w-(--stage-max-w)">
        <div className="max-w-3xl">
          <HeroText line1={c.line1} line2={c.line2} sub={c.sub} still={still} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-5 z-10 hidden px-5 sm:block sm:px-8">
        <ul className="mx-auto flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm uppercase tracking-wider text-muted-dark stage:max-w-(--stage-max-w)">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${l.dot}`} aria-hidden="true" />
              {l.label}
            </li>
          ))}
          <li className="normal-case tracking-normal">{t.landingLab.heroA.stylised}</li>
        </ul>
      </div>
    </HeroShell>
  );
}
