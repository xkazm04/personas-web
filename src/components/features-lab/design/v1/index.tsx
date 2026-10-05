"use client";

import { useRef, type CSSProperties } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useDesignCopy, valueOf } from "../shared/copy";
import DesignIntro from "../shared/DesignIntro";
import { DIMS, type DimKey } from "../shared/dims";
import LabTourScope from "../shared/LabTourScope";
import ReplayButton from "../shared/ReplayButton";
import { dimPhase, stepOf, type DimPhase } from "../shared/timeline";
import { useBuildClock } from "../shared/useBuildClock";
import Console from "./Console";
import { AR, GRID_H, GRID_TOP, GRID_W, HEAD_H, PAD, PLACE, STEPS } from "./layout";
import Tile from "./Tile";
import Wires from "./Wires";

const TYPE = stepOf(STEPS, "type");
const READ = stepOf(STEPS, "read");
const ASK_MS = STEPS.find((s) => s.kind === "ask")?.ms ?? 5000;

/**
 * V1 - the lit matrix (direct successor). The live 3x3 matrix with the
 * sentence at its centre, rebuilt as a lit instrument: the sentence is typed
 * and read, each decision is wired out from it and "develops" its picture
 * from grey to colour as it lands, and the two questions are asked in the
 * centre with real buttons.
 */
export function DesignMatrixLit() {
  const copy = useDesignCopy();
  const still = useStillMotion();
  const artRef = useRef<HTMLDivElement>(null);
  const clock = useBuildClock(artRef, STEPS, still);
  const { at, moving, run, done } = clock;

  const phases = Object.fromEntries(DIMS.map((d) => [d.key, dimPhase(STEPS, at, d.key)])) as Record<DimKey, DimPhase>;
  const asking = copy.dims.find((d) => phases[d.key] === "asking");
  const lit = () => at >= READ;
  const status = done
    ? copy.decided(DIMS.length)
    : asking
      ? copy.lab.asks
      : at === TYPE || at === READ
        ? copy.lab.reading
        : copy.title;

  return (
    <SectionWrapper fit="fill" id="design">
      <DesignIntro copy={copy} lede={<>{copy.lede} <span className="font-medium text-foreground">{copy.ledeStrong}</span></>} />
      <div data-stage-slot className="mt-8 stage:mt-0">
        <div
          ref={artRef}
          data-stage-art
          data-tour-diagram="design"
          className="force-dark relative w-full select-none overflow-hidden border border-foreground/10 bg-background/95"
          style={{ "--art-ar": AR, aspectRatio: AR, containerType: "inline-size", borderRadius: "1.6cqw", boxShadow: "0 0 80px rgba(0,0,0,0.4)" } as CSSProperties}
        >
          <div role="img" aria-label={copy.lab.artLabel} className="absolute inset-0" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-foreground/[0.07]" style={{ height: `${HEAD_H}cqw`, padding: "0 1.6cqw" }}>
            <span className="font-semibold text-foreground" style={{ fontSize: "max(16px, 1.4cqw)" }}>
              {copy.title}
            </span>
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-2 font-mono uppercase tracking-wider text-foreground/75" style={{ fontSize: "max(12px, 1.05cqw)" }}>
                <span
                  className="h-2 w-2 rounded-full transition-colors"
                  style={{ backgroundColor: done ? "var(--brand-emerald)" : at >= 0 ? "var(--brand-amber)" : "rgba(var(--surface-overlay), 0.25)" }}
                />
                {done ? copy.lab.ready : copy.decided(DIMS.filter((d) => phases[d.key] === "resolved").length)}
              </span>
              <ReplayButton label={copy.lab.replay} onClick={clock.replay} />
            </span>
          </div>

          <div className="absolute" style={{ top: `${GRID_TOP}cqw`, left: `${PAD}cqw`, width: `${GRID_W}cqw`, height: `${GRID_H}cqw` }}>
            <div className="relative h-full w-full">
              {/* the sentence's light, spilling into the gutters */}
              <div
                aria-hidden="true"
                className="absolute inset-0 transition-[background] duration-1000"
                style={{ background: `radial-gradient(40% 55% at 50% 50%, color-mix(in srgb, ${done ? "var(--brand-emerald)" : "var(--brand-purple)"} 30%, transparent), transparent 75%)` }}
              />
              {copy.dims.map((d) => (
                <Tile
                  key={d.key}
                  d={d}
                  rect={PLACE[d.key]}
                  phase={phases[d.key]}
                  value={valueOf(d, clock.answers)}
                  source={copy.lab.sources[d.source]}
                  moving={moving}
                  pulse={moving && clock.ticking}
                />
              ))}
              <Console
                copy={copy}
                run={run}
                typing={at >= TYPE}
                lit={lit}
                asking={asking}
                askMs={ASK_MS}
                countdown={moving && clock.ticking}
                resolved={(k) => phases[k] === "resolved"}
                done={done}
                status={status}
                moving={moving}
                onAnswer={clock.answer}
              />
              <Wires phases={phases} moving={moving} run={run} />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

/** The lab slot: the section inside a stand-in tour provider (see LabTourScope). */
export default function LabVariant() {
  return (
    <LabTourScope>
      <DesignMatrixLit />
    </LabTourScope>
  );
}
