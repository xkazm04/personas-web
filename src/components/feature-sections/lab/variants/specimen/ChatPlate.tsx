"use client";

import { useRef } from "react";
import { Rocket, RotateCcw } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useTranslation } from "@/i18n/useTranslation";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { CHAT_SCRIPT } from "../../data";
import { REFINED_VERSION } from "../../ledger";
import type { LabVariantProps } from "../types";
import { Plate, SpecTag, strainLabel } from "./Plate";
import ChatCell from "./ChatCell";
import ChatNotebook from "./ChatNotebook";
import { useCultureGate, useStepClock } from "./motion";
import { specimenCopy } from "./copy";

const N = CHAT_SCRIPT.length;
/** Pause before entry `s` is written into the notebook. */
const entryMs = (s: number) => (s < N ? 400 + CHAT_SCRIPT[s].delay : 0);

/** How far the cell has changed after `shown` notebook entries. */
function cellPhase(shown: number): number {
  if (shown >= N) return 3;
  return CHAT_SCRIPT.slice(0, shown).filter((m) => m.role === "diff").length;
}

/**
 * Plate I: annotating the specimen. The notebook writes itself while the
 * plate is on screen (paused off-screen, finished under reduced motion); the
 * cell takes each grafted mutation. The done state answers the script's
 * "promote this?" by activating the refined strain from the ledger.
 */
export default function ChatPlate({ ledger, dispatch }: LabVariantProps) {
  const { t } = useTranslation();
  const words = labSectionCopy.chat;
  const copy = specimenCopy.chat;
  const ref = useRef<HTMLDivElement>(null);
  const { still, running } = useCultureGate(ref);
  const [step, , restart] = useStepClock(N + 1, entryMs, running, 0, false);
  const shown = still ? N : step;
  const phase = cellPhase(shown);
  const done = shown >= N;
  const refinedLive = ledger.liveId === REFINED_VERSION;
  const parentStrain = ledger.rows.find((r) => r.id !== REFINED_VERSION)?.id ?? REFINED_VERSION;

  return (
    <Plate
      tab="chat"
      title={copy.title}
      bodyRef={ref}
      status={
        <>
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${running && !done ? "animate-pulse" : ""}`}
            style={{ background: done ? BRAND_VAR.emerald : BRAND_VAR.amber }}
          />
          {done ? copy.stable : copy.observing}
        </>
      }
      footer={
        <>
          <span className="min-w-[10rem] flex-1 truncate rounded-md border border-dashed border-glass px-3 py-1.5 font-serif text-base italic text-foreground/60">
            {words.placeholder}
          </span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={restart}
              disabled={!done || still}
              className="flex h-9 items-center gap-1.5 rounded-md border border-glass px-3 uppercase tracking-wider text-foreground/80 transition-colors hover:border-glass-hover hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {words.replay}
            </button>
            {done &&
              (refinedLive ? (
                <SpecTag color="emerald" solid>
                  {fillTemplate(t.labVersions.nowLive, { version: REFINED_VERSION })}
                </SpecTag>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "activate", id: REFINED_VERSION })}
                  className="flex h-9 items-center gap-1.5 rounded-md border border-brand-emerald/50 bg-brand-emerald/10 px-3 uppercase tracking-wider text-brand-emerald"
                >
                  <Rocket className="h-3.5 w-3.5" aria-hidden />
                  {fillTemplate(t.labVersions.activateVersion, { version: REFINED_VERSION })}
                </button>
              ))}
          </span>
        </>
      }
    >
      <div className="flex h-full flex-col sm:grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <figure
          role="img"
          aria-label={copy.lensLabel}
          className="relative flex h-40 shrink-0 flex-col items-center justify-center gap-2 border-b border-glass p-3 [container-type:size] sm:h-full sm:border-b-0 sm:border-r"
        >
          <ChatCell phase={phase} running={running} still={still} />
          <figcaption className="flex items-center gap-2 font-mono text-sm text-foreground/75">
            <span className="hidden sm:inline">{strainLabel(done ? REFINED_VERSION : parentStrain)}</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span className="font-serif text-base italic text-foreground">{copy.phases[phase]}</span>
          </figcaption>
        </figure>
        <div className="min-h-0 flex-1 sm:h-full">
          <ChatNotebook entries={CHAT_SCRIPT.slice(0, shown)} still={still} />
        </div>
      </div>
    </Plate>
  );
}
