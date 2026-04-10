"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Circle, CheckCircle2, Rocket, Loader2,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";

// -- Types matching Supabase schema ------------------------------------------

type RoadmapItem = {
  id: string;
  name: string;
  description: string;
  status: "in_progress" | "next" | "planned" | "completed";
  priority: "now" | "next" | "later";
  sort_order: number;
};

// -- Fallback data (used when API is unavailable) ----------------------------

const FALLBACK_ITEMS: RoadmapItem[] = [
  { id: "1", name: "Dev Mode", description: "Development mode tooling, debugging, and hot-reload capabilities for rapid agent iteration.", status: "in_progress", priority: "now", sort_order: 1 },
  { id: "2", name: "Cloud Integration", description: "Connect desktop app to cloud orchestrator for 24/7 agent execution with WebSocket streaming.", status: "in_progress", priority: "now", sort_order: 2 },
  { id: "3", name: "Web App", description: "Marketing site, auth portal, subscription management, and cloud dashboard.", status: "in_progress", priority: "now", sort_order: 3 },
  { id: "4", name: "Internationalization", description: "Multi-language support with locale management, RTL layouts, and community translations.", status: "in_progress", priority: "now", sort_order: 4 },
  { id: "5", name: "Distribution & Polish", description: "Production-ready installers, auto-updates, code signing, and final QA across all platforms.", status: "next", priority: "next", sort_order: 5 },
  { id: "6", name: "Team (Group Projects)", description: "Shared workspaces, collaborative agent development, role-based access, and team dashboards.", status: "next", priority: "next", sort_order: 6 },
];

// -- Visual config -----------------------------------------------------------

const statusConfig: Record<RoadmapItem["status"], { labelKey: "inProgress" | "next" | "planned" | "completed"; dotClass: string; badgeClass: string; lineClass: string }> = {
  in_progress: {
    labelKey: "inProgress",
    dotClass: "bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.5)]",
    badgeClass: "border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan/70",
    lineClass: "bg-brand-cyan/30",
  },
  next: {
    labelKey: "next",
    dotClass: "bg-brand-purple/60",
    badgeClass: "border-brand-purple/20 bg-brand-purple/5 text-brand-purple/70",
    lineClass: "bg-white/[0.06]",
  },
  planned: {
    labelKey: "planned",
    dotClass: "bg-white/20",
    badgeClass: "border-white/[0.06] bg-white/[0.02] text-muted-dark",
    lineClass: "bg-white/[0.04]",
  },
  completed: {
    labelKey: "completed",
    dotClass: "bg-brand-emerald shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    badgeClass: "border-brand-emerald/20 bg-brand-emerald/5 text-brand-emerald/70",
    lineClass: "bg-brand-emerald/30",
  },
};

const priorityBadgeClass: Record<RoadmapItem["priority"], string> = {
  now: "border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan/70",
  next: "border-brand-purple/20 bg-brand-purple/5 text-brand-purple/70",
  later: "border-white/[0.08] bg-white/[0.02] text-muted-dark",
};

// -- Card component ----------------------------------------------------------

