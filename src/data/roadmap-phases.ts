import {
  Cpu, Database, MessageSquare, Zap, Settings, Globe, Shield, Bot, Code, Layers, Calendar,
  Wifi, FileText, Lock, Rocket,
  type LucideIcon,
} from "lucide-react";

/**
 * Shape of a single roadmap phase card. (Formerly declared in the now-removed
 * `PhaseCard` component; moved here to sit next to its only data.)
 */
export type PhaseCardData = {
  phase: number;
  name: string;
  icon: LucideIcon;
  scope: string;
  accent: string;
  bg: string;
  completed?: boolean;
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
