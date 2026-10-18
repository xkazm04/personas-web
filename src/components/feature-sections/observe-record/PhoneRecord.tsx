"use client";

import type { CSSProperties, RefObject } from "react";
import type { MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { ArtBox, frame } from "./shared/Stage";
import Statement from "./Statement";
import Tape from "./Tape";
import { AGENTS, TAPE } from "./log";
import { observeSectionCopy } from "@/i18n/pending/observeSection";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

/* "On the record" below the desktop stage. The 1200x600 art cannot keep its
 * text floors in a narrow box, so it stacks instead: the fleet as a row of
 * chips (same isolate-one-agent behaviour), the tape at full width in its own
 * box (the cables and printer drop out), then the day's statement in flow. */

const TAPE_W = TAPE.w + TAPE.margin;
const { fs } = frame(TAPE_W, TAPE.h);
const TAPE_BOX: CSSProperties = { position: "absolute", inset: 0, ...fs(16, 14) };
const STATEMENT_BOX: CSSProperties = { position: "relative", height: "26em", fontSize: "15px" };
const CHIP =
  "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan";

export default function PhoneRecord({
  clock,
  agent,
  onPick,
  boxRef,
}: {
  clock: MotionValue<number>;
  agent: number | null;
  onPick: (i: number | null) => void;
  boxRef: RefObject<HTMLDivElement | null>;
}) {
  const c = featuresSectionsCopy.observe.v3;
  return (
    <div className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-5">
      <div role="group" aria-label={c.artLabel} className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          aria-pressed={agent === null}
          onClick={() => onPick(null)}
          className={`${CHIP} font-mono uppercase tracking-wider ${agent === null ? "border-brand-cyan/60 bg-brand-cyan/10 text-brand-cyan" : "border-glass text-foreground/75"}`}
        >
          {c.allAgents}
        </button>
        {AGENTS.map((a, i) => {
          const color = BRAND_VAR[a.brand];
          const active = agent === i;
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(active ? null : i)}
              className={`${CHIP} text-foreground ${active ? "" : "border-glass bg-foreground/[0.03]"}`}
              style={active ? { borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` } : undefined}
            >
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              {observeSectionCopy.agents[a.id]}
            </button>
          );
        })}
      </div>
      <ArtBox w={TAPE_W} h={TAPE.h} boxRef={boxRef}>
        <Tape clock={clock} agent={agent} box={TAPE_BOX} />
      </ArtBox>
      <Statement clock={clock} agent={agent} box={STATEMENT_BOX} />
    </div>
  );
}
