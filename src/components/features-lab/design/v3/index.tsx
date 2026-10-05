"use client";

import { useRef, useState, type CSSProperties } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useDesignCopy } from "../shared/copy";
import DesignIntro from "../shared/DesignIntro";
import { DIMS, type DimKey } from "../shared/dims";
import LabTourScope from "../shared/LabTourScope";
import ReplayButton from "../shared/ReplayButton";
import { dimPhase, stepOf, type DimPhase } from "../shared/timeline";
import { useBuildClock } from "../shared/useBuildClock";
import Ask from "./Ask";
import { AR, CX, H, STEPS, TYPE_MS, u, W } from "./geometry";
import Labels from "./Labels";
import Ring from "./Ring";
import Sigil from "./Sigil";

const TYPE = stepOf(STEPS, "type");
const READ = stepOf(STEPS, "read");

/**
 * V3 - the flower. The sentence is written around the crown; from it the
 * agent grows as one shape - a petal per decision, in the desktop app's own
 * eight-petal order - each petal annotated with what was decided and where it
 * came from. Personas asks its two questions over the heart of the flower;
 * finished, the core lights and the agent is named.
 */
export function DesignFlower() {
  const copy = useDesignCopy();
  const still = useStillMotion();
  const artRef = useRef<HTMLDivElement>(null);
  const clock = useBuildClock(artRef, STEPS, still);
  const { at, moving, run, done } = clock;
  const [focus, setFocus] = useState<DimKey | null>(null);
  const phases = Object.fromEntries(DIMS.map((d) => [d.key, dimPhase(STEPS, at, d.key)])) as Record<DimKey, DimPhase>;
  const asking = copy.dims.find((d) => phases[d.key] === "asking");

  return (
    <SectionWrapper fit="fill" id="design">
      <DesignIntro copy={copy} lede={copy.lab.v3.lede} />
      <div data-stage-slot className="mt-8 stage:mt-0">
        <div
          ref={artRef}
          data-stage-art
          data-tour-diagram="design"
          className="relative w-full select-none"
          style={{ "--art-ar": AR, aspectRatio: AR, containerType: "inline-size" } as CSSProperties}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-[background] duration-1000"
            style={{ background: `radial-gradient(32% 62% at 50% 50%, color-mix(in srgb, ${done ? "var(--brand-emerald)" : "var(--brand-purple)"} 14%, transparent), transparent 75%)` }}
          />
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={copy.lab.artLabel}>
            <Ring sentence={copy.sentence} dims={copy.dims} typing={at >= TYPE} read={at >= READ} moving={moving} typeMs={TYPE_MS} key={run} />
            <Sigil phases={phases} focus={focus} done={done} moving={moving} pulse={moving && clock.ticking} run={run} />
          </svg>

          <Labels copy={copy} phases={phases} answers={clock.answers} focus={focus} setFocus={setFocus} moving={moving} />
          <Ask copy={copy} asking={asking} moving={moving} onAnswer={clock.answer} />

          {/* the plate's caption: the agent, named */}
          <div className="absolute flex flex-col items-center text-center" style={{ left: u(CX - 80), width: u(160), top: u(H - 62) }}>
            <span
              className="font-semibold text-foreground"
              style={{ fontSize: "max(17px, 1.8cqw)", opacity: done ? 1 : 0, transition: moving ? "opacity .6s .3s" : "none" }}
            >
              {copy.lab.persona}
            </span>
            <span
              className="font-mono uppercase tracking-[0.14em] text-brand-emerald"
              style={{ fontSize: "max(12px, 1.1cqw)", opacity: done ? 1 : 0, transition: moving ? "opacity .6s .6s" : "none" }}
            >
              {copy.lab.ready}
            </span>
          </div>
          <div className="absolute right-0 top-0">
            <ReplayButton label={copy.lab.replay} onClick={clock.replay} />
          </div>
          <span className="absolute bottom-0 left-0 font-mono uppercase tracking-[0.14em] text-foreground/60" style={{ fontSize: "max(12px, 1cqw)" }}>
            {copy.lab.v3.stylised}
          </span>
        </div>
      </div>
    </SectionWrapper>
  );
}

/** The lab slot: the section inside a stand-in tour provider (see LabTourScope). */
export default function LabVariant() {
  return (
    <LabTourScope>
      <DesignFlower />
    </LabTourScope>
  );
}
