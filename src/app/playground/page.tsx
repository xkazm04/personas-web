"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Mail, GitPullRequest, MessageSquare, Calendar,
  FileText, Search, Download, LayoutGrid, RotateCcw,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

interface OutputLine {
  text: string;
  type: "header" | "info" | "tool" | "process" | "success" | "result";
  indent?: number;
}

interface PromptCard {
  icon: typeof Mail;
  title: string;
  description: string;
  lines: OutputLine[];
}

const prompts: PromptCard[] = [
  {
    icon: Mail,
    title: "Triage my inbox",
    description: "Read new emails, classify by urgency, and draft replies",
    lines: [
      { text: '> Parsing: "Triage my inbox"', type: "header" },
      { text: "  Intent: email_triage", type: "success" },
      { text: "  Tools: gmail_api, nlp_classifier", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Fetching 12 new emails from Gmail...", type: "process", indent: 1 },
      { text: "  Classifying by urgency and sender...", type: "process", indent: 1 },
      { text: "  3 urgent, 5 follow-up, 4 FYI", type: "info", indent: 1 },
      { text: "  Drafting reply for urgent #1...", type: "process", indent: 1 },
      { text: "  Drafting reply for urgent #2...", type: "process", indent: 1 },
      { text: "  Drafting reply for urgent #3...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 4.2s", type: "success" },
      { text: "  3 replies drafted, 5 flagged for follow-up, 4 archived", type: "result", indent: 1 },
    ],
  },
  {
    icon: GitPullRequest,
    title: "Review this PR",
    description: "Analyze code changes, find bugs, and suggest improvements",
    lines: [
      { text: '> Parsing: "Review this PR"', type: "header" },
      { text: "  Intent: code_review", type: "success" },
      { text: "  Tools: github_api, ast_analyzer, test_scanner", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Fetching PR #142 diff (14 files, +342 / -89)...", type: "process", indent: 1 },
      { text: "  Analyzing code structure and patterns...", type: "process", indent: 1 },
      { text: "  Found 2 potential null derefs in api/handler.ts", type: "info", indent: 1 },
      { text: "  Checking test coverage for changed files...", type: "process", indent: 1 },
      { text: "  auth middleware: 0% coverage (gap detected)", type: "info", indent: 1 },
      { text: "  Posting 6 inline review comments...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 3.8s", type: "success" },
      { text: "  2 bugs flagged, 3 style notes, 1 test gap identified", type: "result", indent: 1 },
    ],
  },
  {
    icon: MessageSquare,
    title: "Summarize Slack",
    description: "Digest today's channels into actionable highlights",
    lines: [
      { text: '> Parsing: "Summarize Slack"', type: "header" },
      { text: "  Intent: channel_digest", type: "success" },
      { text: "  Tools: slack_api, summarizer, nlp_extractor", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Connecting to workspace (4 channels)...", type: "process", indent: 1 },
      { text: "  Reading #engineering: 127 messages, 14 threads...", type: "process", indent: 1 },
      { text: "  Reading #product: 83 messages, 9 threads...", type: "process", indent: 1 },
      { text: "  Extracting decisions and action items...", type: "process", indent: 1 },
      { text: "  3 key decisions, 2 blockers, 5 action items found", type: "info", indent: 1 },
      { text: "  Generating structured digest...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 5.1s", type: "success" },
      { text: "  Digest posted to #my-updates with action items tagged", type: "result", indent: 1 },
    ],
  },
  {
    icon: Calendar,
    title: "Optimize my schedule",
    description: "Find free slots, resolve conflicts, and block focus time",
    lines: [
      { text: '> Parsing: "Optimize my schedule"', type: "header" },
      { text: "  Intent: schedule_optimize", type: "success" },
      { text: "  Tools: calendar_api, schedule_analyzer", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Loading next week's calendar...", type: "process", indent: 1 },
      { text: "  Mon: 6h meetings | Tue: 3h | Wed: 5h | Thu: 2h | Fri: 4h", type: "info", indent: 1 },
      { text: "  Detecting meeting-heavy days...", type: "process", indent: 1 },
      { text: "  Monday and Wednesday exceed 4h threshold", type: "info", indent: 1 },
      { text: "  Finding optimal focus time slots...", type: "process", indent: 1 },
      { text: "  Creating 3 focus blocks: Tue 9-11, Thu 9-12, Fri 9-11", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 2.9s", type: "success" },
      { text: "  3 focus blocks added (6h total), 0 conflicts", type: "result", indent: 1 },
    ],
  },
  {
    icon: FileText,
    title: "Draft release notes",
    description: "Scan recent commits and write user-facing changelog",
    lines: [
      { text: '> Parsing: "Draft release notes"', type: "header" },
      { text: "  Intent: release_changelog", type: "success" },
      { text: "  Tools: git_api, commit_analyzer, markdown_writer", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Fetching commits since v2.3.0 (47 commits)...", type: "process", indent: 1 },
      { text: "  Categorizing: 12 features, 8 fixes, 27 chores...", type: "process", indent: 1 },
      { text: "  Filtering user-facing changes...", type: "process", indent: 1 },
      { text: "  12 features and 8 fixes qualify for changelog", type: "info", indent: 1 },
      { text: "  Writing human-readable descriptions...", type: "process", indent: 1 },
      { text: "  Formatting as markdown with categories...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 3.4s", type: "success" },
      { text: "  CHANGELOG.md updated: 12 features, 8 fixes documented", type: "result", indent: 1 },
    ],
  },
  {
    icon: Search,
    title: "Research competitors",
    description: "Find pricing changes, new features, and market positioning",
    lines: [
      { text: '> Parsing: "Research competitors"', type: "header" },
      { text: "  Intent: competitive_analysis", type: "success" },
      { text: "  Tools: web_scraper, pricing_tracker, diff_engine", type: "tool" },
      { text: "", type: "info" },
      { text: "> Executing...", type: "header" },
      { text: "  Scanning 5 competitor websites...", type: "process", indent: 1 },
      { text: "  Checking pricing pages for changes...", type: "process", indent: 1 },
      { text: "  Competitor A: price increase +15% detected", type: "info", indent: 1 },
      { text: "  Analyzing new feature announcements...", type: "process", indent: 1 },
      { text: "  Competitor B: launched AI assistant feature", type: "info", indent: 1 },
      { text: "  Comparing positioning statements...", type: "process", indent: 1 },
      { text: "", type: "info" },
      { text: "Complete in 6.7s", type: "success" },
      { text: "  Report generated: 2 pricing changes, 3 new features, 1 pivot", type: "result", indent: 1 },
    ],
  },
];

const lineColors: Record<OutputLine["type"], string> = {
  header: "text-foreground",
  info: "text-muted-dark",
  tool: "text-brand-cyan",
  process: "text-amber-400",
  success: "text-brand-emerald",
  result: "text-muted",
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function PlaygroundPage() {
  const prefersReducedMotion = useReducedMotion();
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const scrollTerminal = useCallback(() => {
    if (!terminalRef.current) return;
    if (prefersReducedMotion) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    } else {
      requestAnimationFrame(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      });
    }
  }, [prefersReducedMotion]);

  const runSimulation = useCallback(
    (promptLines: OutputLine[]) => {
      clearTimeouts();
      setLines([]);
      setIsRunning(true);
      setIsDone(false);

      let cumulative = 0;
      promptLines.forEach((line, i) => {
        const delay = line.type === "info" && line.text === "" ? 100 : 250 + Math.random() * 150;
        cumulative += delay;
        const t = setTimeout(() => {
          setLines((prev) => [...prev, line]);
          scrollTerminal();
          if (i === promptLines.length - 1) {
            setIsRunning(false);
            setIsDone(true);
          }
        }, cumulative);
        timeoutsRef.current.push(t);
      });
    },
    [clearTimeouts, scrollTerminal]
  );

  const handlePromptClick = useCallback(
    (idx: number) => {
      if (isRunning && activePrompt === idx) return;
      clearTimeouts();
      setActivePrompt(idx);
      runSimulation(prompts[idx].lines);
    },
    [isRunning, activePrompt, clearTimeouts, runSimulation]
  );

  const handleReset = useCallback(() => {
    clearTimeouts();
    setActivePrompt(null);
    setLines([]);
    setIsRunning(false);
    setIsDone(false);
  }, [clearTimeouts]);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  const status = isRunning ? "executing..." : isDone ? "complete" : "ready";

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[var(--background)] overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {/* Hero */}
            <motion.div variants={fadeUp} className="text-center mb-14">
              <SectionHeading>
                See agents in <GradientText>action</GradientText>
              </SectionHeading>
              <p className="mt-5 text-muted-dark text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Pick a task below and watch how a Personas agent breaks it down,
                selects the right tools, and delivers results — all in seconds.
              </p>
            </motion.div>

            {/* Prompt Cards - 2x3 grid */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10"
            >
              {prompts.map((prompt, idx) => {
                const Icon = prompt.icon;
                const isActive = activePrompt === idx;
                return (
                  <button
                    key={prompt.title}
                    onClick={() => handlePromptClick(idx)}
                    className={`group relative text-left rounded-xl border p-4 transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                      isActive
                        ? "border-brand-cyan/40 bg-brand-cyan/[0.06] shadow-[0_0_30px_rgba(6,182,212,0.08)]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isActive ? "bg-brand-cyan/15" : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                        }`}
                      >
                        <Icon className="h-4 w-4 text-brand-cyan" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{prompt.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-dark leading-relaxed">
                          {prompt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>

            {/* Terminal Simulation */}
            <motion.div variants={fadeUp} className="mx-auto max-w-3xl mb-16">
              <div className="rounded-2xl border border-white/[0.08] bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
                <TerminalChrome
                  title="agent-playground — live"
                  status={status}
                  className="px-4 py-3 sm:px-5"
                />

                <div
                  ref={terminalRef}
                  className="h-[320px] overflow-y-auto px-4 py-4 sm:px-5 scrollbar-hide"
                >
                  {activePrompt === null && (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-dark font-mono text-center">
                        Select a task above to start the simulation
                      </p>
                    </div>
                  )}

                  <AnimatePresence>
                    {lines.map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`font-mono text-sm leading-relaxed ${lineColors[line.type]}`}
                        style={{ paddingLeft: line.indent ? `${line.indent * 12}px` : undefined }}
                      >
                        {line.text || "\u00A0"}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isRunning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="mt-1 font-mono text-sm text-brand-cyan/60"
                    >
                      _
                    </motion.div>
                  )}
                </div>

                {/* Terminal footer */}
                <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-2.5 sm:px-5">
                  <span className="text-xs font-mono text-muted-dark uppercase tracking-wider">
                    Simulated execution
                  </span>
                  {isDone && (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-xs font-mono text-muted-dark hover:text-foreground transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Bottom CTA */}
            <motion.div variants={fadeUp} className="mx-auto max-w-xl">
              <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 text-center overflow-hidden">
                {/* Gradient border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-cyan/[0.04] via-transparent to-purple-500/[0.04] pointer-events-none" />

                <h3 className="relative text-xl font-bold text-foreground mb-3">
                  Ready to build your own agents?
                </h3>
                <p className="relative text-sm text-muted-dark mb-6">
                  Download Personas and create autonomous agents that connect to your tools,
                  follow your rules, and run on your schedule.
                </p>
                <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/#download"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 px-5 py-2.5 text-sm font-semibold text-brand-cyan transition-all hover:bg-brand-cyan/25"
                  >
                    <Download className="h-4 w-4" />
                    Download Personas
                  </Link>
                  <Link
                    href="/templates"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:border-white/20 transition-all"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Browse Templates
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
