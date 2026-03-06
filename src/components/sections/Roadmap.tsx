"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Wifi, Server, ArrowLeftRight, Layout,
  FileText, LogIn, CreditCard,
  Lock, Gauge, BarChart3, Rocket,
  GitBranch, PenTool, Compass, FolderSync, ClipboardCheck,
  Circle, CheckCircle2,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { fadeUp, staggerContainer, TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";

type PhaseTask = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
};

type Phase = {
  id: number;
  name: string;
  goal: string;
  priority: "Now" | "Next" | "Later";
  accent: "cyan" | "purple" | "emerald" | "amber";
  status: "in-progress" | "upcoming" | "blocked";
  tasks: PhaseTask[];
};

const phases: Phase[] = [
  {
    id: 12,
    name: "Cloud Integration",
    goal: "Connect desktop app to cloud orchestrator for 24/7 agent execution.",
    priority: "Now",
    accent: "cyan",
    status: "in-progress",
    tasks: [
      {
        icon: Wifi,
        title: "Cloud Client",
        items: [
          "HTTP client for orchestrator API (execute, status, history, destroy)",
          "WebSocket client for real-time execution streaming",
          "Forward as Tauri events — UI doesn't know local vs cloud",
        ],
      },
      {
        icon: Server,
        title: "Cloud Deployer",
        items: [
          "Managed mode: send deployment request, receive orchestrator URL",
          "BYOI mode: Fly.io API token → provision machines + Kafka topics",
          "Store deployment config locally",
        ],
      },
      {
        icon: ArrowLeftRight,
        title: "Event Bus Bridge",
        items: [
          "Bidirectional sync: local ↔ cloud events trigger cross-environment execution",
          "Offline queue: events accumulate locally, sync on reconnect",
          "Conflict resolution: cloud events take precedence on timestamp collision",
        ],
      },
      {
        icon: Layout,
        title: "Cloud UI",
        items: [
          "cloudStore.ts: deployment status, orchestrator URL, workers, usage metrics",
          "Cloud Deploy Panel + BYOI Configuration Panel",
          "Cloud execution toggle on PersonaRunner",
        ],
      },
    ],
  },
  {
    id: 13,
    name: "Web App",
    goal: "Marketing site + auth portal + subscription management. Separate Next.js 16 app.",
    priority: "Now",
    accent: "purple",
    status: "in-progress",
    tasks: [
      {
        icon: FileText,
        title: "Marketing Pages",
        items: [
          "/ — Landing page with hero, value proposition, demo",
          "/features — Feature showcase with desktop app screenshots",
          "/pricing — Tier comparison (Free, Starter, Pro, Team, BYOI)",
          "/docs + /blog — MDX-powered documentation and updates",
        ],
      },
      {
        icon: LogIn,
        title: "Dashboard",
        items: [
          "/login — Google OAuth via Supabase",
          "/dashboard — Subscription status, download links, quick stats",
          "/dashboard/subscription — Stripe Customer Portal embed",
          "/dashboard/api-keys — Create/revoke API keys for cloud",
        ],
      },
      {
        icon: CreditCard,
        title: "API Routes",
        items: [
          "/api/webhooks/stripe — Subscription lifecycle handler",
          "/api/download — Signed download URL generation",
          "Supabase client + Stripe products/pricing/webhooks config",
        ],
      },
    ],
  },
  {
    id: 14,
    name: "Cloud Evolution",
    goal: "Harden the cloud orchestrator with auth, rate limiting, and usage metering.",
    priority: "Next",
    accent: "emerald",
    status: "blocked",
    tasks: [
      {
        icon: Lock,
        title: "Orchestrator Auth",
        items: [
          "Supabase JWT validation middleware",
          "JWKS endpoint verification with 6-hour cache",
          "Extract user_id from JWT for request scoping",
        ],
      },
      {
        icon: Gauge,
        title: "Rate Limiting",
        items: [
          "Plan-based limits: Starter (100 exec/mo), Pro (1K), Team (5K)",
          "Query Supabase subscriptions table for user's plan",
          "429 responses with X-Executions-Remaining headers",
        ],
      },
      {
        icon: BarChart3,
        title: "Usage Metering",
        items: [
          "Increment counters after each execution and event",
          "Reset counters on billing period change (Stripe webhook)",
          "GET /api/usage endpoint for dashboard",
        ],
      },
      {
        icon: Rocket,
        title: "Managed Provisioning",
        items: [
          "POST /api/deploy — provision orchestrator + workers + Kafka",
          "Namespace isolation: per-user Kafka topic prefix",
          "Health check + destroy endpoints",
        ],
      },
    ],
  },
  {
    id: 15,
    name: "Distribution & Polish",
    goal: "Production-ready installer, auto-updates, code signing, and final QA.",
    priority: "Later",
    accent: "amber",
    status: "blocked",
    tasks: [
      {
        icon: GitBranch,
        title: "CI/CD Pipeline",
        items: [
          "GitHub Actions workflow with tauri-action",
          "Build .exe (Windows), .dmg (macOS), .AppImage (Linux)",
          "Auto-upload to GitHub Releases + update manifest",
        ],
      },
      {
        icon: PenTool,
        title: "Code Signing",
        items: [
          "Windows Authenticode signing (EV cert or Azure Trusted Signing)",
          "macOS Apple Developer ID + notarization",
          "Sign update manifest to prevent tampering",
        ],
      },
      {
        icon: Compass,
        title: "Onboarding Wizard",
        items: [
          "Welcome → System check → Auto-install deps → API key setup",
          "Template gallery: pick a starter persona",
          "Quick test execution to verify everything works",
        ],
      },
      {
        icon: FolderSync,
        title: "Data Migration",
        items: [
          "Import wizard: point to Vibeman SQLite database",
          "Migrate personas, credentials (re-encrypt), tools, triggers",
          "Validate imported data before committing",
        ],
      },
      {
        icon: ClipboardCheck,
        title: "Final QA",
        items: [
          "All sidebar sections, persona CRUD, execution streaming",
          "Event bus, scheduler, system tray, notifications, auto-update",
          "Cold start < 2s, memory < 100 MB idle, installer builds",
        ],
      },
    ],
  },
];

