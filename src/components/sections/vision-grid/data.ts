import type { BrandKey } from "@/lib/brand-theme";

export interface GuideLink {
  label: string;
  category: string;
  topic: string;
}

export interface PlatformCard {
  id: string;
  title: string;
  brand: BrandKey;
  image: string;
  description: string;
  details: string[];
  guideTopics?: GuideLink[];
}

export const PLATFORM_CARDS: PlatformCard[] = [
  {
    id: "credential-vault",
    title: "Credential Vault",
    brand: "purple",
    image: "/imgs/platform/credential-vault.png",
    description:
      "AES-256-GCM encryption with OS-native keyring integration. Your secrets never leave your device.",
    details: [
      "OS keyring on Windows, macOS, Linux",
      "AI-assisted OAuth token refresh",
      "Zero-knowledge local-first architecture",
    ],
    guideTopics: [
      {
        label: "How Personas keeps your data safe",
        category: "credentials",
        topic: "how-personas-keeps-your-data-safe",
      },
    ],
  },
  {
    id: "templates",
    title: "Templates",
    brand: "cyan",
    image: "/imgs/platform/templates.png",
    description:
      "Dozens of ready-made personas you can adopt with one click — from PR reviewer to morning brief.",
    details: [
      "40+ curated persona templates",
      "One-click adoption into your canvas",
      "Remix templates into your own library",
    ],
    guideTopics: [
      {
        label: "Browse template library",
        category: "agents-prompts",
        topic: "template-library",
      },
    ],
  },
  {
    id: "byom",
    title: "BYOM",
    brand: "emerald",
    image: "/imgs/platform/byom.png",
    description:
      "Bring your own model. Run personas against Claude or local Ollama — your machine, your choice.",
    details: [
      "Claude (via the official CLI)",
      "Ollama for fully local inference",
      "Automatic failover between providers",
    ],
    guideTopics: [
      {
        label: "Choosing your AI provider",
        category: "getting-started",
        topic: "choosing-your-ai-provider",
      },
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring",
    brand: "rose",
    image: "/imgs/platform/monitoring.png",
    description:
      "Self-healing execution, human review queues, and persistent agent memory — watch every run in real time.",
    details: [
      "Self-healing engine with automatic recovery",
      "Human-in-the-loop review queues",
      "Per-agent long-term memory",
    ],
    guideTopics: [
      {
        label: "Self-healing explained",
        category: "troubleshooting",
        topic: "self-healing-explained",
      },
    ],
  },
  {
    id: "lab",
    title: "Lab",
    brand: "amber",
    image: "/imgs/platform/lab.png",
    description:
      "Experiment with prompt variants, run A/B arenas, and let breeding cycles evolve higher-performing personas.",
    details: [
      "Arena for side-by-side prompt comparisons",
      "Fitness scoring across test suites",
      "Overnight breeding cycles",
    ],
    guideTopics: [
      {
        label: "Running a breeding cycle",
        category: "testing",
        topic: "running-a-breeding-cycle",
      },
    ],
  },
  {
    id: "orchestration",
    title: "Orchestration",
    brand: "blue",
    image: "/imgs/platform/orchestration.png",
    description:
      "Eight trigger types wake personas in parallel — schedule, webhook, file watcher, clipboard, event, and more.",
    details: [
      "Schedule, polling, webhook, event, composite",
      "File watcher and clipboard triggers",
      "App-focus trigger for contextual agents",
    ],
    guideTopics: [
      {
        label: "How triggers work",
        category: "triggers",
        topic: "how-triggers-work",
      },
    ],
  },
];
