import {
  Sparkles,
  Zap,
  GitBranch,
  ShieldCheck,
  BarChart3,
  FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

export interface FeatureGroup {
  id: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  brand: BrandKey;
  concepts: string[];
  guideHref: string;
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "agents-prompts",
    title: "Agents & Prompts",
    tagline: "Author personas in natural language",
    icon: Sparkles,
    brand: "purple",
    concepts: [
      "Natural-language persona authoring",
      "40+ adoptable templates",
      "BYOM — Claude or local Ollama",
      "Structured + simple prompt modes",
      "Persistent agent memory",
    ],
    guideHref: "/guide/agents-prompts",
  },
  {
    id: "triggers",
    title: "Orchestration",
    tagline: "Every way an agent can start",
    icon: Zap,
    brand: "amber",
    concepts: [
      "Schedule (cron)",
      "Webhook endpoints",
      "File watcher",
      "Clipboard monitor",
      "Chain / event trigger",
      "Composite conditions",
    ],
    guideHref: "/guide/triggers",
  },
  {
    id: "pipelines",
    title: "Pipelines & Teams",
    tagline: "Agents that collaborate on a canvas",
    icon: GitBranch,
    brand: "cyan",
    concepts: [
      "Visual team canvas",
      "Data-flow connections",
      "Live event bus",
      "Self-healing execution",
      "Pipeline replay + time travel",
    ],
    guideHref: "/guide/pipelines",
  },
  {
    id: "credentials",
    title: "Credentials & Security",
    tagline: "Your secrets stay on your machine",
    icon: ShieldCheck,
    brand: "rose",
    concepts: [
      "AES-256-GCM vault",
      "OS-native keyring",
      "AI-assisted OAuth",
      "Automatic token refresh",
      "Zero telemetry, local-first",
    ],
    guideHref: "/guide/credentials",
  },
  {
    id: "monitoring",
    title: "Monitoring",
    tagline: "See, cost, and control every run",
    icon: BarChart3,
    brand: "blue",
    concepts: [
      "Live observability dashboard",
      "Span tracing per execution",
      "Per-model cost attribution",
      "Human review queues",
      "Budget alerts + enforcement",
    ],
    guideHref: "/guide/monitoring",
  },
  {
    id: "testing",
    title: "Testing Lab",
    tagline: "Evolve better prompts automatically",
    icon: FlaskConical,
    brand: "emerald",
    concepts: [
      "Arena for A/B tests",
      "Prompt versioning + diffs",
      "Fitness scoring",
      "Breeding cycles",
      "Mock tool sandboxes",
    ],
    guideHref: "/guide/testing",
  },
];
