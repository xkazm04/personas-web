"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitPullRequest,
  FlaskConical,
  FileText,
  Bell,
  Search,
  PenTool,
  CheckCircle,
  Send,
  Inbox,
  BookOpen,
  MessageSquare,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, revealFromBelow } from "@/lib/animations";

import type { LucideIcon } from "lucide-react";

/* ────────────────────────── Data ────────────────────────── */

interface PipelineNode {
  name: string;
  icon: LucideIcon;
}

interface Pipeline {
  id: string;
  title: string;
  label: string;
  color: string;
  glowColor: string;
  nodes: PipelineNode[];
}

const pipelines: Pipeline[] = [
  {
    id: "devops",
    title: "DevOps Pipeline",
    label: "From code review to team notification in one pipeline",
    color: "#34d399",
    glowColor: "rgba(52,211,153,0.15)",
    nodes: [
      { name: "PR Reviewer", icon: GitPullRequest },
      { name: "Test Runner", icon: FlaskConical },
      { name: "Release Notes", icon: FileText },
      { name: "Slack Notifier", icon: Bell },
    ],
  },
  {
    id: "content",
    title: "Content Workflow",
    label: "Automated content creation with human-quality output",
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.15)",
    nodes: [
      { name: "Research Agent", icon: Search },
      { name: "Draft Writer", icon: PenTool },
      { name: "Editor", icon: CheckCircle },
      { name: "Publisher", icon: Send },
    ],
  },
  {
    id: "support",
    title: "Customer Support",
    label: "Intelligent support routing with automatic escalation",
    color: "#06b6d4",
    glowColor: "rgba(6,182,212,0.15)",
    nodes: [
      { name: "Ticket Classifier", icon: Inbox },
      { name: "Knowledge Lookup", icon: BookOpen },
      { name: "Response Drafter", icon: MessageSquare },
      { name: "Escalation Router", icon: ArrowUpRight },
    ],
  },
];

/* ────────────────────────── Animation variants ────────────────────────── */

const flowVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: "easeIn" as const } },
};

/* ────────────────────────── Connector ────────────────────────── */

function Connector({ color, vertical }: { color: string; vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex justify-center py-1">
        <ChevronDown className="h-5 w-5" style={{ color, opacity: 0.6 }} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center px-1 shrink-0">
      <div className="h-px w-6 rounded-full" style={{ backgroundColor: color, opacity: 0.4 }} />
      <ChevronRight className="h-4 w-4 -ml-1" style={{ color, opacity: 0.6 }} />
    </div>
  );
}

/* ────────────────────────── Node ────────────────────────── */

function PipelineNodeCard({ node, color }: { node: PipelineNode; color: string }) {
  const Icon = node.icon;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] transition-colors duration-300"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <span className="text-xs font-medium text-muted-dark text-center whitespace-nowrap">
        {node.name}
      </span>
    </div>
  );
}

/* ────────────────────────── Main Component ────────────────────────── */

export default function PipelineShowcase() {
  const [activeId, setActiveId] = useState("devops");
  const active = pipelines.find((p) => p.id === activeId)!;

  return (
    <SectionWrapper id="pipelines">
      {/* ── Heading ── */}
      <div className="mx-auto max-w-3xl text-center mb-6">
        <motion.div variants={revealFromBelow}>
          <SectionHeading>
            Agents that work <GradientText>together</GradientText>
          </SectionHeading>
        </motion.div>
      </div>

      <motion.p
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center text-lg text-muted-dark mb-12"
      >
        Build visual pipelines where agents collaborate. Output from one feeds into the
        next&nbsp;&mdash; no glue code required.
      </motion.p>

      {/* ── Tab switcher ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-10">
        {pipelines.map((p) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300 border ${
                isActive
                  ? "border-white/[0.12] bg-white/[0.06] text-foreground"
                  : "border-white/[0.04] bg-white/[0.02] text-muted-dark hover:bg-white/[0.04] hover:text-foreground"
              }`}
              style={isActive ? { boxShadow: `0 0 20px ${p.glowColor}` } : undefined}
            >
              {p.title}
            </button>
          );
        })}
      </motion.div>

      {/* ── Pipeline card ── */}
      <motion.div variants={fadeUp} className="mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            variants={flowVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10"
            style={{ boxShadow: `0 0 40px ${active.glowColor}` }}
          >
            {/* Desktop: horizontal flow */}
            <div className="hidden sm:flex items-center justify-center gap-1">
              {active.nodes.map((node, i) => (
                <div key={node.name} className="flex items-center">
                  <PipelineNodeCard node={node} color={active.color} />
                  {i < active.nodes.length - 1 && <Connector color={active.color} />}
                </div>
              ))}
            </div>

            {/* Mobile: vertical flow */}
            <div className="flex sm:hidden flex-col items-center gap-0">
              {active.nodes.map((node, i) => (
                <div key={node.name} className="flex flex-col items-center">
                  <PipelineNodeCard node={node} color={active.color} />
                  {i < active.nodes.length - 1 && <Connector color={active.color} vertical />}
                </div>
              ))}
            </div>

            {/* Label */}
            <p className="mt-8 text-center text-sm text-muted-dark">{active.label}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </SectionWrapper>
  );
}
