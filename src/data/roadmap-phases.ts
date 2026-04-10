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
    goal: "Run your agents 24/7 in the cloud, even when your computer is off.",
    priority: "Now",
    accent: "cyan",
    status: "in-progress",
    tasks: [
      {
        icon: Wifi,
        title: "Cloud Connection",
        items: [
          "Talk to the cloud service — run agents, check status, view history",
          "Live-stream agent output from the cloud in real time",
          "Seamless experience — same interface whether running locally or in the cloud",
        ],
      },
      {
        icon: Server,
        title: "Deployment Engine",
        items: [
          "One-click deploy: we handle the servers for you",
          "Use your own cloud servers with a simple API key",
          "Remember your deployment settings between sessions",
        ],
      },
      {
        icon: ArrowLeftRight,
        title: "Local ↔ Cloud Sync",
        items: [
          "Keep local and cloud in sync — actions in one place trigger the other",
          "Work offline and catch up automatically when you reconnect",
          "Smart conflict handling when local and cloud changes overlap",
        ],
      },
      {
        icon: Layout,
        title: "Cloud Dashboard",
        items: [
          "See deployment status, active workers, and usage at a glance",
          "Deploy panel and bring-your-own-infrastructure settings",
          "One toggle to switch any agent between local and cloud execution",
        ],
      },
    ],
  },
  {
    id: 13,
    name: "Web App",
    goal: "The website you're on right now — sign up, manage your account, and explore Personas online.",
    priority: "Now",
    accent: "purple",
    status: "in-progress",
    tasks: [
      {
        icon: FileText,
        title: "Marketing Pages",
        items: [
          "Homepage — see what Personas can do with a live demo",
          "Features page — explore capabilities with real screenshots",
          "Pricing page — compare plans (Free, Starter, Pro, Team, BYOI)",
          "Docs and blog — guides, tutorials, and product updates",
        ],
      },
      {
        icon: LogIn,
        title: "Your Dashboard",
        items: [
          "Sign in with Google — one click, no passwords to remember",
          "See your plan, download the app, and check quick stats",
          "Manage your subscription and billing in one place",
          "Create and manage API keys for cloud access",
        ],
      },
      {
        icon: CreditCard,
        title: "Behind the Scenes",
        items: [
          "Automatic subscription updates when you upgrade or cancel",
          "Secure download links for the desktop app",
          "Payment processing and account management infrastructure",
        ],
      },
    ],
  },
  {
    id: 14,
    name: "Cloud Evolution",
    goal: "Make cloud execution faster, safer, and smarter with usage tracking and plan-based limits.",
    priority: "Next",
    accent: "emerald",
    status: "blocked",
    tasks: [
      {
        icon: Lock,
        title: "Secure Login",
        items: [
          "Secure login verification for all cloud requests",
          "Trusted credential checks with smart caching",
          "Each user's data stays completely isolated",
        ],
      },
      {
        icon: Gauge,
        title: "Usage Limits",
        items: [
          "Usage limits based on your plan — 100, 1K, or 5K runs per month",
          "Automatically detect your current plan and apply the right limits",
          "Clear warnings when you're approaching your monthly limit",
        ],
      },
      {
        icon: BarChart3,
        title: "Usage Tracking",
        items: [
          "Track every agent run and event toward your monthly total",
          "Counters reset automatically at the start of each billing cycle",
          "View your usage breakdown in the dashboard anytime",
        ],
      },
      {
        icon: Rocket,
        title: "One-Click Cloud Setup",
        items: [
          "Spin up your own cloud environment with a single request",
          "Complete data isolation — your agents never mix with anyone else's",
          "Built-in health monitoring and clean teardown",
        ],
      },
    ],
  },
  {
    id: 15,
    name: "Distribution & Polish",
    goal: "One-click installers for every platform, automatic updates, and a polished first-time experience.",
    priority: "Later",
    accent: "amber",
    status: "blocked",
    tasks: [
      {
        icon: GitBranch,
        title: "Automated Build Pipeline",
        items: [
          "Every release is built and tested automatically",
          "Installers for Windows, macOS, and Linux — every platform covered",
          "New versions published and ready to download instantly",
        ],
      },
      {
        icon: PenTool,
        title: "Security Certificates",
        items: [
          "Windows security certificate — no 'unknown publisher' warnings",
          "macOS security approval — installs without Gatekeeper blocks",
          "Tamper-proof updates so you always get the real thing",
        ],
      },
      {
        icon: Compass,
        title: "Getting Started Guide",
        items: [
          "Step-by-step setup: system check, install dependencies, add your API key",
          "Browse and pick from a gallery of ready-made agents",
          "Run a quick test to make sure everything works",
        ],
      },
      {
        icon: FolderSync,
        title: "Import Your Data",
        items: [
          "Point to your existing database and import everything",
          "Bring over agents, credentials, tools, and triggers automatically",
          "Verify all imported data before finalizing",
        ],
      },
      {
        icon: ClipboardCheck,
        title: "Quality Assurance",
        items: [
          "Test every feature: navigation, agent management, live output",
          "Verify scheduling, notifications, system tray, and auto-updates",
          "Launch in under 2 seconds, stay light on memory, install cleanly",
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
  { phase: 1,  name: "Core Engine",         icon: Cpu,              scope: "The foundation that runs your agents",       accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 2,  name: "Data Layer",          icon: Database,         scope: "Where your agents save their work and settings", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 3,  name: "Agent Messaging",     icon: MessageSquare,    scope: "How agents talk to each other",              accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 4,  name: "Event Bus",           icon: Zap,              scope: "The system that connects actions to reactions", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 5,  name: "Configuration",       icon: Settings,         scope: "Controls for customizing how your agents behave", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 6,  name: "Internationalization",icon: Globe,            scope: "Support for 15+ languages worldwide",        accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 7,  name: "Auth & Security",     icon: Shield,           scope: "Bank-grade encryption for all your credentials", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 8,  name: "Agent Templates",     icon: Bot,              scope: "Pre-built agents you can start using immediately", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 9,  name: "Tool Integrations",   icon: Code,             scope: "40+ service integrations built in",          accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 10, name: "Orchestration",       icon: Layers,           scope: "Wire multiple agents together into pipelines", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 11, name: "Scheduling",          icon: Calendar,         scope: "Run agents on any schedule — hourly, daily, or custom", accent: "text-brand-emerald", bg: "bg-brand-emerald/10", completed: true },
  { phase: 12, name: "Cloud Integration",   icon: Wifi,             scope: "Run agents 24/7, even when your computer is off", accent: "text-brand-cyan",    bg: "bg-brand-cyan/10" },
  { phase: 13, name: "Web App",             icon: FileText,         scope: "Sign up, manage your account, explore online", accent: "text-brand-purple",  bg: "bg-brand-purple/10" },
  { phase: 14, name: "Cloud Evolution",     icon: Lock,             scope: "Faster, safer cloud with usage tracking",    accent: "text-brand-emerald", bg: "bg-brand-emerald/10" },
  { phase: 15, name: "Distribution",        icon: Rocket,           scope: "One-click install, auto-updates, polished experience", accent: "text-brand-amber",   bg: "bg-brand-amber/10" },
];

// Derived progress from phaseCardData — single source of truth
export const completedCount = phaseCardData.filter((p) => p.completed).length;
export const totalPhases = phaseCardData.length;
export const remainingCount = totalPhases - completedCount;
export const progressPercent = Math.round((completedCount / totalPhases) * 100);
export const progressWidth = `${progressPercent}%`;
export const firstRemainingPhase = completedCount + 1;
