"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import HeroShell from "../shared/a/HeroShell";
import HeroText from "../shared/a/HeroText";
import { useHeroRunning } from "../shared/a/useHeroRunning";
import { A2_CSS } from "./css";
import { EventsArt, OverseerArt, PersonasArt, Plane, TeamsArt } from "./planes";

const BEAMS: [number, number, string][] = [[-0.3, 0.25, "0s"], [0.05, -0.28, "1.1s"], [0.3, 0.1, "2.2s"], [-0.12, -0.05, "0.6s"], [0.2, 0.34, "1.7s"]];

/**
 * Landing lab - Hero A2 "Glass stack": four tilted glass layers (events,
 * personas, teams, Overseer) hover in CSS 3D depth while light climbs through
 * them. The whole rig leans toward the pointer. Stylised, not a screenshot.
 */
export default function HeroA2() {
  const { t } = useTranslation();
  const c = t.landingLab.heroA.a2;
  const ref = useRef<HTMLElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const running = useHeroRunning(ref);
  const still = useStillMotion();
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const rig = rigRef.current;
    if (!running || !rig) return;
    const onMove = (e: PointerEvent) => {
      rig.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      rig.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [running]);

  return (
    <HeroShell sectionRef={ref} className="a2-root">
      <style>{A2_CSS}</style>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_75%_55%,color-mix(in_srgb,var(--brand-purple)_20%,transparent),transparent_70%)]" />
      <div className="a2-stage" role="img" aria-label={`${c.aria} ${t.landingLab.heroA.stylised}`} data-running={running}>
        <div className="a2-anchor">
          <div ref={rigRef} className="a2-rig">
            <Plane z={-0.21} c="var(--brand-cyan)" d="0s" label={c.layerEvents}>
              <EventsArt pat={`${id}p`} />
            </Plane>
            <Plane z={-0.07} c="var(--brand-emerald)" d="0.2s" label={c.layerPersonas}>
              <PersonasArt />
            </Plane>
            <Plane z={0.07} c="var(--brand-purple)" d="0.4s" label={c.layerTeams}>
              <TeamsArt />
            </Plane>
            <Plane z={0.21} c="var(--brand-amber)" d="0.6s" label={c.layerOverseer}>
              <OverseerArt grad={`${id}g`} />
            </Plane>
            {BEAMS.map(([x, y, d]) => (
              <span key={d} className="a2-beam" style={{ "--bx": x, "--by": y, "--bd": d } as CSSProperties} />
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_48%_75%_at_14%_52%,var(--background)_0%,color-mix(in_srgb,var(--background)_60%,transparent)_45%,transparent_100%)]" />
      <div className="relative z-10 mx-auto w-full stage:max-w-(--stage-max-w)">
        <div className="max-w-3xl">
          <HeroText line1={c.line1} line2={c.line2} sub={c.sub} still={still} scale={0.88} />
        </div>
      </div>
      <p className="absolute inset-x-0 bottom-5 z-10 hidden px-5 text-sm text-muted-dark sm:block sm:px-8">
        <span className="mx-auto block stage:max-w-(--stage-max-w)">{t.landingLab.heroA.stylised}</span>
      </p>
    </HeroShell>
  );
}
