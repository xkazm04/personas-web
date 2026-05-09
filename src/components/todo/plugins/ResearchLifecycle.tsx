"use client";

import { motion } from "framer-motion";
import {
  FolderSearch,
  BookOpen,
  Lightbulb,
  FlaskConical,
  BarChart3,
  Feather,
  CheckCircle2,
  Target,
} from "lucide-react";

/* ── Variant A: Research lifecycle pipeline ── */
/* Mirrors sub_projects' 8-stage status progression: scoping → literature → hypothesis → experiment → analysis → writing → review → complete */

interface Stage {
  key: string;
  label: string;
  icon: typeof FolderSearch;
  color: string;
}

const STAGES: Stage[] = [
  { key: "scoping", label: "Scoping", icon: FolderSearch, color: "#fbbf24" },
  { key: "literature", label: "Literature", icon: BookOpen, color: "#3b82f6" },
  { key: "hypothesis", label: "Hypothesis", icon: Lightbulb, color: "#a855f7" },
  { key: "experiment", label: "Experiment", icon: FlaskConical, color: "#34d399" },
  { key: "analysis", label: "Analysis", icon: BarChart3, color: "#06b6d4" },
  { key: "writing", label: "Writing", icon: Feather, color: "#ec4899" },
  { key: "review", label: "Review", icon: Target, color: "#f97316" },
  { key: "complete", label: "Complete", icon: CheckCircle2, color: "#22c55e" },
];

interface Project {
  name: string;
  stageIndex: number;
  papers: number;
  hypotheses: number;
  findings: number;
}

const PROJECTS: Project[] = [
  {
    name: "Long-context retrieval scaling",
    stageIndex: 4, // analysis
    papers: 47,
    hypotheses: 3,
    findings: 1,
  },
  {
    name: "Evaluation of agent tool use",
    stageIndex: 2, // hypothesis
    papers: 23,
    hypotheses: 2,
    findings: 0,
  },
  {
    name: "Prompt-injection attack survey",
    stageIndex: 1, // literature
    papers: 31,
    hypotheses: 0,
    findings: 0,
  },
  {
    name: "Self-healing agent patterns",
    stageIndex: 6, // review
    papers: 18,
    hypotheses: 4,
    findings: 3,
  },
];

export default function ResearchLifecycle() {
  return (
    <div className="p-5 space-y-4">
      {/* Stage timeline */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-base font-mono uppercase tracking-widest text-foreground/65">
          <Target className="h-4 w-4" />
          Research pipeline · 8 stages
        </div>
        <div className="relative">
          {/* Base line */}
          <div className="absolute left-0 right-0 top-[22px] h-0.5 bg-foreground/[0.08]" />

          <div className="flex items-start justify-between relative">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center gap-1.5 flex-1 relative z-10"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: stage.color,
                      backgroundColor: `${stage.color}14`,
                      boxShadow: `0 0 20px ${stage.color}30`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: stage.color }} />
                  </div>
                  <span
                    className="text-base font-mono uppercase tracking-widest font-semibold"
                    style={{ color: stage.color }}
                  >
                    {stage.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects list with stage markers */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-base font-mono uppercase tracking-widest text-foreground/65">
          <FolderSearch className="h-4 w-4" />
          Active projects · 4
        </div>
        <div className="space-y-2">
          {PROJECTS.map((project, pi) => {
            const stage = STAGES[project.stageIndex];
            const progress = ((project.stageIndex + 1) / STAGES.length) * 100;
            return (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + pi * 0.1 }}
                className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold text-foreground leading-tight truncate">
                      {project.name}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-base font-mono text-foreground/60">
                      <span>{project.papers} papers</span>
                      <span>·</span>
                      <span>{project.hypotheses} hypotheses</span>
                      <span>·</span>
                      <span>{project.findings} findings</span>
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-1 text-base font-mono uppercase tracking-widest"
                    style={{
                      borderColor: `${stage.color}40`,
                      backgroundColor: `${stage.color}15`,
                      color: stage.color,
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
                {/* Progress rail */}
                <div className="h-1 rounded-full bg-foreground/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + pi * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${STAGES[0].color}, ${stage.color})`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
