"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, RotateCcw, ChevronRight, Sparkles,
  Mail, Github, MessageSquare, Calendar,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";

import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Simulation data                                                    */
/* ------------------------------------------------------------------ */

interface SimLine {
  text: string;
  color?: string;
  delay: number; // ms after previous line
  indent?: number;
}

interface ExamplePrompt {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  prompt: string;
  lines: SimLine[];
}

const examples: ExamplePrompt[] = [
  {
    label: "Triage my Gmail",
    icon: Mail,
    iconColor: "#ea4335",
    prompt: "Triage my Gmail inbox and draft replies for urgent emails",
    lines: [
      { text: "Parsing instruction...", color: "text-muted-dark", delay: 400 },
      { text: "Intent detected: email_triage + auto_reply", color: "text-brand-cyan", delay: 600 },
      { text: "Selecting tools: Gmail API, NLP Classifier", color: "text-muted", delay: 500 },
      { text: "Connecting to Gmail...", color: "text-muted-dark", delay: 800 },
      { text: "Fetched 47 unread messages", color: "text-muted", delay: 600 },
      { text: "Classifying messages...", color: "text-muted-dark", delay: 700 },
      { text: "  urgent:  8  |  follow-up: 12  |  fyi: 19  |  spam: 8", color: "text-brand-emerald", delay: 500, indent: 1 },
      { text: "Drafting replies for 8 urgent emails...", color: "text-muted", delay: 900 },
      { text: "  Draft 1/8: Re: Q4 Budget Review  [ready]", color: "text-muted", delay: 300, indent: 1 },
      { text: "  Draft 2/8: Re: Production Incident  [ready]", color: "text-muted", delay: 250, indent: 1 },
      { text: "  ...6 more drafts ready", color: "text-muted-dark", delay: 200, indent: 1 },
      { text: "Done. 8 drafts saved, 8 labels applied, 8 spam archived.", color: "text-brand-emerald", delay: 500 },
    ],
  },
  {
    label: "Review this PR",
    icon: Github,
    iconColor: "#8b5cf6",
    prompt: "Review PR #142 for bugs, style issues, and missing tests",
    lines: [
      { text: "Parsing instruction...", color: "text-muted-dark", delay: 400 },
      { text: "Intent detected: code_review", color: "text-brand-cyan", delay: 600 },
      { text: "Selecting tools: GitHub API, AST Analyzer, Test Scanner", color: "text-muted", delay: 500 },
      { text: "Fetching PR #142 diff (14 files, +342 / -89)...", color: "text-muted-dark", delay: 900 },
      { text: "Analyzing code changes...", color: "text-muted-dark", delay: 800 },
      { text: "  Bug risk:     2 potential null derefs in api/handler.ts", color: "text-brand-amber", delay: 500, indent: 1 },
      { text: "  Style:        3 naming inconsistencies", color: "text-muted", delay: 400, indent: 1 },
      { text: "  Test gaps:    auth middleware untested (0% coverage)", color: "text-brand-rose", delay: 400, indent: 1 },
      { text: "Posting 6 inline review comments...", color: "text-muted", delay: 700 },
      { text: "Requesting changes with summary comment.", color: "text-muted", delay: 500 },
      { text: "Done. Review posted: 2 bugs, 3 style notes, 1 test gap.", color: "text-brand-emerald", delay: 500 },
    ],
  },
  {
    label: "Summarize Slack",
    icon: MessageSquare,
    iconColor: "#4a154b",
    prompt: "Summarize #engineering and #product channels from the last 24h",
    lines: [
      { text: "Parsing instruction...", color: "text-muted-dark", delay: 400 },
      { text: "Intent detected: channel_digest", color: "text-brand-cyan", delay: 600 },
      { text: "Selecting tools: Slack API, Summarizer", color: "text-muted", delay: 500 },
      { text: "Fetching messages from #engineering (last 24h)...", color: "text-muted-dark", delay: 800 },
      { text: "  Found 127 messages, 14 threads", color: "text-muted", delay: 400, indent: 1 },
      { text: "Fetching messages from #product (last 24h)...", color: "text-muted-dark", delay: 600 },
      { text: "  Found 83 messages, 9 threads", color: "text-muted", delay: 400, indent: 1 },
      { text: "Generating summaries...", color: "text-muted-dark", delay: 900 },
      { text: "  #engineering: 3 key decisions, 2 action items, 1 blocker", color: "text-brand-cyan", delay: 500, indent: 1 },
      { text: "  #product: 2 feature discussions, 1 launch update", color: "text-brand-cyan", delay: 400, indent: 1 },
      { text: "Done. Digest posted to #my-digest with action items.", color: "text-brand-emerald", delay: 500 },
    ],
  },
  {
    label: "Optimize my schedule",
    icon: Calendar,
    iconColor: "#06b6d4",
    prompt: "Analyze next week's calendar and block focus time",
    lines: [
      { text: "Parsing instruction...", color: "text-muted-dark", delay: 400 },
      { text: "Intent detected: schedule_optimize", color: "text-brand-cyan", delay: 600 },
      { text: "Selecting tools: Calendar API, Schedule Analyzer", color: "text-muted", delay: 500 },
      { text: "Loading next week's calendar...", color: "text-muted-dark", delay: 800 },
      { text: "  Mon: 6h meetings  |  Tue: 3h  |  Wed: 5h  |  Thu: 2h  |  Fri: 4h", color: "text-muted", delay: 500, indent: 1 },
      { text: "Detecting meeting-heavy days...", color: "text-muted-dark", delay: 700 },
      { text: "  Monday and Wednesday exceed 4h threshold", color: "text-brand-amber", delay: 400, indent: 1 },
      { text: "Finding focus time slots...", color: "text-muted-dark", delay: 600 },
      { text: "  Tue 9-11am  |  Thu 9-12pm  |  Fri 9-11am", color: "text-brand-emerald", delay: 500, indent: 1 },
      { text: "Creating 3 focus time blocks...", color: "text-muted", delay: 600 },
      { text: "Done. 3 focus blocks added (6h total). Conflicts: 0.", color: "text-brand-emerald", delay: 500 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AgentPlayground() {
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [visibleLines, setVisibleLines] = useState<SimLine[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const terminalRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const scrollTerminal = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  const runSimulation = useCallback(
    (lines: SimLine[]) => {
      clearTimeouts();
      setVisibleLines([]);
      setIsRunning(true);
      setPhase("running");

      let cumulative = 0;
      lines.forEach((line, i) => {
        cumulative += line.delay;
        const t = setTimeout(() => {
          setVisibleLines((prev) => [...prev, line]);
          requestAnimationFrame(scrollTerminal);
          if (i === lines.length - 1) {
            setIsRunning(false);
            setPhase("done");
          }
        }, cumulative);
        timeoutsRef.current.push(t);
      });
    },
    [clearTimeouts, scrollTerminal]
  );

  const handleExampleClick = useCallback(
    (idx: number) => {
      if (isRunning) return;
      setActiveExample(idx);
      setInputValue(examples[idx].prompt);
      runSimulation(examples[idx].lines);
    },
    [isRunning, runSimulation]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isRunning || !inputValue.trim()) return;
      // Find matching example or use first
      const match = examples.findIndex((ex) =>
        inputValue.toLowerCase().includes(ex.label.toLowerCase().split(" ")[0])
      );
      const idx = match >= 0 ? match : 0;
      setActiveExample(idx);
      runSimulation(examples[idx].lines);
    },
    [isRunning, inputValue, runSimulation]
  );

  const handleReset = useCallback(() => {
    clearTimeouts();
    setActiveExample(null);
    setInputValue("");
    setVisibleLines([]);
    setIsRunning(false);
    setPhase("idle");
  }, [clearTimeouts]);

  // Cleanup on unmount
  useEffect(() => clearTimeouts, [clearTimeouts]);

  return (
    <SectionWrapper id="playground">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <SectionHeading>
          Try it{" "}
          <GradientText className="drop-shadow-lg">right now</GradientText>
        </SectionHeading>
        <p className="mt-4 text-muted-dark text-base max-w-xl mx-auto leading-relaxed">
          Type a natural-language instruction or pick an example to see how a
          Personas agent parses, plans, and executes.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
        {/* Example prompt chips */}
        <div className="mb-5 flex flex-wrap gap-2 justify-center">
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
              <ex.icon
                className="h-3.5 w-3.5"
                style={{ color: ex.iconColor }}
              />
              {ex.label}
            </button>
          ))}
        </div>

        {/* Terminal */}
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome
            title="agent-playground"
            status={phase === "running" ? "executing" : phase === "done" ? "complete" : "ready"}
            className="px-4 py-3 sm:px-5"
          />

          {/* Input area */}
          <form onSubmit={handleSubmit} className="border-b border-white/[0.04] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <ChevronRight className="h-4 w-4 shrink-0 text-brand-cyan/60" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe what your agent should do..."
                disabled={isRunning}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-dark outline-none font-mono disabled:opacity-60"
              />
              {phase === "done" ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isRunning || !inputValue.trim()}
                  className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {isRunning ? "Running" : "Run"}
                </button>
              )}
            </div>
          </form>

          {/* Output area */}
          <div
            ref={terminalRef}
            className="h-[280px] overflow-y-auto px-4 py-4 sm:px-5 scrollbar-hide"
          >
            {phase === "idle" && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-dark font-mono text-center">
                  Pick an example above or type your own instruction to begin
                </p>
              </div>
            )}

            <AnimatePresence>
              {visibleLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`font-mono text-sm leading-relaxed ${line.color || "text-muted"}`}
                  style={{ paddingLeft: line.indent ? `${line.indent * 8}px` : undefined }}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {isRunning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mt-1 font-mono text-sm text-brand-cyan/50"
              >
                _
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-2.5 sm:px-5 text-sm font-mono tracking-wider uppercase text-muted-dark">
            <span>Simulated execution</span>
            {phase === "done" && (
              <span className="text-brand-emerald/60">execution complete</span>
            )}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
