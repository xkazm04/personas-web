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
  Circle,
  Search,
  Cpu,
  Wrench,
  Zap,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Clock,
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

interface ToolNode {
  label: string;
  icon: LucideIcon;
}

interface ExamplePrompt {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  prompt: string;
  intentText: string;
  tools: ToolNode[];
  resultText: string;
}

type NodeStatus = "pending" | "active" | "done";

interface FlowNode {
  id: string;
  label: string;
  icon: LucideIcon;
  status: NodeStatus;
  x: number;
  y: number;
  parentId?: string;
  color?: string;
}

const examples: ExamplePrompt[] = [
  {
    label: "Triage my Gmail",
    icon: Mail,
    iconColor: "#ea4335",
    prompt: "Triage my Gmail inbox and draft replies for urgent emails",
    intentText: "email_triage + auto_reply",
    tools: [
      { label: "Gmail API", icon: Mail },
      { label: "NLP Classifier", icon: Cpu },
    ],
    resultText: "8 drafts saved, 8 labels applied, 8 spam archived.",
  },
  {
    label: "Review this PR",
    icon: Github,
    iconColor: "#8b5cf6",
    prompt: "Review PR #142 for bugs, style issues, and missing tests",
    intentText: "code_review",
    tools: [
      { label: "GitHub API", icon: Github },
      { label: "AST Analyzer", icon: Search },
      { label: "Test Scanner", icon: ShieldCheck },
    ],
    resultText: "Review posted: 2 bugs, 3 style notes, 1 test gap.",
  },
  {
    label: "Summarize Slack",
    icon: MessageSquare,
    iconColor: "#4a154b",
    prompt: "Summarize #engineering and #product channels from the last 24h",
    intentText: "channel_digest",
    tools: [
      { label: "Slack API", icon: MessageSquare },
      { label: "Summarizer", icon: Sparkles },
    ],
    resultText: "Digest posted to #my-digest with action items.",
  },
  {
    label: "Optimize my schedule",
    icon: Calendar,
    iconColor: "#06b6d4",
    prompt: "Analyze next week's calendar and block focus time",
    intentText: "schedule_optimize",
    tools: [
      { label: "Calendar API", icon: Calendar },
      { label: "Schedule Analyzer", icon: Clock },
    ],
    resultText: "3 focus blocks added (6h total). Conflicts: 0.",
  },
];

/* ------------------------------------------------------------------ */
/*  Build Flow Nodes for the tree                                      */
/* ------------------------------------------------------------------ */

function buildFlowNodes(example: ExamplePrompt): FlowNode[] {
  const nodes: FlowNode[] = [];
  const centerX = 280;
  let currentY = 30;
  const rowGap = 90;

  // Parse Intent
  nodes.push({
    id: "parse",
    label: "Parse Intent",
    icon: Search,
    status: "pending",
    x: centerX,
    y: currentY,
  });
  currentY += rowGap;

  // Select Tools
  nodes.push({
    id: "select",
    label: "Select Tools",
    icon: Wrench,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "parse",
  });
  currentY += rowGap;

  // Tool branches
  const toolCount = example.tools.length;
  const toolSpacing = 170;
  const toolStartX = centerX - ((toolCount - 1) * toolSpacing) / 2;

  example.tools.forEach((tool, i) => {
    nodes.push({
      id: `tool-${i}`,
      label: tool.label,
      icon: tool.icon,
      status: "pending",
      x: toolStartX + i * toolSpacing,
      y: currentY,
      parentId: "select",
      color: i === 0 ? "#06b6d4" : i === 1 ? "#a855f7" : "#f43f5e",
    });
  });
  currentY += rowGap;

  // Execute
  nodes.push({
    id: "execute",
    label: "Execute",
    icon: Zap,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "tool-merge",
  });
  currentY += rowGap;

  // Verify
  nodes.push({
    id: "verify",
    label: "Verify",
    icon: ShieldCheck,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "execute",
  });
  currentY += rowGap;

  // Result
  nodes.push({
    id: "result",
    label: "Result",
    icon: CheckCircle2,
    status: "pending",
    x: centerX,
    y: currentY,
    parentId: "verify",
  });

  return nodes;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusColor(status: NodeStatus): string {
  switch (status) {
    case "active":
      return "border-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.4)]";
    case "done":
      return "border-brand-emerald/50 bg-brand-emerald/5";
    default:
      return "border-white/10";
  }
}

function getStatusIcon(status: NodeStatus, Icon: LucideIcon) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-brand-emerald" />;
    case "active":
      return <Loader2 className="h-4 w-4 text-brand-cyan animate-spin" />;
    default:
      return <Icon className="h-4 w-4 text-white/30" />;
  }
}

