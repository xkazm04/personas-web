"use client";

import { useRef } from "react";
import { RotateCcw, Rocket } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { REFINED_VERSION } from "../../../ledger";
import type { LabVariantProps } from "../../types";
import Frame, { BenchKey, Readout, Swatch } from "../parts/Frame";
import Ticker from "../parts/Ticker";
import { canStart, useBenchClock } from "../parts/useBenchClock";
import { instrumentCopy } from "../copy";
import { AFTER_PCT, BEFORE_PCT, SCRIPT_STEPS, TARGET, chatStepMs, diffsApplied } from "./signal";
import ChatScope from "./ChatScope";
import ChatLog from "./ChatLog";

const LAST = SCRIPT_STEPS - 1;

/**
 * Chat as a signal being tuned. The script plays once while the bench is on
 * screen (paused off-screen or on a hidden tab, resumed where it stopped);
 * each applied diff nudges the trace, the replay's measurement settles the
 * readout, and the done state answers "Want me to promote this?" through the
 * ledger. Reduced motion shows the finished run.
 */
export default function ChatBench({ ledger, dispatch }: Omit<LabVariantProps, "active">) {
  const { t } = useTranslation();
  const c = instrumentCopy.chat;
  const ref = useRef<HTMLDivElement>(null);
  const { run, still } = useLoopGate(ref);
  const [step, setStep] = useBenchClock(SCRIPT_STEPS, chatStepMs, run, 0, false);
  const shown = still ? LAST : step;
  const done = shown >= LAST;
  const level = diffsApplied(shown);
  const inBand = done && AFTER_PCT >= TARGET.lo && AFTER_PCT <= TARGET.hi;
  const isLive = ledger.liveId === REFINED_VERSION;

  const replay = () => {
    if (!canStart()) return;
    setStep(0);
  };

  return (
    <div ref={ref} className="stage:h-full">
      <Frame
        channel={1}
        color="cyan"
        title={c.title}
        readouts={
          <>
            <Readout label={c.measured} color={done ? "emerald" : "cyan"}>
              <Ticker value={done ? AFTER_PCT : BEFORE_PCT} from={still ? BEFORE_PCT : 0} decimals={1} suffix="%" />
            </Readout>
            <Readout label={c.target} color="emerald">
              {fillTemplate(c.targetBand, TARGET)}
            </Readout>
          </>
        }
        footer={
          <>
            <span className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-foreground/80">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: inBand ? BRAND_VAR.emerald : BRAND_VAR.amber }}
                />
                {inBand ? c.inBand : c.tuning}
              </span>
              <Swatch color="var(--foreground)" dashed label={c.before} />
              <Swatch color={BRAND_VAR.cyan} label={c.after} />
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <BenchKey color="cyan" onClick={replay} disabled={!done && !still}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {labSectionCopy.chat.replay}
              </BenchKey>
              {done &&
                (isLive ? (
                  <span className="inline-flex h-8 items-center px-1 font-semibold uppercase tracking-wider text-brand-emerald">
                    {fillTemplate(t.labVersions.nowLive, { version: REFINED_VERSION })}
                  </span>
                ) : (
                  <BenchKey color="emerald" onClick={() => dispatch({ type: "activate", id: REFINED_VERSION })}>
                    <Rocket className="h-3.5 w-3.5" aria-hidden />
                    {fillTemplate(t.labVersions.activateVersion, { version: REFINED_VERSION })}
                  </BenchKey>
                ))}
            </span>
          </>
        }
      >
        <div className="grid gap-3 p-3 stage:min-h-0 stage:flex-1 stage:grid-cols-[minmax(0,1fr)_19rem] stage:grid-rows-[minmax(0,1fr)]">
          <ChatScope level={level} done={done} still={still} />
          <ChatLog shown={shown} still={still} />
        </div>
      </Frame>
    </div>
  );
}
