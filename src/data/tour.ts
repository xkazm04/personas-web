/* ── Product tour step data ─────────────────────────────────────────── */

import { Download, ShieldCheck, Sparkles, Zap, Dna } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

export interface TourStep {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  /** Brand color identity for theme-adaptive rendering. */
  brand: BrandKey;
  /** Step's lucide icon. */
  icon: LucideIcon;
  timeEstimate?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "download-launch",
    number: 1,
    title: "Download & Launch",
    subtitle: "Install Claude CLI, then launch Personas",
    description:
      "Prerequisite: an active Claude subscription and the Claude CLI installed on your machine. Once those are in place, grab the Personas installer, run it, and you're in — no Personas account or email required.",
    details: [
      "Claude CLI + active subscription required before first run",
      "One-click installer for Windows (Mac and Linux coming soon)",
      "Launches straight into the Command Center",
    ],
    brand: "cyan",
    icon: Download,
  },
  {
    id: "connect-tools",
    number: 2,
    title: "Connect Your Tools",
    subtitle: "Open the vault, pick a connector, authenticate",
    description:
      "Personas ships with 40+ connectors. Open the Credential Vault, pick Slack, GitHub, Jira, Gmail, or any other integration and complete the guided OAuth flow. Credentials are encrypted locally.",
    details: [
      "40+ pre-built connectors out of the box",
      "Keys stay on your machine in the OS keyring — never sent to the cloud",
      "AI-assisted OAuth — no manual token copy-paste",
    ],
    brand: "purple",
    icon: ShieldCheck,
    timeEstimate: "1 min",
  },
  {
    id: "create-persona",
    number: 3,
    title: "Create a Persona",
    subtitle: "Describe an agent in natural language",
    description:
      "Click New Persona and describe what you want in plain English. Personas generates the system prompt, picks the right tools, configures triggers, and drops the agent on your canvas.",
    details: [
      "Natural-language agent authoring — no code required",
      "Start from a template or from scratch",
      "Automatic tool + trigger selection based on intent",
    ],
    brand: "emerald",
    icon: Sparkles,
    timeEstimate: "2 min",
  },
  {
    id: "let-it-work",
    number: 4,
    title: "Let it work",
    subtitle: "Triggers fire, agents run, events flow",
    description:
      "Your persona listens for triggers — schedule, webhook, file watcher, event, or manual run — and executes locally. Watch the event bus light up and monitor every step in real time.",
    details: [
      "Six trigger types cover every automation pattern",
      "Live event bus and span tracing per execution",
      "Self-healing engine recovers from transient failures",
    ],
    brand: "amber",
    icon: Zap,
    timeEstimate: "Live",
  },
  {
    id: "improve",
    number: 5,
    title: "Improve",
    subtitle: "Review runs, tune prompts, evolve",
    description:
      "Open the Lab to replay executions, compare prompt variants side-by-side, and let the evolution engine breed higher-performing versions of your persona overnight.",
    details: [
      "Replay any run with full trace and memory state",
      "A/B test prompt variants in the arena",
      "Evolutionary prompt optimization in the Lab",
    ],
    brand: "rose",
    icon: Dna,
    timeEstimate: "Ongoing",
  },
];
