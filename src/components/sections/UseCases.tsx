"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Github,
  HardDrive,
  SquareKanban,
  BookOpen,
  CreditCard,
  Calendar,
  Figma,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

const tools = [
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    color: "#ea4335",
    useCases: [
      { title: "Inbox triage", desc: "Auto-label, prioritize, and draft replies for inbound emails based on sender and content." },
      { title: "Follow-up reminders", desc: "Detect unanswered threads and send gentle follow-ups after configurable delays." },
      { title: "Meeting prep", desc: "Scan upcoming calendar invites, pull relevant email threads, and summarize context." },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    icon: MessageSquare,
    color: "#4a154b",
    useCases: [
      { title: "Channel summarizer", desc: "Digest long channels into actionable summaries delivered to you every morning." },
      { title: "Standup collector", desc: "DM each team member for status updates, compile into a single standup post." },
      { title: "Alert router", desc: "Triage incoming alerts from monitoring tools and escalate to the right channel." },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    icon: Github,
    color: "#8b5cf6",
    useCases: [
      { title: "PR reviewer", desc: "Analyze pull requests for bugs, style issues, and missing tests — post inline comments." },
      { title: "Issue groomer", desc: "Auto-label stale issues, request more info, and suggest duplicates." },
      { title: "Release notes", desc: "Generate changelog entries from merged PRs grouped by category and impact." },
    ],
  },
  {
    id: "drive",
    name: "Google Drive",
    icon: HardDrive,
    color: "#34a853",
    useCases: [
      { title: "Doc organizer", desc: "Auto-file documents into folders based on content, project tags, and ownership." },
      { title: "Permissions auditor", desc: "Weekly scan of shared files — flag over-shared docs and external access." },
      { title: "Content indexer", desc: "Build a searchable knowledge base from scattered Drive documents." },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    icon: SquareKanban,
    color: "#0052cc",
    useCases: [
      { title: "Sprint planner", desc: "Analyze velocity history and suggest optimal story point allocation for next sprint." },
      { title: "Blocker detector", desc: "Monitor ticket dependencies and alert when a critical path item is stuck." },
      { title: "Status syncer", desc: "Keep Jira tickets in sync with GitHub PRs — auto-transition on merge." },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    icon: BookOpen,
    color: "#e6e6e6",
    useCases: [
      { title: "Meeting notes", desc: "Transcribe recordings, extract action items, and create linked Notion pages." },
      { title: "Wiki gardener", desc: "Find outdated docs, suggest updates, and archive pages with no recent views." },
      { title: "Template filler", desc: "Auto-populate project brief templates from intake form responses." },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: CreditCard,
    color: "#635bff",
    useCases: [
      { title: "Failed payment recovery", desc: "Email customers with failed charges — offer retry links and alternative methods." },
      { title: "Revenue alerting", desc: "Monitor MRR changes and notify Slack when churn spikes or upgrades surge." },
      { title: "Invoice reconciler", desc: "Match Stripe payouts against your accounting system and flag discrepancies." },
    ],
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: Calendar,
    color: "#06b6d4",
    useCases: [
      { title: "Schedule optimizer", desc: "Detect meeting-heavy days and suggest blocks for focus time automatically." },
      { title: "No-show handler", desc: "Track attendees who miss meetings and send rescheduling links." },
      { title: "Timezone coordinator", desc: "Find optimal meeting slots across global teams with minimal late-night asks." },
    ],
  },
  {
    id: "figma",
    name: "Figma",
    icon: Figma,
    color: "#f24e1e",
    useCases: [
      { title: "Design handoff", desc: "Extract component specs, tokens, and assets — post to the dev channel." },
      { title: "Comment tracker", desc: "Aggregate unresolved Figma comments and create follow-up tasks." },
      { title: "Version differ", desc: "Compare file versions and summarize visual changes for stakeholder review." },
    ],
  },
];

const AUTOPLAY_INTERVAL = 4000;

/* Pre-computed positions for the organic floating layout */
const positions = [
  { x: 8, y: 5 },
  { x: 55, y: 0 },
  { x: 85, y: 8 },
  { x: 0, y: 38 },
  { x: 35, y: 32 },
  { x: 68, y: 36 },
  { x: 15, y: 68 },
  { x: 50, y: 65 },
  { x: 80, y: 62 },
];

export default function UseCases() {
  const [selected, setSelected] = useState<string>(tools[0].id);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const userClickedRef = useRef(false);
  const progressRef = useRef(0);
  const activeTool = tools.find((t) => t.id === selected);

  const advanceToNext = useCallback(() => {
    setSelected((prev) => {
      const idx = tools.findIndex((t) => t.id === prev);
      return tools[(idx + 1) % tools.length].id;
    });
    setProgress(0);
    progressRef.current = 0;
  }, []);

  /* Autoplay timer */
  useEffect(() => {
    if (!autoplay) return;

    const tick = 50; // update progress every 50ms
    const interval = setInterval(() => {
      progressRef.current += tick;
      setProgress(progressRef.current / AUTOPLAY_INTERVAL);

      if (progressRef.current >= AUTOPLAY_INTERVAL) {
        advanceToNext();
      }
    }, tick);

    return () => clearInterval(interval);
  }, [autoplay, selected, advanceToNext]);

  const handleManualClick = (toolId: string) => {
    if (!userClickedRef.current) {
      userClickedRef.current = true;
      setAutoplay(false);
    }
    setSelected(toolId);
    setProgress(0);
    progressRef.current = 0;
  };

  return (
    <SectionWrapper id="use-cases">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.04) 0%, transparent 60%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-emerald/20 bg-brand-emerald/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-emerald/70 font-mono mb-6">
          Integrations
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          One agent per tool.{" "}
          <GradientText>Infinite possibilities</GradientText>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          Click any integration to explore what a Personas agent can automate.
          {autoplay && <span className="text-muted-dark"> Auto-cycling — click to stop.</span>}
        </p>
      </motion.div>

      <div className="mt-16 relative">
        {/* Tool icons — organic floating grid */}
        <motion.div variants={fadeUp} className="relative mx-auto" style={{ maxWidth: 720, height: 320 }}>
          {tools.map((tool, i) => {
            const pos = positions[i];
            const isActive = selected === tool.id;
            return (
              <motion.button
                key={tool.id}
                onClick={() => handleManualClick(tool.id)}
                className={`absolute flex flex-col items-center gap-2 rounded-2xl border px-4 py-3 backdrop-blur-sm transition-all duration-500 cursor-pointer ${
                  isActive
                    ? "border-brand-cyan/30 bg-brand-cyan/8 shadow-[0_0_40px_rgba(6,182,212,0.10)] scale-110 z-10"
                    : "border-white/[0.05] bg-white/[0.015] hover:border-white/[0.10] hover:bg-white/[0.03]"
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                whileHover={{ scale: isActive ? 1.1 : 1.06 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                {/* Progress ring for active tool during autoplay */}
                {isActive && autoplay && (
                  <svg className="pointer-events-none absolute -inset-[3px] z-20" viewBox="0 0 100 100">
                    <rect
                      x="1" y="1" width="98" height="98" rx="16"
                      fill="none"
                      stroke="rgba(6,182,212,0.3)"
                      strokeWidth="1.5"
                      strokeDasharray={`${progress * 388} 388`}
                      strokeLinecap="round"
                      className="transition-none"
                    />
                  </svg>
                )}

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-shadow duration-500 ${
                    isActive ? "shadow-[0_0_20px_rgba(6,182,212,0.15)]" : ""
                  }`}
                  style={{ backgroundColor: `${tool.color}15` }}
                >
                  <tool.icon
                    className="h-5 w-5 transition-transform duration-300"
                    style={{
                      color: tool.color === "#e6e6e6" ? "#999" : tool.color,
                      transform: isActive ? "scale(1.1)" : undefined,
                    }}
                  />
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-dark"}`}>
                  {tool.name}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Use case panel */}
        <AnimatePresence mode="wait">
          {activeTool && (
            <motion.div
              key={activeTool.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mx-auto mt-8 max-w-3xl"
            >
              <div className="relative rounded-2xl border border-white/[0.05] bg-gradient-to-br from-white/[0.025] to-transparent p-8 backdrop-blur-md overflow-hidden">
                {/* Corner accent glow */}
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full blur-3xl"
                  style={{ backgroundColor: `${activeTool.color}08` }}
                />
                {/* Bottom border accent */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-6 relative">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                    style={{ backgroundColor: `${activeTool.color}12`, boxShadow: `0 4px 20px ${activeTool.color}10` }}
                  >
                    <activeTool.icon
                      className="h-5 w-5"
                      style={{ color: activeTool.color === "#e6e6e6" ? "#999" : activeTool.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{activeTool.name} Agents</h3>
                    <p className="text-xs text-muted-dark">What Personas can automate</p>
                  </div>
                </div>

                {/* Use cases */}
                <div className="grid gap-4 md:grid-cols-3">
                  {activeTool.useCases.map((uc, i) => (
                    <motion.div
                      key={uc.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                      className="group rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
                        <h4 className="text-sm font-medium">{uc.title}</h4>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-dark">
                        {uc.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
