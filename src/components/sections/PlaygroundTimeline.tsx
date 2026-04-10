"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Mail,
  Github,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
  Search,
  Cpu,
  Wrench,
  Zap,
  Sparkles,
  FileOutput,
  RotateCcw,
  Gauge,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp, staggerContainer } from "@/lib/animations";

import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

interface TimelineStage {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  timing: string; // e.g., "+0.0s"
  duration: number; // ms to stay active before marking done
}

interface ExamplePrompt {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  prompt: string;
  stages: TimelineStage[];
}

type StageStatus = "locked" | "active" | "done";

const examples: ExamplePrompt[] = [
  {
    label: "Triage my Gmail",
    icon: Mail,
    iconColor: "#ea4335",
    prompt: "Triage my Gmail inbox and draft replies for urgent emails",
    stages: [
      {
        id: "input",
        label: "Input",
        icon: ArrowRight,
        description: "Received natural language instruction",
        timing: "+0.0s",
        duration: 400,
      },
      {
        id: "parse",
        label: "Parse",
        icon: Search,
        description: "Intent: email_triage + auto_reply",
        timing: "+0.4s",
        duration: 600,
      },
      {
        id: "plan",
        label: "Plan",
        icon: Cpu,
        description: "Strategy: fetch, classify, draft",
        timing: "+1.0s",
        duration: 500,
      },
      {
        id: "tool1",
        label: "Gmail API",
        icon: Mail,
        description: "Fetched 47 unread messages",
        timing: "+1.5s",
        duration: 800,
      },
      {
        id: "tool2",
        label: "NLP Classifier",
        icon: Sparkles,
        description: "8 urgent, 12 follow-up, 19 FYI, 8 spam",
        timing: "+2.3s",
        duration: 700,
      },
      {
        id: "synthesize",
        label: "Synthesize",
        icon: Zap,
        description: "Drafting 8 replies, applying labels",
        timing: "+3.0s",
        duration: 600,
      },
      {
        id: "output",
        label: "Output",
        icon: FileOutput,
        description: "8 drafts saved, 8 labels applied, 8 spam archived.",
        timing: "+3.6s",
        duration: 500,
      },
    ],
  },
  {
    label: "Review this PR",
    icon: Github,
    iconColor: "#8b5cf6",
    prompt: "Review PR #142 for bugs, style issues, and missing tests",
    stages: [
      {
        id: "input",
        label: "Input",
        icon: ArrowRight,
        description: "Received code review request",
        timing: "+0.0s",
        duration: 400,
      },
      {
        id: "parse",
        label: "Parse",
        icon: Search,
        description: "Intent: code_review",
        timing: "+0.4s",
        duration: 500,
      },
      {
        id: "plan",
        label: "Plan",
        icon: Cpu,
        description: "Strategy: fetch diff, analyze AST, scan tests",
        timing: "+0.9s",
        duration: 500,
      },
      {
        id: "tool1",
        label: "GitHub API",
        icon: Github,
        description: "PR #142: 14 files, +342 / -89",
        timing: "+1.4s",
        duration: 900,
      },
      {
        id: "tool2",
        label: "AST Analyzer",
        icon: Search,
        description: "2 null derefs, 3 naming issues",
        timing: "+2.3s",
        duration: 800,
      },
      {
        id: "synthesize",
        label: "Synthesize",
        icon: Zap,
        description: "Composing 6 inline comments",
        timing: "+3.1s",
        duration: 600,
      },
      {
        id: "output",
        label: "Output",
        icon: FileOutput,
        description: "Review posted: 2 bugs, 3 style notes, 1 test gap.",
        timing: "+3.7s",
        duration: 500,
      },
    ],
  },
  {
    label: "Summarize Slack",
    icon: MessageSquare,
    iconColor: "#4a154b",
    prompt: "Summarize #engineering and #product channels from the last 24h",
    stages: [
      {
        id: "input",
        label: "Input",
        icon: ArrowRight,
        description: "Received digest request",
        timing: "+0.0s",
        duration: 400,
      },
      {
        id: "parse",
        label: "Parse",
        icon: Search,
        description: "Intent: channel_digest",
        timing: "+0.4s",
        duration: 500,
      },
      {
        id: "plan",
        label: "Plan",
        icon: Cpu,
        description: "Strategy: fetch channels, summarize",
        timing: "+0.9s",
        duration: 500,
      },
      {
        id: "tool1",
        label: "Slack API",
        icon: MessageSquare,
        description: "210 messages, 23 threads from 2 channels",
        timing: "+1.4s",
        duration: 800,
      },
      {
        id: "tool2",
        label: "Summarizer",
        icon: Sparkles,
        description: "3 key decisions, 2 action items",
        timing: "+2.2s",
        duration: 700,
      },
      {
        id: "synthesize",
        label: "Synthesize",
        icon: Zap,
        description: "Formatting digest with action items",
        timing: "+2.9s",
        duration: 600,
      },
      {
        id: "output",
        label: "Output",
        icon: FileOutput,
        description: "Digest posted to #my-digest with action items.",
        timing: "+3.5s",
        duration: 500,
      },
    ],
  },
  {
    label: "Optimize my schedule",
    icon: Calendar,
    iconColor: "#06b6d4",
    prompt: "Analyze next week's calendar and block focus time",
    stages: [
      {
        id: "input",
        label: "Input",
        icon: ArrowRight,
        description: "Received schedule optimization request",
        timing: "+0.0s",
        duration: 400,
      },
      {
        id: "parse",
        label: "Parse",
        icon: Search,
        description: "Intent: schedule_optimize",
        timing: "+0.4s",
        duration: 500,
      },
      {
        id: "plan",
        label: "Plan",
        icon: Cpu,
        description: "Strategy: load calendar, find gaps, block time",
        timing: "+0.9s",
        duration: 500,
      },
      {
        id: "tool1",
        label: "Calendar API",
        icon: Calendar,
        description: "20h meetings across 5 days loaded",
        timing: "+1.4s",
        duration: 800,
      },
      {
        id: "tool2",
        label: "Schedule Analyzer",
        icon: Wrench,
        description: "Mon & Wed exceed 4h threshold",
        timing: "+2.2s",
        duration: 700,
      },
      {
        id: "synthesize",
        label: "Synthesize",
        icon: Zap,
        description: "Creating 3 focus time blocks",
        timing: "+2.9s",
        duration: 600,
      },
      {
        id: "output",
        label: "Output",
        icon: FileOutput,
        description: "3 focus blocks added (6h total). Conflicts: 0.",
        timing: "+3.5s",
        duration: 500,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Stage Card                                                         */
/* ------------------------------------------------------------------ */

function StageCard({
  stage,
  status,
  index,
  isOutput,
  reduced,
}: {
  stage: TimelineStage;
  status: StageStatus;
  index: number;
  isOutput: boolean;
  reduced: boolean;
}) {
  const Icon = stage.icon;

  return (
    <motion.div
      layout
      className={`relative flex-shrink-0 rounded-2xl border transition-all duration-500 ${
        status === "active"
          ? "w-52 border-brand-cyan/40 bg-brand-cyan/[0.06] shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-105"
          : status === "done"
          ? isOutput
            ? "w-48 border-brand-emerald/30 bg-brand-emerald/[0.06]"
            : "w-48 border-brand-emerald/20 bg-white/[0.02]"
          : "w-44 border-white/[0.06] bg-white/[0.01]"
      }`}
      style={{ zIndex: status === "active" ? 10 : 1 }}
    >
      {/* Spotlight glow for active */}
      {status === "active" && !reduced && (
        <motion.div
          className="absolute -inset-[1px] rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(6,182,212,0.12) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Completion burst for output done */}
      <AnimatePresence>
        {status === "done" && isOutput && !reduced && (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl border-2 border-brand-emerald/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="absolute inset-0 rounded-2xl border border-brand-emerald/20"
            />
          </>
        )}
      </AnimatePresence>

      <div className="relative p-4 space-y-3">
        {/* Icon + status */}
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-500 ${
              status === "active"
                ? "border-brand-cyan/30 bg-brand-cyan/10"
                : status === "done"
                ? "border-brand-emerald/20 bg-brand-emerald/[0.06]"
                : "border-white/[0.06] bg-white/[0.02]"
            }`}
          >
            {status === "done" ? (
              <CheckCircle2 className="h-4 w-4 text-brand-emerald" />
            ) : status === "active" ? (
              <Loader2 className="h-4 w-4 text-brand-cyan animate-spin" />
            ) : status === "locked" ? (
              <Lock className="h-3.5 w-3.5 text-muted-dark" />
            ) : (
              <Icon className="h-4 w-4 text-muted-dark" />
            )}
          </div>
          <span
            className={`text-sm font-mono tabular-nums ${
              status === "active"
                ? "text-brand-cyan/70"
                : status === "done"
                ? "text-brand-emerald/50"
                : "text-muted-dark"
            }`}
          >
            {stage.timing}
          </span>
        </div>

        {/* Label */}
        <h4
          className={`text-sm font-semibold transition-colors duration-300 ${
            status === "active"
              ? "text-brand-cyan"
              : status === "done"
              ? "text-foreground"
              : "text-muted-dark"
          }`}
        >
          {stage.label}
        </h4>

        {/* Description (revealed) */}
        <AnimatePresence>
          {(status === "active" || status === "done") && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduced ? 0 : 0.3 }}
              className={`text-sm leading-relaxed ${
                status === "done"
                  ? isOutput
                    ? "text-brand-emerald/70 font-medium"
                    : "text-muted-dark"
                  : "text-muted"
              }`}
            >
              {stage.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PlaygroundTimeline() {
  const reduced = useReducedMotion() ?? false;
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(-1);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearAll, [clearAll]);

  // Progress percentage
  const totalStages =
    activeExample !== null ? examples[activeExample].stages.length : 0;
  const doneCount = stageStatuses.filter((s) => s === "done").length;
  const activeCount = stageStatuses.filter((s) => s === "active").length;
  const progressPercent =
    totalStages > 0
      ? ((doneCount + activeCount * 0.5) / totalStages) * 100
      : 0;

  // Auto-scroll to active stage
  useEffect(() => {
    if (activeStageIdx >= 0 && scrollRef.current) {
      const cards = scrollRef.current.querySelectorAll("[data-stage-card]");
      const activeCard = cards[activeStageIdx] as HTMLElement | undefined;
      if (activeCard) {
        activeCard.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeStageIdx, reduced]);

  const runSimulation = useCallback(
    (exampleIdx: number, playbackSpeed: 1 | 2 = 1) => {
      clearAll();
      const example = examples[exampleIdx];
      const stageCount = example.stages.length;
      const initialStatuses: StageStatus[] = Array(stageCount).fill("locked");
      setStageStatuses(initialStatuses);
      setActiveStageIdx(-1);
      setIsRunning(true);
      setPhase("running");

      const speedMultiplier = 1 / playbackSpeed;
      let cumDelay = 0;

      example.stages.forEach((stage, idx) => {
        const activateDelay = cumDelay;

        // Activate
        const t1 = setTimeout(() => {
          setActiveStageIdx(idx);
          setStageStatuses((prev) => {
            const next = [...prev];
            next[idx] = "active";
            return next;
          });
        }, activateDelay * speedMultiplier);
        timeoutsRef.current.push(t1);

        // Done
        const doneDuration = stage.duration;
        const t2 = setTimeout(() => {
          setStageStatuses((prev) => {
            const next = [...prev];
            next[idx] = "done";
            return next;
          });

          if (idx === stageCount - 1) {
            setIsRunning(false);
            setPhase("done");
          }
        }, (activateDelay + doneDuration) * speedMultiplier);
        timeoutsRef.current.push(t2);

        cumDelay += doneDuration;
      });
    },
    [clearAll]
  );

  const handleExampleClick = useCallback(
    (idx: number) => {
      if (isRunning) return;
      setActiveExample(idx);
      runSimulation(idx, speed);
    },
    [isRunning, runSimulation, speed]
  );

  const handleReset = useCallback(() => {
    clearAll();
    setActiveExample(null);
    setActiveStageIdx(-1);
    setStageStatuses([]);
    setIsRunning(false);
    setPhase("idle");
  }, [clearAll]);

  const handleReplay = useCallback(() => {
    if (activeExample === null || isRunning) return;
    runSimulation(activeExample, speed);
  }, [activeExample, isRunning, runSimulation, speed]);

  const toggleSpeed = useCallback(() => {
    setSpeed((s) => (s === 1 ? 2 : 1));
  }, []);

  const activeExampleData =
    activeExample !== null ? examples[activeExample] : null;

  return (
    <SectionWrapper id="playground-timeline">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <SectionHeading>
          Execution{" "}
          <GradientText className="drop-shadow-lg">Pipeline</GradientText>
        </SectionHeading>
        <p className="mt-4 text-muted-dark text-base max-w-xl mx-auto leading-relaxed">
          Follow each stage of the agent pipeline as it processes your request
          from input to output.
        </p>
      </motion.div>

      {/* Example selector chips */}
      <motion.div
        variants={fadeUp}
        className="mb-6 flex flex-wrap gap-2 justify-center items-center"
      >
        {examples.map((ex, i) => (
          <button
            key={ex.label}
            onClick={() => handleExampleClick(i)}
            disabled={isRunning}
            className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeExample === i
                ? "border-brand-cyan/40 bg-brand-cyan/10 text-foreground"
                : "border-white/10 text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5"
            }`}
          >
            <ex.icon className="h-3.5 w-3.5" style={{ color: ex.iconColor }} />
            {ex.label}
          </button>
        ))}

        {/* Speed + controls */}
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={toggleSpeed}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-sm font-mono text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all"
          >
            <Gauge className="h-3.5 w-3.5" />
            {speed}x
          </button>
          {phase === "done" && (
            <button
              onClick={handleReplay}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Replay
            </button>
          )}
          {phase !== "idle" && (
            <button
              onClick={handleReset}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all disabled:opacity-40"
            >
              Reset
            </button>
          )}
        </div>
      </motion.div>

      {/* Timeline Container */}
      <motion.div
        variants={fadeUp}
        className="mx-auto max-w-5xl rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]"
      >
        <TerminalChrome
          title="execution-pipeline"
          status={
            phase === "running"
              ? "executing"
              : phase === "done"
              ? "complete"
              : "ready"
          }
          info={
            activeExampleData ? (
              <span className="truncate max-w-[200px] inline-block">
                {activeExampleData.prompt}
              </span>
            ) : undefined
          }
          className="px-5 py-3"
        />

        {/* Progress beam */}
        {phase !== "idle" && (
          <div className="relative h-1 bg-white/[0.03]">
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{
                background:
                  "linear-gradient(90deg, #06b6d4, #a855f7, #34d399)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{
                duration: reduced ? 0 : 0.6,
                ease: "easeOut",
              }}
            />
            {/* Glow dot at tip */}
            {isRunning && !reduced && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-cyan"
                style={{
                  left: `${progressPercent}%`,
                  boxShadow: "0 0 12px 4px rgba(6,182,212,0.5)",
                  marginLeft: "-6px",
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        )}

        {/* Timeline Cards */}
        <div className="relative">
          {phase === "idle" ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {[ArrowRight, Search, Cpu, Wrench, Zap, FileOutput].map(
                    (Icon, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center"
                      >
                        <Icon className="h-4 w-4 text-white/10" />
                      </div>
                    )
                  )}
                </div>
                <p className="text-sm text-muted-dark font-mono">
                  Pick an example to watch the execution pipeline
                </p>
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-3 px-5 py-8 overflow-x-auto scrollbar-hide"
              style={{ scrollBehavior: reduced ? "auto" : "smooth" }}
            >
              {activeExampleData?.stages.map((stage, idx) => {
                const status = stageStatuses[idx] || "locked";
                const isOutput = idx === (activeExampleData.stages.length - 1);

                return (
                  <div
                    key={stage.id}
                    data-stage-card
                    className="flex items-center gap-3 flex-shrink-0"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeExample}-${stage.id}`}
                        initial={{ opacity: 0, y: 20, rotateX: -15 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{
                          duration: reduced ? 0 : 0.5,
                          delay: reduced ? 0 : idx * 0.06,
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                      >
                        <StageCard
                          stage={stage}
                          status={status}
                          index={idx}
                          isOutput={isOutput}
                          reduced={reduced}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Connector between cards */}
                    {idx < activeExampleData.stages.length - 1 && (
                      <div className="flex-shrink-0 flex items-center">
                        <div className="relative w-8 h-[2px]">
                          <div className="absolute inset-0 bg-white/[0.06] rounded-full" />
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              background:
                                "linear-gradient(90deg, #06b6d4, #a855f7)",
                            }}
                            initial={{ width: "0%" }}
                            animate={{
                              width:
                                stageStatuses[idx] === "done"
                                  ? "100%"
                                  : stageStatuses[idx] === "active"
                                  ? "50%"
                                  : "0%",
                            }}
                            transition={{
                              duration: reduced ? 0 : 0.4,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-2.5 bg-white/[0.01]">
          <div className="flex items-center gap-3 text-sm font-mono tracking-wider uppercase text-muted-dark">
            <span>Pipeline View</span>
            {isRunning && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brand-cyan/50"
              >
                Stage {activeStageIdx + 1} of {totalStages}
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {totalStages > 0 && (
              <span className="text-sm font-mono text-muted-dark">
                {doneCount}/{totalStages} stages
              </span>
            )}
            {phase === "done" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-sm font-mono tracking-wider uppercase text-brand-emerald/60"
              >
                pipeline complete
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
