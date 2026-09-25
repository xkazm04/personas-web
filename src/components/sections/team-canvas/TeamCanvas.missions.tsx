"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { Code, Compass, Eye, ShieldCheck } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { TeamCanvasShell, ReplayButton, artStyle, usePlayOnce } from "./TeamCanvas.shared";
import { MissionRow, PersonaIcon, PhaseHeader, StepRow, type StepStatus } from "./TeamCanvas.missions.parts";

/*
 * /illustrate 1.2.0 round 3, variant "missions" (product-true): the app's
 * Goals -> Missions view (GoalsMissions.tsx), reduced to two missions and one
 * mission's four steps. Statuses advance the way the app polls them: Scope,
 * Build, then Review and Test together; QA bounces the PR, Build re-runs, the QA
 * step shows "round 2", and the mission moves from Running to Landed.
 * Rests at the finished mission (p = 1) for first paint and reduced motion.
 */

const WORDS = {
  lede: "Each goal becomes a mission you can watch: every step, the agent on it, and its status. A PR that QA sends back shows its round, and the mission lands when all steps are done.",
  artLabel:
    "The Missions view: the mission Add CSV export to Reports is Landed. Its steps, Scope by Solution Architect, Build PR by Dev Clone, Review by Code Reviewer and Test PR by QA Guardian in round 2, are all done. Weekly digest is active and Billing migration needs review.",
  active: "Active",
  needsReview: "Needs review",
  landed: "Landed",
  running: "Running",
  activeMission: "Weekly digest",
  otherMission: "Billing migration",
  railMission: "CSV export",
  mission: "Add CSV export to Reports",
  round: "round 2",
  steps: [
    { title: "Scope", persona: "Solution Architect", tone: "purple" },
    { title: "Build PR", persona: "Dev Clone", tone: "cyan" },
    { title: "Review", persona: "Code Reviewer", tone: "amber" },
    { title: "Test PR", persona: "QA Guardian", tone: "emerald" },
  ],
} as const;

const ICONS = [Compass, Code, Eye, ShieldCheck];
const DURATION = 6;
type Beat = [number, number, StepStatus];
/* Beats per step; outside every range a step is pending.
 * Scope 0.05-0.20 | Build 0.20-0.38, rework 0.56-0.68 | Review and Test together
 * 0.38-0.52 | QA bounces 0.52-0.56 | Test re-runs 0.68-0.86 | Landed 0.90 */
const BEATS: Beat[][] = [
  [[0.05, 0.2, "running"], [0.2, 9, "done"]],
  [[0.2, 0.38, "running"], [0.38, 0.56, "done"], [0.56, 0.68, "running"], [0.68, 9, "done"]],
  [[0.38, 0.5, "running"], [0.5, 9, "done"]],
  [[0.38, 0.52, "running"], [0.52, 0.56, "failed"], [0.68, 0.86, "running"], [0.86, 9, "done"]],
];
const ROUND_AT = 0.56;
const LANDED_AT = 0.9;

const statusAt = (beats: Beat[], v: number): StepStatus => beats.find(([a, b]) => v >= a && v < b)?.[2] ?? "pending";
const OTHER: StepStatus[] = ["done", "done", "failed"];
const ACTIVE: StepStatus[] = ["done", "running", "pending"];

export default function TeamCanvasMissions() {
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlayOnce(ref, DURATION);
  // The DOM view re-renders on beat changes only (p quantized to hundredths).
  const [v, setV] = useState(1);
  useMotionValueEvent(p, "change", (x) => setV(Math.round(x * 100) / 100));

  const statuses = BEATS.map((b) => statusAt(b, v));
  const landed = v >= LANDED_AT;
  const headTone: BrandKey = landed ? "emerald" : "blue";
  // The mission moves from Active to Landed in the rail when its last step lands.
  const csv = <MissionRow layoutId="team-canvas-csv" title={WORDS.railMission} dots={statuses} selected />;

  return (
    <TeamCanvasShell lede={WORDS.lede}>
      <div ref={ref} data-stage-art data-stage-zoom style={artStyle(2, 690)} className="relative mx-auto w-full">
        <div
          data-illustrate-art
          role="img"
          aria-label={WORDS.artLabel}
          className="grid grid-cols-1 overflow-hidden rounded-2xl border border-glass sm:grid-cols-[13.5rem_1fr]"
          style={{ backgroundColor: "rgba(var(--surface-overlay), 0.02)" }}
        >
          {/* Phase rail: missions from every team, grouped by phase. */}
          <div className="hidden space-y-3 border-r border-glass p-4 sm:block" style={{ backgroundColor: "rgba(var(--surface-overlay), 0.02)" }}>
            <div>
              <PhaseHeader label={WORDS.active} tone="blue" />
              <div className="space-y-1.5">
                <MissionRow title={WORDS.activeMission} dots={ACTIVE} />
                {!landed && csv}
              </div>
            </div>
            <div>
              <PhaseHeader label={WORDS.needsReview} tone="amber" />
              <MissionRow title={WORDS.otherMission} dots={OTHER} />
            </div>
            <div>
              <PhaseHeader label={WORDS.landed} tone="emerald" />
              {landed && csv}
            </div>
          </div>

          {/* The focused mission: its step relay. */}
          <div className="p-4 sm:px-6 sm:py-5">
            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mb-4">
              <h3 className="w-full text-[14px] font-semibold text-foreground sm:mr-auto sm:w-auto sm:text-[16px]">{WORDS.mission}</h3>
              {/* The mission's persona stack. */}
              <span className="flex -space-x-1.5">
                {WORDS.steps.map((s, i) => (
                  <PersonaIcon key={s.persona} icon={ICONS[i]} tone={s.tone} ring />
                ))}
              </span>
              <span
                className="ml-auto shrink-0 rounded-full border px-2.5 py-0.5 text-[13px] font-medium transition-colors duration-300 sm:ml-0"
                style={{ color: BRAND_VAR[headTone], borderColor: tint(headTone, 35), backgroundColor: tint(headTone, 12) }}
              >
                {landed ? WORDS.landed : WORDS.running}
              </span>
            </div>
            <ol>
              {WORDS.steps.map((s, i) => (
                <StepRow
                  key={s.title}
                  status={statuses[i]}
                  title={s.title}
                  persona={s.persona}
                  tone={s.tone}
                  icon={ICONS[i]}
                  round={i === 3 && v >= ROUND_AT ? WORDS.round : undefined}
                  last={i === WORDS.steps.length - 1}
                />
              ))}
            </ol>
          </div>
        </div>
        <ReplayButton onClick={play} disabled={still} corner="bottom" />
      </div>
    </TeamCanvasShell>
  );
}
