"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Wifi, Server, ArrowLeftRight, Layout,
  FileText, LogIn, CreditCard,
  Lock, Gauge, BarChart3, Rocket,
  GitBranch, PenTool, Compass, FolderSync, ClipboardCheck,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

type PhaseTask = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
};

type Phase = {
  id: number;
  name: string;
  goal: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
  complexity: "High" | "Medium" | "Low";
  complexityColor: string;
  rustLoc: string;
  tsLoc: string;
  files: string;
  tasks: PhaseTask[];
};

const phases: Phase[] = [
  {
    id: 12,
    name: "Cloud Integration",
    goal: "Connect desktop app to cloud orchestrator for 24/7 agent execution.",
    accent: "cyan",
    complexity: "High",
    complexityColor: "text-brand-rose bg-brand-rose/10 border-brand-rose/20",
    rustLoc: "~800",
    tsLoc: "~400",
    files: "~10",
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
    accent: "purple",
    complexity: "Medium",
    complexityColor: "text-brand-amber bg-brand-amber/10 border-brand-amber/20",
    rustLoc: "~0",
    tsLoc: "~3,000",
    files: "~25",
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
    accent: "emerald",
    complexity: "Medium",
    complexityColor: "text-brand-amber bg-brand-amber/10 border-brand-amber/20",
    rustLoc: "~0",
    tsLoc: "~500",
    files: "~5",
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
    accent: "amber",
    complexity: "Low",
    complexityColor: "text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20",
    rustLoc: "~100",
    tsLoc: "~200",
    files: "~5",
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

function PhaseCard({ phase }: { phase: Phase }) {
  const [expanded, setExpanded] = useState(phase.id === 12);

  return (
    <GlowCard accent={phase.accent} className="p-0 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-6 pb-4 cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] font-mono text-sm font-bold text-muted">
              {phase.id}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{phase.name}</h3>
              <p className="text-xs text-muted-dark mt-0.5 max-w-md">{phase.goal}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Complexity badge */}
            <span className={`hidden sm:inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase ${phase.complexityColor}`}>
              {phase.complexity}
            </span>

            {/* Expand chevron */}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-dark transition-colors duration-300 group-hover:text-muted" />
            </motion.div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="mt-4 flex gap-4 text-[11px] font-mono text-muted-dark/60">
          <span>{phase.rustLoc} Rust</span>
          <span className="text-white/[0.06]">|</span>
          <span>{phase.tsLoc} TypeScript</span>
          <span className="text-white/[0.06]">|</span>
          <span>{phase.files} files</span>
        </div>
      </button>

      {/* Expandable task list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-white/[0.03] pt-4">
              {phase.tasks.map((task, i) => (
                <motion.div
                  key={task.title}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-4 transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.02]"
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
    </GlowCard>
  );
}

export default function RemainingPhases() {
  return (
    <SectionWrapper id="remaining">
      {/* Background accent */}
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
        <span className="inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6">
          Remaining Work
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          4 phases to <GradientText>launch</GradientText>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          Cloud integration, web app, orchestrator hardening, and distribution.
          Click any phase to explore the full task breakdown.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-cyan/15 to-transparent" />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mt-16 space-y-5"
      >
        {phases.map((phase) => (
          <motion.div key={phase.id} variants={fadeUp}>
            <PhaseCard phase={phase} />
          </motion.div>
        ))}
      </motion.div>

      <div className="section-line mt-20 opacity-50" />
    </SectionWrapper>
  );
}