const statusConfig = {
  "in-progress": {
    label: "In Progress",
    dotClass: "bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.5)]",
    badgeClass: "border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan/70",
    lineClass: "bg-brand-cyan/30",
  },
  upcoming: {
    label: "Upcoming",
    dotClass: "bg-brand-purple/60",
    badgeClass: "border-brand-purple/20 bg-brand-purple/5 text-brand-purple/70",
    lineClass: "bg-white/[0.06]",
  },
  blocked: {
    label: "Blocked",
    dotClass: "bg-white/20",
    badgeClass: "border-white/[0.06] bg-white/[0.02] text-muted-dark",
    lineClass: "bg-white/[0.04]",
  },
};

const priorityClass: Record<Phase["priority"], string> = {
  Now: "border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan/70",
  Next: "border-brand-purple/20 bg-brand-purple/5 text-brand-purple/70",
  Later: "border-white/[0.08] bg-white/[0.02] text-muted-dark",
};

const RoadmapCard = memo(function RoadmapCard({ phase, index }: { phase: Phase; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[phase.status];

  return (
    <motion.div
      variants={fadeUp}
      className="relative flex gap-6 md:gap-8"
    >
      {/* Timeline spine */}
      <div className="relative flex flex-col items-center pt-1">
        {/* Status dot */}
        <div className={`relative z-10 h-3.5 w-3.5 rounded-full ${status.dotClass} ring-4 ring-background`}>
          {phase.status === "in-progress" && (
            <div className="absolute inset-0 rounded-full bg-brand-cyan/30 animate-ping" />
          )}
        </div>
        {/* Vertical connector */}
        {index < phases.length - 1 && (
          <div className={`mt-1 w-px flex-1 ${status.lineClass}`} />
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 pb-10">
        <div className="relative">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left cursor-pointer group"
        >
          <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-6 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Phase number */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] font-mono text-sm font-bold text-muted shrink-0">
                  {phase.id}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-lg">{phase.name}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${status.badgeClass}`}>
                      {status.label}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${priorityClass[phase.priority]}`}>
                      {phase.priority} priority
                    </span>
                  </div>
                  <p className="text-xs text-muted-dark mt-1 max-w-lg">{phase.goal}</p>
                </div>
              </div>

              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={TRANSITION_FAST}
                className="shrink-0 mt-1"
              >
                <ChevronDown className="h-4 w-4 text-muted-dark transition-colors duration-300 group-hover:text-muted" />
              </motion.div>
            </div>

            {/* Task count summary */}
            <div className="mt-4 flex gap-4 text-[11px] font-mono text-muted-dark">
              <span>{phase.tasks.length} work streams</span>
              <span className="text-white/[0.06]">|</span>
              <span>{phase.tasks.reduce((s, t) => s + t.items.length, 0)} deliverables</span>
            </div>
          </div>
        </button>
        {phase.status === "in-progress" && (
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

        {/* Expandable task list */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={TRANSITION_NORMAL}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3 pl-2">
                {phase.tasks.map((task, i) => (
                  <motion.div
                    key={task.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, ...TRANSITION_NORMAL }}
                    className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-4 transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.02] texture-lines"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <task.icon className="h-4 w-4 text-muted-dark" />
                      <h4 className="text-sm font-medium">{task.title}</h4>
                    </div>
                    <ul className="space-y-2 pl-6">
                      {task.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-dark leading-relaxed">
                          <div className="mt-1.5 h-1 w-1 rounded-full bg-white/[0.15] shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default function Roadmap() {
  return (
    <SectionWrapper id="roadmap" dotGrid>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[5%] top-[20%] h-[500px] w-[400px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)" }}
        />
        <div
          className="absolute right-[5%] bottom-[20%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 60%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <div className="text-[8rem] sm:text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter select-none bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent drop-shadow-lg">
          73%
        </div>
        <SectionHeading className="-mt-6 sm:-mt-8 md:-mt-12">
          4 phases to <GradientText className="drop-shadow-lg">launch</GradientText>
        </SectionHeading>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          Cloud integration, web app, orchestrator hardening, and distribution.
          Click any phase to explore the full task breakdown.
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={fadeUp} className="mt-14 mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/70 mb-4">
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
            {/* Shimmer pulse at leading edge */}
            <div
              className="absolute inset-0 animate-progress-shimmer"
              style={{
                background: "linear-gradient(90deg, transparent 70%, rgba(255,255,255,0.15) 90%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          </motion.div>
          {/* Glowing dot at the leading edge */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-cyan animate-progress-dot-breathe"
            style={{ boxShadow: "0 0 6px rgba(6,182,212,0.8), 0 0 12px rgba(6,182,212,0.4)" }}
            initial={{ left: "0%" }}
            whileInView={{ left: "73%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          />
        </div>
        {/* Phase markers */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-white/70 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-emerald drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
            <span>Phases 1–11 shipped</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-white/70" />
            <span>Phases 12–15 remaining</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10 mx-auto max-w-3xl rounded-2xl border border-brand-cyan/30 bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 px-6 py-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/imgs/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-cyan/20 ring-1 ring-brand-cyan/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Rocket className="h-6 w-6 text-brand-cyan" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-cyan drop-shadow-sm">Next major milestone</p>
            <p className="mt-1.5 text-base text-white/90 font-medium leading-relaxed">Complete <span className="text-white font-bold">Cloud Integration</span> and <span className="text-white font-bold">Web App</span> to unlock distribution hardening.</p>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        variants={staggerContainer}
        className="mt-20 mx-auto max-w-4xl"
      >
        {phases.map((phase, i) => (
          <RoadmapCard key={phase.id} phase={phase} index={i} />
        ))}
      </motion.div>

    </SectionWrapper>
  );
}
