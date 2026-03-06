"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Mail, MessageSquare, Github, HardDrive, SquareKanban,
  BookOpen, CreditCard, Calendar, Figma, LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { fadeUp } from "@/lib/animations";

const tools = [
  { id: "gmail", name: "Gmail", icon: Mail, color: "#ea4335", useCases: [
    { title: "Inbox triage", desc: "Auto-label, prioritize, and draft replies for inbound emails based on sender and content." },
    { title: "Follow-up reminders", desc: "Detect unanswered threads and send gentle follow-ups after configurable delays." },
    { title: "Meeting prep", desc: "Scan upcoming calendar invites, pull relevant email threads, and summarize context." },
  ]},
  { id: "slack", name: "Slack", icon: MessageSquare, color: "#4a154b", useCases: [
    { title: "Channel summarizer", desc: "Digest long channels into actionable summaries delivered to you every morning." },
    { title: "Standup collector", desc: "DM each team member for status updates, compile into a single standup post." },
    { title: "Alert router", desc: "Triage incoming alerts from monitoring tools and escalate to the right channel." },
  ]},
  { id: "github", name: "GitHub", icon: Github, color: "#8b5cf6", useCases: [
    { title: "PR reviewer", desc: "Analyze pull requests for bugs, style issues, and missing tests — post inline comments." },
    { title: "Issue groomer", desc: "Auto-label stale issues, request more info, and suggest duplicates." },
    { title: "Release notes", desc: "Generate changelog entries from merged PRs grouped by category and impact." },
  ]},
  { id: "drive", name: "Google Drive", icon: HardDrive, color: "#34a853", useCases: [
    { title: "Doc organizer", desc: "Auto-file documents into folders based on content, project tags, and ownership." },
    { title: "Permissions auditor", desc: "Weekly scan of shared files — flag over-shared docs and external access." },
    { title: "Content indexer", desc: "Build a searchable knowledge base from scattered Drive documents." },
  ]},
  { id: "jira", name: "Jira", icon: SquareKanban, color: "#0052cc", useCases: [
    { title: "Sprint planner", desc: "Analyze velocity history and suggest optimal story point allocation for next sprint." },
    { title: "Blocker detector", desc: "Monitor ticket dependencies and alert when a critical path item is stuck." },
    { title: "Status syncer", desc: "Keep Jira tickets in sync with GitHub PRs — auto-transition on merge." },
  ]},
  { id: "notion", name: "Notion", icon: BookOpen, color: "#e6e6e6", useCases: [
    { title: "Meeting notes", desc: "Transcribe recordings, extract action items, and create linked Notion pages." },
    { title: "Wiki gardener", desc: "Find outdated docs, suggest updates, and archive pages with no recent views." },
    { title: "Template filler", desc: "Auto-populate project brief templates from intake form responses." },
  ]},
  { id: "stripe", name: "Stripe", icon: CreditCard, color: "#635bff", useCases: [
    { title: "Failed payment recovery", desc: "Email customers with failed charges — offer retry links and alternative methods." },
    { title: "Revenue alerting", desc: "Monitor MRR changes and notify Slack when churn spikes or upgrades surge." },
    { title: "Invoice reconciler", desc: "Match Stripe payouts against your accounting system and flag discrepancies." },
  ]},
  { id: "calendar", name: "Calendar", icon: Calendar, color: "#06b6d4", useCases: [
    { title: "Schedule optimizer", desc: "Detect meeting-heavy days and suggest blocks for focus time automatically." },
    { title: "No-show handler", desc: "Track attendees who miss meetings and send rescheduling links." },
    { title: "Timezone coordinator", desc: "Find optimal meeting slots across global teams with minimal late-night asks." },
  ]},
  { id: "figma", name: "Figma", icon: Figma, color: "#f24e1e", useCases: [
    { title: "Design handoff", desc: "Extract component specs, tokens, and assets — post to the dev channel." },
    { title: "Comment tracker", desc: "Aggregate unresolved Figma comments and create follow-up tasks." },
    { title: "Version differ", desc: "Compare file versions and summarize visual changes for stakeholder review." },
  ]},
];

const AUTOPLAY_INTERVAL = 4000;