const RoadmapCard = memo(function RoadmapCard({
  item,
  index,
  total,
}: {
  item: RoadmapItem;
  index: number;
  total: number;
}) {
  const { t } = useTranslation();
  const status = statusConfig[item.status];

  return (
    <motion.div variants={fadeUp} className="relative flex gap-6 md:gap-8">
      {/* Timeline spine */}
      <div className="relative flex flex-col items-center pt-1">
        <div className={`relative z-10 h-3.5 w-3.5 rounded-full ${status.dotClass} ring-4 ring-background`}>
          {item.status === "in_progress" && (
            <div className="absolute inset-0 rounded-full bg-brand-cyan/30 animate-ping" />
          )}
        </div>
        {index < total - 1 && (
          <div className={`mt-1 w-px flex-1 ${status.lineClass}`} />
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 pb-10">
        <div className="relative">
          <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-6 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] font-mono text-sm font-bold text-muted shrink-0">
                  {item.sort_order}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-sm font-medium tracking-wider uppercase ${status.badgeClass}`}>
                      {t.roadmapSection[status.labelKey]}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-sm font-medium tracking-wider uppercase ${priorityBadgeClass[item.priority]}`}>
                      {item.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-muted-dark mt-1 max-w-lg">{item.description}</p>
                </div>
              </div>
            </div>
          </div>
          {item.status === "in_progress" && (
            <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl overflow-hidden">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <rect
                  x="1" y="1"
                  width="100%" height="100%"
                  rx="16" ry="16"
                  fill="none"
                  stroke="rgba(6,182,212,0.2)"
                  strokeWidth="1.5"
                  strokeDasharray="8 8"
                  style={{ animation: "dash-flow 2s linear infinite" }}
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// -- Main component ----------------------------------------------------------

export default function Roadmap() {
  const [items, setItems] = useState<RoadmapItem[]>(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.items?.length) setItems(data.items);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const inProgressCount = items.filter((i) => i.status === "in_progress").length;
  const nextCount = items.filter((i) => i.status === "next").length;

  return (
    <SectionWrapper id="roadmap">
      <motion.div variants={fadeUp} className="text-center relative">
        <SectionHeading>
          Product <GradientText className="drop-shadow-lg">Roadmap</GradientText>
        </SectionHeading>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          What we&apos;re building now and what comes next.
          {loading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin text-brand-cyan/50" />}
        </p>
      </motion.div>

      {/* Summary pills */}
      <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
          <span className="text-sm font-mono font-medium text-brand-cyan">{inProgressCount} In Progress</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-brand-purple/60" />
          <span className="text-sm font-mono font-medium text-brand-purple/70">{nextCount} Next</span>
        </div>
      </motion.div>

      {/* Milestone callout */}
      <motion.div variants={fadeUp} className="mt-10 mx-auto max-w-3xl rounded-2xl border border-brand-cyan/30 bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 px-6 py-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/imgs/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-cyan/20 ring-1 ring-brand-cyan/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Rocket className="h-6 w-6 text-brand-cyan" />
          </div>
          <div>
            <p className="text-sm font-mono font-bold uppercase tracking-widest text-brand-cyan drop-shadow-sm">Current focus</p>
            <p className="mt-1.5 text-base text-foreground font-medium leading-relaxed">
              Shipping <span className="text-white font-bold">Dev Mode</span>, <span className="text-white font-bold">Cloud Integration</span>, <span className="text-white font-bold">Web App</span> and <span className="text-white font-bold">Internationalization</span>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={fadeUp} className="mt-14 mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-mono text-muted mb-4">
          <span className="font-medium tracking-wide">11 of 15 phases complete</span>
          <span className="text-brand-cyan font-bold text-sm drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">73%</span>
        </div>
        <div className="relative h-2.5 rounded-full bg-white/[0.06] shadow-inner">
          <motion.div
            className="relative h-full rounded-full bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.5)] overflow-hidden"
            initial={{ width: 0 }}
            whileInView={{ width: "73%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          >
            <div
              className="absolute inset-0 animate-progress-shimmer"
              style={{
                background: "linear-gradient(90deg, transparent 70%, rgba(255,255,255,0.15) 90%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          </motion.div>
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-cyan animate-progress-dot-breathe"
            style={{ boxShadow: "0 0 6px rgba(6,182,212,0.8), 0 0 12px rgba(6,182,212,0.4)" }}
            initial={{ left: "0%" }}
            whileInView={{ left: "73%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-mono text-muted font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-emerald drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
            <span>Phases 1-11 shipped</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-muted" />
            <span>Phases 12-15 remaining</span>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        variants={staggerContainer}
        className="mt-20 mx-auto max-w-4xl"
      >
        {items.map((item, i) => (
          <RoadmapCard key={item.id} item={item} index={i} total={items.length} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
