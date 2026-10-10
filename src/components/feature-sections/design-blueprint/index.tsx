"use client";

import { useRef, type CSSProperties } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { useStillMotion } from "@/hooks/useStillMotion";
import { fillTemplate } from "@/lib/fillTemplate";
import { useDesignCopy, valueOf } from "./shared/copy";
import DesignIntro from "./shared/DesignIntro";
import { DIM_BY_KEY, DIMS, type DimKey } from "./shared/dims";
import ReplayButton from "./shared/ReplayButton";
import { machineFor } from "./shared/machine";
import ToolMark from "./shared/ToolMark";
import { dimPhase, stepOf, type DimPhase } from "./shared/timeline";
import { useBuildClock } from "./shared/useBuildClock";
import Band from "./Band";
import Callout, { LABEL_SIZE, textInk, VALUE_SIZE } from "./Callout";
import { AR, CALLOUTS, CORE, H, PLUG_HEAD, PLUGS, STEPS, u, W } from "./geometry";
import Parts from "./Parts";
import { SheetGrid, TitleBlock } from "./Sheet";
import TestRun from "./TestRun";

const TYPE = stepOf(STEPS, "type");
const READ = stepOf(STEPS, "read");
const FINALE = stepOf(STEPS, "finale");

/**
 * "One sentence. One matrix." - the blueprint (winner of the 2026-10-06 /features review). The sentence is the brief at the top of a drawing
 * sheet; Personas draws the agent it describes as the machine it will run as
 * (schedule, agent, apps, memory, review gate, messages, events, error loop),
 * inking each part as it decides it and annotating the decision. Finished,
 * the machine the answers built is test-run and the sheet is stamped ready.
 * Once stamped, either question can be re-answered: the parts re-ink to the
 * new machine and only the finale replays (shared/machine.ts).
 */
export default function DesignBlueprint() {
  const copy = useDesignCopy();
  const still = useStillMotion();
  const artRef = useRef<HTMLDivElement>(null);
  const clock = useBuildClock(artRef, STEPS, still);
  const { at, moving, run, done } = clock;
  const phases = Object.fromEntries(DIMS.map((d) => [d.key, dimPhase(STEPS, at, d.key)])) as Record<DimKey, DimPhase>;
  const asking = copy.dims.find((d) => phases[d.key] === "asking");
  const byKey = Object.fromEntries(copy.dims.map((d) => [d.key, d])) as Record<DimKey, (typeof copy.dims)[number]>;
  const tasks = byKey.tasks;
  const appsInk = phases.apps !== "pending";
  const running = moving && at === FINALE;
  const machine = machineFor(clock.answers);
  const rv = copy.lab.revise;
  const reviseFor = (d: (typeof copy.dims)[number]) =>
    d.question && (d.key === "triggers" || d.key === "review")
      ? {
          short: rv.short[d.key],
          options: d.question.options,
          picked: clock.answers[d.key] ?? d.question.picked,
          offered: clock.stamped,
          groupLabel: fillTemplate(rv.change, { label: d.label }),
          onPick: (i: number) => clock.revise(d.key, i),
        }
      : undefined;

  return (
    <SectionWrapper fit="fill" id="design">
      <DesignIntro copy={copy} lede={copy.lab.v2.lede} />
      <div data-stage-slot className="mt-8 stage:mt-0">
        <div
          ref={artRef}
          data-stage-art
          data-tour-diagram="design"
          className="relative w-full select-none overflow-hidden border"
          style={{
            "--art-ar": AR,
            aspectRatio: AR,
            containerType: "inline-size",
            borderRadius: "1.2cqw",
            borderColor: "color-mix(in srgb, var(--brand-cyan) 28%, transparent)",
            background: "radial-gradient(80% 90% at 35% 45%, color-mix(in srgb, var(--brand-cyan) 7%, transparent), transparent 70%), color-mix(in srgb, var(--background) 82%, transparent)",
          } as CSSProperties}
        >
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={copy.lab.artLabel}>
            <SheetGrid />
            <Parts phases={phases} machine={machine} notNeeded={rv.notNeeded} moving={moving} pulse={moving && clock.ticking} />
            <TestRun machine={machine} shown={done} running={running} run={run} labels={rv} />
          </svg>

          <Band copy={copy} run={clock.build} typing={at >= TYPE} read={at >= READ} asking={asking} moving={moving} onAnswer={clock.answer} />
          <div className="absolute" style={{ right: u(20), top: u(28) }}>
            <ReplayButton label={copy.lab.replay} onClick={clock.replay} />
          </div>

          {/* the agent itself: its task is written inside the core */}
          <div className="absolute flex flex-col" style={{ left: u(CORE.x), top: u(CORE.y), width: u(CORE.w), height: u(CORE.h), padding: `0 ${u(12)}` }}>
            <span className="flex items-center font-mono font-bold uppercase tracking-[0.12em] transition-colors duration-500" style={{ height: u(30), fontSize: LABEL_SIZE, color: phases.tasks !== "pending" ? textInk(tasks.ink) : "color-mix(in srgb, var(--foreground) 62%, transparent)" }}>
              {tasks.label}
            </span>
            <motion.span
              className="mt-[0.6cqw] font-medium leading-snug text-foreground"
              style={{ fontSize: VALUE_SIZE }}
              initial={false}
              animate={{ opacity: phases.tasks === "resolved" ? 1 : 0 }}
              transition={{ duration: moving ? 0.5 : 0, delay: moving ? 0.3 : 0 }}
            >
              {tasks.value}
            </motion.span>
          </div>

          {PLUGS.map((p) => (
            <span key={p.tool} className="absolute flex items-center justify-center" style={{ left: u(p.x - PLUG_HEAD.w / 2), top: u(PLUG_HEAD.top), width: u(PLUG_HEAD.w), height: u(PLUG_HEAD.h) }}>
              <ToolMark name={p.tool} style={{ width: u(18), height: u(18), color: appsInk ? DIM_BY_KEY.apps.ink : "rgba(var(--surface-overlay), 0.25)", transition: "color .6s" }} />
            </span>
          ))}

          {copy.dims
            .filter((d) => d.key !== "tasks")
            .map((d) => (
              <Callout key={d.key} d={d} box={CALLOUTS[d.key as Exclude<DimKey, "tasks">]} phase={phases[d.key]} value={valueOf(d, clock.answers)} source={copy.lab.sources[d.source]} moving={moving} revise={reviseFor(d)} />
            ))}

          <motion.span
            className="absolute flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-foreground/75"
            style={{ left: u(22), top: u(404), fontSize: LABEL_SIZE }}
            initial={false}
            animate={{ opacity: running ? 1 : 0 }}
            transition={{ duration: moving ? 0.4 : 0 }}
          >
            <span className="h-2 w-2 rounded-full bg-brand-cyan" aria-hidden="true" />
            {machine.gate === "urgent-only" ? rv.testRunTwo : copy.lab.v2.testRun}
          </motion.span>
          <p className="sr-only" aria-live="polite">
            {clock.revised ? fillTemplate(rv.rebuilt, { triggers: valueOf(byKey.triggers, clock.answers), review: valueOf(byKey.review, clock.answers) }) : ""}
          </p>
          <TitleBlock copy={copy} done={at > FINALE} moving={moving} />
        </div>
      </div>
    </SectionWrapper>
  );
}

