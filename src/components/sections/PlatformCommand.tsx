"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { Wand2, Zap, Cloud, Activity, SkipForward } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OutputLine {
  text: string;
  color: "cyan" | "emerald" | "amber" | "purple" | "white" | "muted" | "rose";
  indent?: number;
  delay?: number;
}

interface CommandSequence {
  command: string;
  icon: typeof Wand2;
  pillar: string;
  output: OutputLine[];
}

/* ------------------------------------------------------------------ */
/*  Command sequences                                                  */
/* ------------------------------------------------------------------ */

const commands: CommandSequence[] = [
  {
    command: 'personas design "Email triage assistant"',
    icon: Wand2,
    pillar: "Design",
    output: [
      { text: "", color: "muted" },
      { text: "  Analyzing request...", color: "cyan" },
      { text: "  Feasibility: HIGH  (3 tools available)", color: "emerald" },
      { text: "", color: "muted" },
      { text: "  Generated agent.config:", color: "purple" },
      { text: "  ┌─────────────────────────────────────┐", color: "purple", indent: 0 },
      { text: "  │  role     : \"Email triage assistant\" │", color: "purple", indent: 0 },
      { text: "  │  tools    : [gmail, slack, jira]     │", color: "amber", indent: 0 },
      { text: "  │  trigger  : \"every 15 minutes\"       │", color: "cyan", indent: 0 },
      { text: "  │  healing  : true                     │", color: "emerald", indent: 0 },
      { text: "  └─────────────────────────────────────┘", color: "purple", indent: 0 },
      { text: "", color: "muted" },
      { text: "  ✓ Agent scaffolded successfully", color: "emerald" },
    ],
  },
  {
    command: "personas connect email slack github",
    icon: Zap,
    pillar: "Coordinate",
    output: [
      { text: "", color: "muted" },
      { text: "  Wiring event bus...", color: "cyan" },
      { text: "", color: "muted" },
      { text: "  ┌──────┐     ┌──────┐     ┌──────┐", color: "cyan" },
      { text: "  │ Email │ ──► │ Slack│ ──► │GitHub│", color: "cyan" },
      { text: "  └──────┘     └──────┘     └──────┘", color: "cyan" },
      { text: "", color: "muted" },
      { text: "  Routes:", color: "white" },
      { text: "    email.received  → slack.post-message", color: "cyan", indent: 2 },
      { text: "    slack.reaction  → github.create-issue", color: "cyan", indent: 2 },
      { text: "", color: "muted" },
      { text: "  ✓ 3 agents connected via event bus", color: "emerald" },
      { text: "  ⚡ Running locally — no cloud required", color: "amber" },
    ],
  },
  {
    command: "personas deploy --target cloud",
    icon: Cloud,
    pillar: "Deploy",
    output: [
      { text: "", color: "muted" },
      { text: "  Packaging agents...", color: "cyan" },
      { text: "  Uploading bundle [====            ]  25%", color: "emerald", delay: 200 },
      { text: "  Uploading bundle [========        ]  50%", color: "emerald", delay: 200 },
      { text: "  Uploading bundle [============    ]  75%", color: "emerald", delay: 200 },
      { text: "  Uploading bundle [================] 100%", color: "emerald", delay: 200 },
      { text: "", color: "muted" },
      { text: "  Provisioning infrastructure...", color: "cyan" },
      { text: "    ✓ Container runtime ready", color: "emerald", indent: 2 },
      { text: "    ✓ Event bus connected", color: "emerald", indent: 2 },
      { text: "    ✓ Secrets injected", color: "emerald", indent: 2 },
      { text: "", color: "muted" },
      { text: "  ✓ Deployed to cloud — running 24/7", color: "emerald" },
      { text: "  🌐 https://agents.personas.dev/triage", color: "cyan" },
    ],
  },
  {
    command: "personas monitor --live",
    icon: Activity,
    pillar: "Monitor",
    output: [
      { text: "", color: "muted" },
      { text: "  Live telemetry stream:", color: "amber" },
      { text: "", color: "muted" },
      { text: "  Executions ▁▂▃▅▇█▇▅▃▂▁▂▃▅▇  42/hr", color: "amber" },
      { text: "  Latency    ▂▂▃▂▁▁▂▃▂▁▁▂▂▃▂  avg 1.2s", color: "cyan" },
      { text: "  Success    ████████████████  99.7%", color: "emerald" },
      { text: "", color: "muted" },
      { text: "  Recent events:", color: "white" },
      { text: "    12:04:32  email.triage     → classified 3 urgent", color: "amber", indent: 2 },
      { text: "    12:04:33  slack.notify     → sent to #alerts", color: "cyan", indent: 2 },
      { text: "    12:04:35  github.issue     → created GH-1847", color: "purple", indent: 2 },
      { text: "    12:04:36  healing.engine   → auto-fixed timeout", color: "emerald", indent: 2 },
      { text: "", color: "muted" },
      { text: "  ✓ All systems operational", color: "emerald" },
    ],
  },
];

