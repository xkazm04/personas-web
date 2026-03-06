import {
  Wifi, Server, ArrowLeftRight, Layout,
  FileText, LogIn, CreditCard,
  Lock, Gauge, BarChart3, Rocket,
  GitBranch, PenTool, Compass, FolderSync, ClipboardCheck,
  Cpu, Database, MessageSquare, Zap, Settings, Globe, Shield, Bot, Code, Layers, Calendar,
} from "lucide-react";
import type { PhaseCardData } from "@/components/PhaseCard";

export type PhaseTask = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
};

export type Phase = {
  id: number;
  name: string;
  goal: string;
  priority: "Now" | "Next" | "Later";
  accent: "cyan" | "purple" | "emerald" | "amber";
  status: "in-progress" | "upcoming" | "blocked";
  tasks: PhaseTask[];
};

export const phases: Phase[] = [
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

export const statusConfig = {
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

export const priorityClass: Record<Phase["priority"], string> = {
  Now: "border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan/70",
  Next: "border-brand-purple/20 bg-brand-purple/5 text-brand-purple/70",
  Later: "border-white/[0.08] bg-white/[0.02] text-muted-dark",
};

export const phaseCardData: PhaseCardData[] = [
  { phase: 1,  name: "Core Engine",         icon: Cpu,              scope: "Persona runtime, execution pipeline",        accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 2,  name: "Data Layer",          icon: Database,         scope: "SQLite store, migration system",             accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 3,  name: "Agent Messaging",     icon: MessageSquare,    scope: "Inter-agent communication protocol",         accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 4,  name: "Event Bus",           icon: Zap,              scope: "Pub/sub event routing and triggers",         accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 5,  name: "Configuration",       icon: Settings,         scope: "Settings UI, persona config panels",         accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 6,  name: "Internationalization",icon: Globe,            scope: "i18n framework, locale management",          accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 7,  name: "Auth & Security",     icon: Shield,           scope: "Credential vault, API key management",       accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 8,  name: "Agent Templates",     icon: Bot,              scope: "Starter templates, persona gallery",         accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 9,  name: "Tool Integrations",   icon: Code,             scope: "Tool registry, third-party connectors",      accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 10, name: "Orchestration",       icon: Layers,           scope: "Multi-agent workflows, chaining",            accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 11, name: "Scheduling",          icon: Calendar,         scope: "Cron triggers, time-based execution",        accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 12, name: "Cloud Integration",   icon: Wifi,             scope: "Cloud orchestrator, WebSocket streaming",    accent: "text-brand-cyan",    bg: "bg-brand-cyan/10" },
  { phase: 13, name: "Web App",             icon: FileText,         scope: "Marketing site, auth, subscriptions",        accent: "text-brand-purple",  bg: "bg-brand-purple/10" },
  { phase: 14, name: "Cloud Evolution",     icon: Lock,             scope: "Auth, rate limiting, usage metering",        accent: "text-brand-emerald", bg: "bg-brand-emerald/10" },
  { phase: 15, name: "Distribution",        icon: Rocket,           scope: "Installers, signing, onboarding",            accent: "text-brand-amber",   bg: "bg-brand-amber/10" },
];

// Derived progress from phaseCardData — single source of truth
export const completedCount = phaseCardData.filter((p) => p.completed).length;
export const totalPhases = phaseCardData.length;
export const remainingCount = totalPhases - completedCount;
export const progressPercent = Math.round((completedCount / totalPhases) * 100);
export const progressWidth = `${progressPercent}%`;
export const firstRemainingPhase = completedCount + 1;
