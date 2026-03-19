"use client";

import { useState, useEffect, useCallback, useRef, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Users, ArrowRight, Brain, BookOpen, Workflow, GitBranch } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

const pipelineNodes = [
  { id: "inbox", label: "Email Triage", color: "#06b6d4", cx: 12, cy: 50 },
  { id: "classify", label: "Classifier", color: "#a855f7", cx: 35, cy: 25 },
  { id: "urgent", label: "Urgent Handler", color: "#f43f5e", cx: 60, cy: 12 },
  { id: "summary", label: "Summarizer", color: "#34d399", cx: 60, cy: 65 },
  { id: "slack", label: "Slack Poster", color: "#fbbf24", cx: 88, cy: 50 },
];

const connections = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
];

const teamFeatures = [
  { icon: Workflow, title: "Visual node-and-edge editor", desc: "React Flow canvas for wiring personas together. Drag, drop, connect — see data flow in real time with undo/redo.", color: "#06b6d4" },
  { icon: ArrowRight, title: "Data-flow connections", desc: "Output from one persona becomes input for the next. JSON mapping between agents with cascading status propagation.", color: "#a855f7" },
  { icon: Brain, title: "Shared memory pool", desc: "Team-wide knowledge sharing. Cross-persona context so agent B knows what agent A learned.", color: "#34d399" },
  { icon: BookOpen, title: "Reusable recipes", desc: "Define multi-step workflows as recipes. Version them, promote successful patterns, deploy with one click.", color: "#fbbf24" },
  { icon: GitBranch, title: "Team synthesis", desc: "AI-driven analysis of multi-persona interaction patterns. Find bottlenecks and optimize the pipeline.", color: "#f43f5e" },
];

export default function TeamCanvas() {
  const uid = useId();
  const prefersReducedMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [pulseEdge, setPulseEdge] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Animate data flowing through edges
  const tick = useCallback(() => {
    const edgeIdx = Math.floor(Math.random() * connections.length);
    setPulseEdge(edgeIdx);
    setTimeout(() => setPulseEdge(null), 1200);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      timerRef.current = setTimeout(() => { tick(); schedule(); }, 2000 + Math.random() * 2000);
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [tick, prefersReducedMotion]);

  return (
    <SectionWrapper id="teams">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Team canvas &{" "}
            <GradientText className="drop-shadow-lg">multi-agent pipelines</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Wire personas together on a visual canvas. Build pipelines where output flows
          from one agent to the next — <span className="text-white/80 font-medium">with shared memory and reusable recipes.</span>
        </motion.p>
      </motion.div>

      {/* Pipeline visualization */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 mx-auto max-w-3xl"
      >
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          {/* Canvas header */}
          <div className="flex items-center justify-between border-b border-white/4 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-brand-rose/40" />
                <div className="h-2 w-2 rounded-full bg-brand-amber/40" />
                <div className="h-2 w-2 rounded-full bg-brand-emerald/40" />
              </div>
              <span className="text-[10px] font-mono text-white/20 ml-1">team-canvas</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-white/20">
              <span>{pipelineNodes.length} agents</span>
              <span>{connections.length} connections</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.5)] animate-pulse" />
                <span className="text-brand-emerald/50">live</span>
              </div>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative p-6" style={{ height: 220 }}>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                {connections.map((c, i) => (
                  <linearGradient key={i} id={`${uid}-edge-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={pipelineNodes[c.from].color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={pipelineNodes[c.to].color} stopOpacity="0.4" />
                  </linearGradient>
                ))}
              </defs>
              {/* Connection lines */}
              {connections.map((c, i) => {
                const from = pipelineNodes[c.from];
                const to = pipelineNodes[c.to];
                const x1 = `${from.cx + 4}%`;
                const y1 = `${from.cy}%`;
                const x2 = `${to.cx - 4}%`;
                const y2 = `${to.cy}%`;
                const isPulsing = pulseEdge === i;
                return (
                  <g key={i}>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={`url(#${uid}-edge-${i})`}
                      strokeWidth={isPulsing ? 2 : 1}
                      strokeDasharray={isPulsing ? "none" : "6 6"}
                      className="transition-all duration-300"
                    />
                    {isPulsing && (
                      <circle r="3" fill={pipelineNodes[c.to].color} opacity="0.8">
                        <animateMotion
                          dur="0.8s"
                          repeatCount="1"
                          path={`M ${(from.cx + 4) * 6},${ from.cy * 2.2} L ${(to.cx - 4) * 6},${to.cy * 2.2}`}
                        />
                        <animate attributeName="opacity" values="0.8;0" dur="0.8s" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {pipelineNodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: "spring", bounce: 0.4 }}
                onMouseEnter={() => setActiveNode(i)}
                onMouseLeave={() => setActiveNode(null)}
                className={`absolute flex items-center gap-2 rounded-lg border px-3 py-2 backdrop-blur-sm cursor-default transition-all duration-300 ${
                  activeNode === i
                    ? "border-white/25 bg-white/10 shadow-lg z-10 scale-110"
                    : "border-white/10 bg-white/5"
                }`}
                style={{
                  left: `${node.cx}%`,
                  top: `${node.cy}%`,
                  transform: `translate(-50%, -50%)${activeNode === i ? " scale(1.1)" : ""}`,
                  boxShadow: activeNode === i ? `0 0 25px ${node.color}30` : undefined,
                }}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full transition-shadow duration-300"
                  style={{
                    backgroundColor: node.color,
                    boxShadow: activeNode === i ? `0 0 10px ${node.color}80` : `0 0 4px ${node.color}40`,
                  }}
                />
                <span className="text-[11px] font-mono text-white/70 whitespace-nowrap">{node.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-white/4 px-5 py-3 text-[10px] font-mono text-white/20">
            <Users className="h-3 w-3" />
            <span>5-agent email pipeline — hover nodes to inspect</span>
          </div>
        </div>
      </motion.div>

      {/* Feature cards */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
        {teamFeatures.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${f.color}15` }}
            className="group rounded-xl border border-white/6 bg-white/2 p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300" style={{ backgroundColor: `${f.color}12` }}>
              <f.icon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" style={{ color: f.color }} />
            </div>
            <div className="mt-3 text-sm font-medium text-white/90">{f.title}</div>
            <div className="mt-2 text-xs text-muted-dark leading-relaxed">{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