const summaryLines: OutputLine[] = [
  { text: "", color: "muted" },
  { text: "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", color: "muted" },
  { text: "  Platform ready. 4 capabilities active.", color: "emerald" },
  { text: "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", color: "muted" },
];

/* ------------------------------------------------------------------ */
/*  Color mapping                                                      */
/* ------------------------------------------------------------------ */

const colorClasses: Record<OutputLine["color"], string> = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  white: "text-muted",
  muted: "text-muted-dark",
  rose: "text-rose-400",
};

/* ------------------------------------------------------------------ */
/*  Typing speed helpers                                               */
/* ------------------------------------------------------------------ */

function getTypingDelay(): number {
  /* Realistic variation: mostly fast, occasionally pauses */
  const base = 35;
  const variation = Math.random();
  if (variation > 0.95) return base + 120; // rare long pause
  if (variation > 0.85) return base + 50; // occasional pause
  return base + Math.random() * 20;
}

/* ------------------------------------------------------------------ */
/*  Terminal output line component                                     */
/* ------------------------------------------------------------------ */

function TerminalLine({ line, index }: { line: OutputLine; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className={`font-mono text-sm sm:text-sm leading-relaxed ${colorClasses[line.color]}`}
      style={{ paddingLeft: line.indent ? `${line.indent * 8}px` : undefined }}
    >
      <span style={{ whiteSpace: "pre" }}>{line.text || "\u00A0"}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Blinking cursor                                                    */
/* ------------------------------------------------------------------ */

function BlinkingCursor() {
  return (
    <motion.span
      className="inline-block w-2 h-4 bg-brand-cyan ml-0.5 align-middle"
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Command pill badge                                                 */
/* ------------------------------------------------------------------ */

function CommandBadge({ command, index }: { command: CommandSequence; index: number }) {
  const Icon = command.icon;
  const colors = ["text-purple-400", "text-cyan-400", "text-emerald-400", "text-amber-400"];
  const bgColors = ["bg-purple-500/10", "bg-cyan-500/10", "bg-emerald-500/10", "bg-amber-500/10"];
  const borderColors = [
    "border-purple-500/20",
    "border-cyan-500/20",
    "border-emerald-500/20",
    "border-amber-500/20",
  ];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${bgColors[index]} ${borderColors[index]}`}
    >
      <Icon className={`h-3 w-3 ${colors[index]}`} />
      <span className={`text-sm font-mono font-medium ${colors[index]}`}>
        {command.pillar}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PlatformCommand() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const terminalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(terminalRef, { once: false, margin: "-100px" });

  /* State */
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [history, setHistory] = useState<Array<{ command: string; output: OutputLine[] }>>([]);
  const [phase, setPhase] = useState<"idle" | "typing" | "output" | "pause" | "summary" | "done">("idle");
  const [showSummary, setShowSummary] = useState(false);

  /* Refs for cleanup */
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(true);

  /* Auto-scroll terminal to bottom */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [typedText, outputLines, history, showSummary]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /* Start animation when in view */
  useEffect(() => {
    if (isInView && phase === "idle") {
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) setPhase("typing");
      }, 600);
    }
  }, [isInView, phase]);

  /* Typing effect */
  useEffect(() => {
    if (phase !== "typing" || !isActiveRef.current) return;

    const cmd = commands[currentCommandIndex];
    if (!cmd) return;

    const fullText = cmd.command;

    if (prefersReducedMotion) {
      /* Skip animation: show full command immediately */
      setTypedText(fullText);
      setPhase("output");
      return;
    }

    if (typedText.length < fullText.length) {
      const delay = getTypingDelay();
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }
      }, delay);
    } else {
      /* Typing done, start output after a brief pause */
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) setPhase("output");
      }, 300);
    }
  }, [phase, typedText, currentCommandIndex, prefersReducedMotion]);

  /* Output reveal */
  useEffect(() => {
    if (phase !== "output" || !isActiveRef.current) return;

    const cmd = commands[currentCommandIndex];
    if (!cmd) return;

    if (prefersReducedMotion) {
      /* Show all output at once */
      setOutputLines(cmd.output);
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) advanceToNext();
      }, 800);
      return;
    }

    if (outputLines.length < cmd.output.length) {
      const nextLine = cmd.output[outputLines.length];
      const delay = nextLine.delay ?? 60;
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) {
          setOutputLines((prev) => [...prev, nextLine]);
        }
      }, delay);
    } else {
      /* All output shown, pause then advance */
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) advanceToNext();
      }, 1200);
    }
  }, [phase, outputLines, currentCommandIndex, prefersReducedMotion]);

  /* Summary phase */
  useEffect(() => {
    if (phase !== "summary" || !isActiveRef.current) return;

    setShowSummary(true);

    /* Auto-restart after a long pause */
    timeoutRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        setPhase("done");
        /* Restart after 4 seconds */
        timeoutRef.current = setTimeout(() => {
          if (isActiveRef.current) restart();
        }, 4000);
      }
    }, 3000);
  }, [phase]);

  /* Advance to the next command */
  const advanceToNext = useCallback(() => {
    const cmd = commands[currentCommandIndex];

    /* Save current command to history */
    setHistory((prev) => [
      ...prev,
      { command: cmd.command, output: [...outputLines.length > 0 ? outputLines : cmd.output] },
    ]);

    /* Reset for next command */
    setTypedText("");
    setOutputLines([]);

    if (currentCommandIndex < commands.length - 1) {
      setCurrentCommandIndex((prev) => prev + 1);
      setPhase("typing");
    } else {
      setPhase("summary");
    }
  }, [currentCommandIndex, outputLines]);

  /* Skip current command */
  const skipCommand = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const cmd = commands[currentCommandIndex];
    if (!cmd) return;

    if (phase === "typing" || phase === "output") {
      /* Show full command and output immediately */
      setHistory((prev) => [
        ...prev,
        { command: cmd.command, output: cmd.output },
      ]);
      setTypedText("");
      setOutputLines([]);

      if (currentCommandIndex < commands.length - 1) {
        setCurrentCommandIndex((prev) => prev + 1);
        setPhase("typing");
      } else {
        setPhase("summary");
      }
    }
  }, [phase, currentCommandIndex]);

  /* Restart the full sequence */
  const restart = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentCommandIndex(0);
    setTypedText("");
    setOutputLines([]);
    setHistory([]);
    setShowSummary(false);
    setPhase("typing");
  }, []);

  /* Current command info */
  const currentCmd = commands[currentCommandIndex];
  const completedCount = history.length;

  return (
    <SectionWrapper id="platform-command" dotGrid>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[15%] top-[30%] h-80 w-80 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute left-[10%] bottom-[20%] h-60 w-60 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Header */}
      <motion.div variants={fadeUp} className="text-center mb-16">
        <span className="inline-block rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1.5 text-sm font-semibold tracking-widest uppercase text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)] font-mono mb-6">
          CLI
        </span>
        <SectionHeading>
          One <GradientText>command</GradientText> at a time
        </SectionHeading>
        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Design, connect, deploy, and monitor your agents — all from the terminal.
        </p>
      </motion.div>

      {/* Progress badges */}
      <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 mb-8">
        {commands.map((cmd, i) => (
          <motion.div
            key={cmd.pillar}
            animate={{
              opacity: i <= currentCommandIndex || showSummary ? 1 : 0.3,
              scale: i === currentCommandIndex && !showSummary ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <CommandBadge command={cmd} index={i} />
          </motion.div>
        ))}
      </motion.div>

      {/* Terminal */}
      <motion.div
        ref={terminalRef}
        variants={fadeUp}
        className="mx-auto max-w-3xl"
      >
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-md shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden">
          {/* Terminal title bar */}
          <div className="px-4 py-3">
            <TerminalChrome
              title="personas-cli"
              status="active"
              info={
                <span className="text-muted-dark">
                  {completedCount}/{commands.length} complete
                </span>
              }
            />
          </div>

          {/* Terminal body */}
          <div
            ref={scrollRef}
            className="px-4 sm:px-6 pb-6 pt-2 max-h-[480px] overflow-y-auto scroll-smooth"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.1) transparent",
            }}
          >
            {/* History: previously completed commands */}
            {history.map((entry, hIdx) => (
              <div key={hIdx} className="mb-4">
                <div className="font-mono text-sm sm:text-sm">
                  <span className="text-muted-dark">~/agents $ </span>
                  <span className="text-muted">{entry.command}</span>
                </div>
                {entry.output.map((line, lIdx) => (
                  <div
                    key={lIdx}
                    className={`font-mono text-sm sm:text-sm leading-relaxed ${colorClasses[line.color]}`}
                    style={{
                      paddingLeft: line.indent ? `${line.indent * 8}px` : undefined,
                      whiteSpace: "pre",
                    }}
                  >
                    {line.text || "\u00A0"}
                  </div>
                ))}
              </div>
            ))}

            {/* Current command being typed */}
            {phase !== "idle" && phase !== "done" && phase !== "summary" && currentCmd && (
              <div className="mb-2">
                <div className="font-mono text-sm sm:text-sm">
                  <span className="text-muted-dark">~/agents $ </span>
                  <span className="text-muted">{typedText}</span>
                  {phase === "typing" && <BlinkingCursor />}
                </div>

                {/* Output lines for current command */}
                <AnimatePresence>
                  {outputLines.map((line, lIdx) => (
                    <TerminalLine key={lIdx} line={line} index={lIdx} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Summary */}
            <AnimatePresence>
              {showSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4"
                >
                  {summaryLines.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      className={`font-mono text-sm sm:text-sm leading-relaxed ${colorClasses[line.color]}`}
                      style={{ whiteSpace: "pre" }}
                    >
                      {line.text || "\u00A0"}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Waiting prompt when done */}
            {(phase === "done" || (phase === "summary" && showSummary)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 font-mono text-sm sm:text-sm"
              >
                <span className="text-muted-dark">~/agents $ </span>
                <BlinkingCursor />
              </motion.div>
            )}
          </div>

          {/* Bottom bar with controls */}
          <div className="px-4 sm:px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Progress dots */}
              {commands.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    i < completedCount
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                      : i === currentCommandIndex && !showSummary
                        ? "bg-brand-cyan shadow-[0_0_6px_rgba(6,182,212,0.5)]"
                        : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Skip button */}
              {(phase === "typing" || phase === "output") && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={skipCommand}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-mono text-muted-dark hover:text-muted hover:border-white/20 transition-all"
                >
                  <SkipForward className="h-3 w-3" />
                  Skip
                </motion.button>
              )}

              {/* Restart button */}
              {(phase === "done" || phase === "summary") && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={restart}
                  className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1.5 text-sm font-mono text-brand-cyan/60 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all"
                >
                  Replay
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