export default function UseCases() {
  const uid = useId();
  const prefersReducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<string>(tools[0].id);
  const [autoplay, setAutoplay] = useState(!prefersReducedMotion);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [connectorPath, setConnectorPath] = useState<string>("");
  const [connectorVisible, setConnectorVisible] = useState(false);
  const userClickedRef = useRef(false);
  const progressRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const detailCardRef = useRef<HTMLDivElement | null>(null);
  const desktopButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const selectionCycleRef = useRef(0);
  const activeTool = tools.find((t) => t.id === selected);
  const totalAutomations = tools.reduce((sum, tool) => sum + tool.useCases.length, 0);

  const advanceToNext = useCallback(() => {
    setSelected((prev) => {
      const idx = tools.findIndex((t) => t.id === prev);
      return tools[(idx + 1) % tools.length].id;
    });
    setProgress(0);
    progressRef.current = 0;
  }, []);

  const rafStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoplay) return;
    rafStartRef.current = null;
    let rafId: number;

    const frame = (timestamp: number) => {
      // Pause autoplay timer while the tab is backgrounded
      if (document.hidden) {
        rafId = requestAnimationFrame(frame);
        return;
      }
      if (rafStartRef.current === null) rafStartRef.current = timestamp;
      const elapsed = timestamp - rafStartRef.current;
      const pct = Math.min(elapsed / AUTOPLAY_INTERVAL, 1);

      // Only update state when progress changes by ≥1% to reduce re-renders
      if (Math.abs(pct - progressRef.current) >= 0.01 || pct >= 1) {
        progressRef.current = pct;
        setProgress(pct);
      }

      if (pct >= 1) {
        advanceToNext();
      } else {
        rafId = requestAnimationFrame(frame);
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [autoplay, selected, advanceToNext]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const updatePath = () => {
      const container = containerRef.current;
      const detail = detailCardRef.current;
      if (!container || !detail) return;

      const sourceButton = isMobile
        ? mobileButtonRefs.current[selected]
        : desktopButtonRefs.current[selected];

      if (!sourceButton || sourceButton.offsetParent === null) {
        setConnectorPath("");
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const sourceRect = sourceButton.getBoundingClientRect();
      const detailRect = detail.getBoundingClientRect();

      const sx = sourceRect.left + sourceRect.width / 2 - containerRect.left;
      const sy = sourceRect.top + sourceRect.height / 2 - containerRect.top;
      const tx = detailRect.left + detailRect.width / 2 - containerRect.left;
      const ty = detailRect.top - containerRect.top + 8;
      const cpY = sy + (ty - sy) * 0.55;

      setConnectorPath(`M ${sx} ${sy} C ${sx} ${cpY}, ${tx} ${cpY}, ${tx} ${ty}`);
    };

    selectionCycleRef.current += 1;
    const currentCycle = selectionCycleRef.current;
    setConnectorVisible(false);

    const timer = window.setTimeout(() => {
      if (selectionCycleRef.current !== currentCycle) return;
      updatePath();
      setConnectorVisible(true);
    }, 200);

    const onResize = () => {
      updatePath();
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [selected, isMobile]);

  const handleManualClick = useCallback((toolId: string) => {
    if (!userClickedRef.current) { userClickedRef.current = true; setAutoplay(false); }
    setSelected(toolId);
    setProgress(0);
    progressRef.current = 0;
  }, []);

  const handleToolbarKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIdx = tools.findIndex((t) => t.id === selected);
    let nextIdx: number | null = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIdx = (currentIdx + 1) % tools.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIdx = (currentIdx - 1 + tools.length) % tools.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIdx = tools.length - 1;
    } else if (e.key === "Escape") {
      e.preventDefault();
      setAutoplay(true);
      userClickedRef.current = false;
      setProgress(0);
      progressRef.current = 0;
      return;
    }

    if (nextIdx !== null) {
      const nextId = tools[nextIdx].id;
      handleManualClick(nextId);
      // Focus the corresponding button
      const btn = isMobile
        ? mobileButtonRefs.current[nextId]
        : desktopButtonRefs.current[nextId];
      btn?.focus();
    }
  }, [selected, isMobile, handleManualClick]);

  return (
    <SectionWrapper id="use-cases">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-125 w-200 -translate-x-1/2 rounded-full opacity-30" style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.04) 0%, transparent 60%)" }} />
      </div>

      <motion.div variants={fadeUp} className="relative">
        <SectionHeading className="text-center">
          One agent per tool.{" "}
          <GradientText className="drop-shadow-lg">Infinite possibilities</GradientText>
        </SectionHeading>
        <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between max-w-4xl mx-auto">
          <span className="shrink-0 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-brand-emerald shadow-[0_0_15px_rgba(52,211,153,0.2)] font-mono">
            {tools.length} integrations · {totalAutomations} patterns
          </span>
          <p className="text-muted-dark leading-relaxed text-base sm:text-right max-w-lg font-light">
            Click any integration to explore what a Personas agent can automate.
            {autoplay && <span className="text-white/70 font-medium"> Auto-cycling — click to stop.</span>}
          </p>
        </div>
      </motion.div>

      <div ref={containerRef} className="mt-16 relative">
        <svg className="pointer-events-none absolute inset-0 z-5 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={`${uid}-connectorGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={activeTool?.color || "rgba(6,182,212,0.5)"} stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.5)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.path
            d={connectorPath}
            initial={false}
            animate={{ opacity: connectorVisible && connectorPath ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            fill="none"
            stroke={`url(#${uid}-connectorGrad)`}
            strokeWidth="2"
            strokeDasharray="6 6"
            style={{ animation: "dash-flow 1.4s linear infinite" }}
          />
        </svg>

        {/* ── Desktop: grid layout (md+) ── */}
        {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
        <motion.div variants={fadeUp} className="hidden md:grid grid-cols-5 gap-3 mx-auto max-w-2xl lg:grid-cols-9 lg:max-w-4xl" role="toolbar" aria-label="Integration tools" onKeyDown={handleToolbarKeyDown}>
          {tools.map((tool, i) => {
            const isActive = selected === tool.id;
            return (
              <motion.button
                key={tool.id}
                ref={(node) => {
                  desktopButtonRefs.current[tool.id] = node;
                }}
                tabIndex={isActive ? 0 : -1}
                aria-pressed={isActive}
                onClick={() => handleManualClick(tool.id)}
                className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-sm transition-all duration-500 cursor-pointer ${
                  isActive
                    ? "border-brand-cyan/30 bg-brand-cyan/8 shadow-[0_0_40px_rgba(6,182,212,0.10)] scale-110 z-10"
                    : "border-white/5 bg-white/1.5 hover:border-white/10 hover:bg-white/3"
                }`}
                style={{
                  boxShadow: isActive ? `0 0 40px ${tool.color}30` : undefined
                }}
                whileHover={{
                  scale: isActive ? 1.1 : 1.06,
                  boxShadow: `0 0 20px ${tool.color}20`
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                {isActive && autoplay && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 bg-white/6">
                    <div
                      className="h-full bg-linear-to-r from-brand-cyan to-brand-purple transition-none"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-shadow duration-500 ${isActive ? "shadow-[0_0_20px_rgba(6,182,212,0.15)]" : ""}`} style={{ backgroundColor: `${tool.color}15` }}>
                  <tool.icon className="h-5 w-5 transition-transform duration-300" style={{ color: tool.color === "#e6e6e6" ? "#999" : tool.color, transform: isActive ? "scale(1.1)" : undefined }} />
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-dark"}`}>{tool.name}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Mobile: horizontally-scrollable strip (<md) ── */}
        <motion.div
          variants={fadeUp}
          className="md:hidden"
          style={{
            maskImage: "linear-gradient(to right, black 85%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, black 85%, transparent)",
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide" role="toolbar" aria-label="Integration tools" onKeyDown={handleToolbarKeyDown}>
            {tools.map((tool, i) => {
              const isActive = selected === tool.id;
              return (
                <motion.button
                  key={tool.id}
                  ref={(node) => {
                    mobileButtonRefs.current[tool.id] = node;
                  }}
                  tabIndex={isActive ? 0 : -1}
                  aria-pressed={isActive}
                  onClick={() => handleManualClick(tool.id)}
                  className={`relative flex shrink-0 snap-start flex-col items-center gap-2 overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-sm transition-all duration-500 cursor-pointer ${
                    isActive
                      ? "border-brand-cyan/30 bg-brand-cyan/8 shadow-[0_0_40px_rgba(6,182,212,0.10)]"
                        : "border-white/5 bg-white/1.5"
                  }`}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  {isActive && autoplay && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 bg-white/6">
                      <div
                        className="h-full bg-linear-to-r from-brand-cyan to-brand-purple transition-none"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  )}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-shadow duration-500 ${isActive ? "shadow-[0_0_20px_rgba(6,182,212,0.15)]" : ""}`} style={{ backgroundColor: `${tool.color}15` }}>
                    <tool.icon className="h-5 w-5" style={{ color: tool.color === "#e6e6e6" ? "#999" : tool.color }} />
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-dark"}`}>{tool.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTool && (
            <motion.div
              key={activeTool.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mx-auto mt-8 max-w-3xl"
              ref={detailCardRef}
            >
              <div className="relative rounded-2xl border border-white/5 bg-linear-to-br from-white/2.5 to-transparent p-4 sm:p-8 backdrop-blur-md overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('/imgs/noise.png')] mix-blend-overlay" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: `${activeTool.color}08` }} />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent" />

                <div className="relative mb-6 flex flex-wrap items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg" style={{ backgroundColor: `${activeTool.color}12`, boxShadow: `0 4px 20px ${activeTool.color}10` }}>
                    <activeTool.icon className="h-5 w-5" style={{ color: activeTool.color === "#e6e6e6" ? "#999" : activeTool.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{activeTool.name} Agents</h3>
                    <p className="text-xs text-muted-dark">What Personas can automate</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 items-start">
                  {activeTool.useCases.map((uc, i) => (
                    <motion.div
                      key={uc.title}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${activeTool.color}30`, borderColor: `${activeTool.color}50` }}
                      transition={{ delay: i * 0.15, duration: 0.4, ease: "easeOut" }}
                      className={`group rounded-xl border border-white/4 bg-white/1.5 p-4 transition-all duration-300 hover:bg-white/2.5 ${i === 1 ? "md:-mt-2" : i === 2 ? "md:mt-4" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
                        />
                        <h4 className="text-sm font-medium group-hover:text-white transition-colors">{uc.title}</h4>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-dark group-hover:text-muted transition-colors">{uc.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div variants={fadeUp} className="mt-12 flex justify-center">
        <Link
          href="/templates"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brand-cyan/30 bg-brand-cyan/5 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:border-brand-cyan/50 hover:bg-brand-cyan/10 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <LayoutGrid className="relative h-5 w-5 text-brand-cyan transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="relative">Browse All Templates</span>
        </Link>
      </motion.div>

    </SectionWrapper>
  );
}