/* ------------------------------------------------------------------ */
/*  SVG Connection Lines                                               */
/* ------------------------------------------------------------------ */

function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  active,
  done,
  reduced,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
  done: boolean;
  reduced: boolean;
}) {
  const midY = y1 + (y2 - y1) / 2;
  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1.5"
      />
      <motion.path
        d={path}
        fill="none"
        stroke={done ? "#34d399" : active ? "#06b6d4" : "transparent"}
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: done || active ? 1 : 0 }}
        transition={{
          duration: reduced ? 0 : 0.6,
          ease: "easeInOut",
        }}
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Syntax Highlighted Prompt                                          */
/* ------------------------------------------------------------------ */

function SyntaxPrompt({ text }: { text: string }) {
  // Simple syntax highlighting for demo
  const parts = text.split(/(\b(?:inbox|draft|replies|urgent|emails|PR|#142|bugs|style|issues|missing|tests|#engineering|#product|channels|24h|calendar|focus|time|next week)\b)/gi);

  return (
    <div className="font-mono text-sm leading-relaxed">
      <span className="text-white/30">{">"} </span>
      {parts.map((part, i) => {
        const isKeyword = /^(inbox|draft|replies|urgent|emails|PR|#142|bugs|style|issues|missing|tests|#engineering|#product|channels|24h|calendar|focus|time|next week)$/i.test(part);
        return (
          <span
            key={i}
            className={isKeyword ? "text-brand-cyan" : "text-white/70"}
          >
            {part}
          </span>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PlaygroundSplit() {
  const reduced = useReducedMotion() ?? false;
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const runSimulation = useCallback(
    (exampleIdx: number) => {
      clearAll();
      const example = examples[exampleIdx];
      const flowNodes = buildFlowNodes(example);
      setNodes(flowNodes);
      setIsRunning(true);
      setPhase("running");
      setElapsedMs(0);

      // Start timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 50);

      // Activate nodes sequentially
      // Order: parse, select, tools (simultaneously), execute, verify, result
      const toolIds = flowNodes
        .filter((n) => n.id.startsWith("tool-"))
        .map((n) => n.id);
      const sequence = [
        ["parse"],
        ["select"],
        toolIds,
        ["execute"],
        ["verify"],
        ["result"],
      ];

      let cumDelay = 0;
      const delays = [500, 700, 900, 800, 600, 500];

      sequence.forEach((group, stepIdx) => {
        cumDelay += delays[stepIdx];
        const activateDelay = cumDelay;

        // Set active
        const t1 = setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              group.includes(n.id) ? { ...n, status: "active" as const } : n
            )
          );
        }, activateDelay);
        timeoutsRef.current.push(t1);

        // Set done after a bit
        const doneDelay = activateDelay + delays[stepIdx] * 0.7;
        const t2 = setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              group.includes(n.id) ? { ...n, status: "done" as const } : n
            )
          );

          // If last step, finish
          if (stepIdx === sequence.length - 1) {
            setIsRunning(false);
            setPhase("done");
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        }, doneDelay);
        timeoutsRef.current.push(t2);
      });
    },
    [clearAll]
  );

  const handleExampleClick = useCallback(
    (idx: number) => {
      if (isRunning) return;
      setActiveExample(idx);
      runSimulation(idx);
    },
    [isRunning, runSimulation]
  );

  const handleReset = useCallback(() => {
    clearAll();
    setActiveExample(null);
    setNodes([]);
    setIsRunning(false);
    setPhase("idle");
    setElapsedMs(0);
  }, [clearAll]);

  // Compute edges
  const edges: { from: FlowNode; to: FlowNode; active: boolean; done: boolean }[] = [];
  if (nodes.length > 0) {
    // parse -> select
    const parse = nodes.find((n) => n.id === "parse");
    const select = nodes.find((n) => n.id === "select");
    if (parse && select)
      edges.push({
        from: parse,
        to: select,
        active: select.status === "active",
        done: select.status === "done",
      });

    // select -> each tool
    const toolNodes = nodes.filter((n) => n.id.startsWith("tool-"));
    toolNodes.forEach((t) => {
      if (select)
        edges.push({
          from: select,
          to: t,
          active: t.status === "active",
          done: t.status === "done",
        });
    });

    // each tool -> execute
    const execute = nodes.find((n) => n.id === "execute");
    toolNodes.forEach((t) => {
      if (execute)
        edges.push({
          from: t,
          to: execute,
          active: execute.status === "active",
          done: execute.status === "done",
        });
    });

    // execute -> verify
    const verify = nodes.find((n) => n.id === "verify");
    if (execute && verify)
      edges.push({
        from: execute,
        to: verify,
        active: verify.status === "active",
        done: verify.status === "done",
      });

    // verify -> result
    const result = nodes.find((n) => n.id === "result");
    if (verify && result)
      edges.push({
        from: verify,
        to: result,
        active: result.status === "active",
        done: result.status === "done",
      });
  }

  const svgWidth = 560;
  const svgHeight = nodes.length > 0 ? Math.max(...nodes.map((n) => n.y)) + 60 : 400;

  const activeExampleData = activeExample !== null ? examples[activeExample] : null;

  return (
    <SectionWrapper id="playground-split">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <SectionHeading>
          The Agent{" "}
          <GradientText className="drop-shadow-lg">Mind</GradientText>
        </SectionHeading>
        <p className="mt-4 text-muted-dark text-base max-w-xl mx-auto leading-relaxed">
          Watch the agent&apos;s thought process unfold in real time. Pick a prompt
          and see how it parses, plans, and executes.
        </p>
      </motion.div>

      {/* Example selector chips */}
      <motion.div variants={fadeUp} className="mb-6 flex flex-wrap gap-2 justify-center">
        {examples.map((ex, i) => (
          <button
            key={ex.label}
            onClick={() => handleExampleClick(i)}
            disabled={isRunning}
            className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeExample === i
                ? "border-brand-cyan/40 bg-brand-cyan/10 text-foreground"
                : "border-white/10 text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5"
            }`}
          >
            <ex.icon className="h-3.5 w-3.5" style={{ color: ex.iconColor }} />
            {ex.label}
          </button>
        ))}
        {phase === "done" && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </motion.div>

      {/* Split-screen IDE */}
      <motion.div
        variants={fadeUp}
        className="mx-auto max-w-5xl rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
          {/* Left Panel: Prompt Editor */}
          <div className="border-b lg:border-b-0 lg:border-r border-white/[0.06]">
            <TerminalChrome
              title="prompt-editor"
              status={phase === "running" ? "parsing" : phase === "done" ? "parsed" : "ready"}
              className="px-4 py-3"
            />

            <div className="p-5 space-y-5">
              {/* Line numbers + prompt */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-end font-mono text-[11px] text-white/15 leading-relaxed select-none pt-[2px]">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </div>
                  <div className="flex-1 min-h-[100px]">
                    {activeExampleData ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeExample}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: reduced ? 0 : 0.3 }}
                        >
                          <div className="font-mono text-[11px] text-white/30 mb-1">
                            {"// Agent instruction"}
                          </div>
                          <SyntaxPrompt text={activeExampleData.prompt} />
                          <div className="font-mono text-[11px] text-white/20 mt-3">
                            {"// Detected intent:"}
                          </div>
                          <AnimatePresence>
                            {(phase === "running" || phase === "done") && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: reduced ? 0 : 0.5, duration: 0.3 }}
                                className="font-mono text-[11px] text-brand-cyan"
                              >
                                {activeExampleData.intentText}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <div className="flex items-center h-full">
                        <p className="font-mono text-[11px] text-white/15">
                          Select a prompt to begin...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tools selected */}
              {activeExampleData && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduced ? 0 : 0.8, duration: 0.4 }}
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-white/25 mb-2">
                      Selected Tools
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeExampleData.tools.map((tool, i) => (
                        <motion.div
                          key={tool.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: reduced ? 0 : 1.0 + i * 0.15,
                            duration: 0.3,
                            type: "spring",
                            stiffness: 300,
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-mono text-white/50"
                        >
                          <tool.icon className="h-3 w-3 text-brand-purple/70" />
                          {tool.label}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Result */}
              <AnimatePresence>
                {phase === "done" && activeExampleData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-xl border border-brand-emerald/20 bg-brand-emerald/5 p-4"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-brand-emerald/50 mb-1.5">
                      Result
                    </div>
                    <p className="font-mono text-xs text-brand-emerald/80 leading-relaxed">
                      {activeExampleData.resultText}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel: Agent Mind Flowchart */}
          <div>
            <TerminalChrome
              title="agent-mind"
              status={
                phase === "running"
                  ? "thinking"
                  : phase === "done"
                  ? "complete"
                  : "idle"
              }
              className="px-4 py-3"
            />

            <div className="relative p-4 overflow-auto" style={{ minHeight: 460 }}>
              {phase === "idle" ? (
                <div className="flex h-full items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                      <Cpu className="h-7 w-7 text-white/10" />
                    </div>
                    <p className="text-xs text-white/15 font-mono">
                      Agent mind visualization
                    </p>
                    <p className="text-[10px] text-white/10 font-mono">
                      Select a prompt to see the flowchart
                    </p>
                  </div>
                </div>
              ) : (
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  className="mx-auto"
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                >
                  {/* Connection lines */}
                  {edges.map((edge, i) => (
                    <ConnectionLine
                      key={i}
                      x1={edge.from.x}
                      y1={edge.from.y + 20}
                      x2={edge.to.x}
                      y2={edge.to.y - 20}
                      active={edge.active}
                      done={edge.done}
                      reduced={reduced}
                    />
                  ))}

                  {/* Nodes */}
                  {nodes.map((node) => (
                    <g key={node.id}>
                      {/* Glow effect for active nodes */}
                      {node.status === "active" && !reduced && (
                        <motion.circle
                          cx={node.x}
                          cy={node.y}
                          r={38}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="1"
                          initial={{ opacity: 0, r: 30 }}
                          animate={{
                            opacity: [0, 0.3, 0],
                            r: [30, 42, 30],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      {/* Node card */}
                      <foreignObject
                        x={node.x - 62}
                        y={node.y - 22}
                        width={124}
                        height={44}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: reduced ? 0 : 0.4,
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 backdrop-blur-sm transition-all duration-500 ${getStatusColor(
                            node.status
                          )} ${
                            node.status === "pending"
                              ? "bg-white/[0.02]"
                              : node.status === "active"
                              ? "bg-brand-cyan/[0.06]"
                              : "bg-brand-emerald/[0.03]"
                          }`}
                        >
                          {getStatusIcon(node.status, node.icon)}
                          <span
                            className={`text-[10px] font-medium truncate ${
                              node.status === "pending"
                                ? "text-white/30"
                                : node.status === "active"
                                ? "text-brand-cyan"
                                : "text-white/60"
                            }`}
                          >
                            {node.label}
                          </span>
                        </motion.div>
                      </foreignObject>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Bottom execution bar */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-2.5 bg-white/[0.01]">
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-wider uppercase text-white/20">
            <span>Split View</span>
            {isRunning && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brand-cyan/50"
              >
                Executing...
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {(phase === "running" || phase === "done") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                <Clock className="h-3 w-3 text-white/20" />
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    phase === "done" ? "text-brand-emerald/60" : "text-white/30"
                  }`}
                >
                  {(elapsedMs / 1000).toFixed(1)}s
                </span>
              </motion.div>
            )}
            {phase === "done" && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-mono tracking-wider uppercase text-brand-emerald/60"
              >
                execution complete
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
