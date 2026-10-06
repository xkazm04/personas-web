"use client";

import { useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { useStepper } from "../shared/useStepper";
import Circuit from "./Circuit";
import AgentNode from "./AgentNode";
import Endpoint from "./Endpoint";
import Picker from "./Picker";
import { SCENARIOS, type ScenarioId } from "./scenarios";
import { AGENTS, ART_AR, FINAL_PHASE, OUTPUT, PHASE_MS, TRIGGER, agentState, elapsedAt, type SlotId } from "./geometry";

/** Three scenarios back to back: the stepper walks all of them, then wraps. */
const ALL_PHASES = SCENARIOS.flatMap(() => PHASE_MS);
const SLOTS: SlotId[] = ["a1", "a2", "a3", "a4"];
const WORK_MS: Record<SlotId, number> = { a1: PHASE_MS[2], a2: PHASE_MS[4], a3: PHASE_MS[4], a4: PHASE_MS[6] };

/**
 * Events - V2, the chain reaction. One event plugs into a shared hub; the
 * agent listening for it wakes, works, and hands its result back to the hub,
 * which wakes the next two at once, and so on until the result lands in a
 * real tool. The visitor picks the event; the counters say what it cost them.
 */
export default function EventsV2() {
  const copy = useTranslation().t.howLab.events;
  const uid = useId();
  const artRef = useRef<HTMLDivElement>(null);
  const { run, still } = useLoopGate(artRef, { rootMargin: "100px" });
  const [pick, setPick] = useState({ index: 0, n: 0 });
  const step = useStepper(run, ALL_PHASES, `${pick.index}:${pick.n}`);

  const scenario = SCENARIOS[(pick.index + Math.floor(step / PHASE_MS.length)) % SCENARIOS.length];
  const phase = still ? FINAL_PHASE : step % PHASE_MS.length;
  const words = copy.v2.scenarios[scenario.id];
  const tone = BRAND_VAR[scenario.brand];
  const woke = SLOTS.filter((s) => agentState(s, phase) !== "listening").length;
  const choose = (id: ScenarioId) => setPick((p) => ({ index: SCENARIOS.findIndex((s) => s.id === id), n: p.n + 1 }));

  const stats: [string, string][] = [
    ["0", copy.v2.byYou],
    [String(woke), copy.v2.agentsWoke],
    [`${elapsedAt(phase).toFixed(1)} s`, copy.v2.endToEnd],
  ];

  return (
    <SectionWrapper fit="fill" id="event-bus">
      <SectionIntro heading={copy.heading} gradient={copy.headingGradient} description={copy.description} descriptionMaxWidth="max-w-3xl" />
      <motion.div variants={fadeUp} data-stage-slot className="flex w-full flex-col gap-[clamp(0.5rem,2cqh,1.5rem)]">
        <div data-stage-zoom className="flex justify-center">
          <Picker active={scenario.id} onPick={choose} />
        </div>

        <div className="relative min-h-0 flex-1 overflow-x-auto stage:overflow-visible stage:[container-type:size]">
          <div
            ref={artRef}
            role="img"
            aria-label={copy.v2.illustration}
            className="relative mx-auto aspect-[12/5] w-full min-w-[52rem] stage:min-w-0 stage:w-[min(100%,calc(100cqh*var(--chain-ar)))] [container-type:inline-size]"
            style={{ ["--chain-ar" as string]: ART_AR }}
          >
            <Circuit uid={uid} phase={phase} run={run} tone={tone} />
            <dl className="absolute right-0 top-0 flex flex-col items-end gap-[0.6cqw] font-mono">
              {stats.map(([value, label]) => (
                <div key={label} className="flex items-baseline gap-[0.8cqw]">
                  <dt className="text-[clamp(12px,1.2cqw,22px)] text-muted">{label}</dt>
                  <dd className="min-w-[3.2em] text-right text-[clamp(18px,2.4cqw,44px)] font-semibold tabular-nums" style={{ color: tone }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <span
              className="absolute whitespace-nowrap font-mono text-[clamp(12px,1.15cqw,20px)] uppercase tracking-wider"
              style={{ left: "16%", top: "57%", color: tone }}
            >
              {copy.v2.hub}
              <span className="ml-[0.8cqw] normal-case tracking-normal text-muted">{copy.v2.hubHint}</span>
            </span>
            <Endpoint x={TRIGGER.x} y={TRIGGER.y} tool={scenario.triggerTool} label={words.trigger} lit pulse={phase === 0} run={run} tone={tone} />
            <Endpoint x={OUTPUT.x} y={OUTPUT.y} tool={scenario.outputTool} label={words.out} lit={phase === FINAL_PHASE} pulse={phase === FINAL_PHASE} run={run} tone={tone} />
            {SLOTS.map((slot) => (
              <AgentNode
                key={slot}
                {...AGENTS[slot]}
                Icon={scenario.icons[slot]}
                name={words[slot]}
                result={words[`r${slot.slice(1)}` as "r1"]}
                state={agentState(slot, phase)}
                workMs={WORK_MS[slot]}
                run={run}
                tone={tone}
                listening={copy.v2.listening}
                working={copy.v2.working}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
