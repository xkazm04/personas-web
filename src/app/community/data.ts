import {
  MessageSquare,
  GitBranch,
  BookOpen,
  Puzzle,
  Bug,
  Vote,
  HelpCircle,
  Plug,
  Languages,
  Share2,
  type LucideIcon,
} from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

export const DISCORD_URL = "https://discord.gg/personas";
export const GITHUB_URL = "https://github.com";

export interface CommunityChannel {
  title: string;
  description: string;
  icon: LucideIcon;
  brand: BrandKey;
  href: string;
  external: boolean;
  cta: string;
  stat: string;
}

export const CHANNELS: CommunityChannel[] = [
  {
    title: "Discord",
    description:
      "Chat with other builders, get help with agent configs, share your workflows, and vote on features. The fastest way to get answers.",
    icon: MessageSquare,
    brand: "purple",
    href: DISCORD_URL,
    external: true,
    cta: "Join Discord",
    stat: "Live chat",
  },
  {
    title: "GitHub",
    description:
      "Report bugs, request features, and contribute to the project. Star the repo to stay updated on releases.",
    icon: GitBranch,
    brand: "blue",
    href: GITHUB_URL,
    external: true,
    cta: "View on GitHub",
    stat: "Open source",
  },
  {
    title: "Guide",
    description:
      "102 topics covering everything from first install to advanced pipeline orchestration. Searchable, categorized, and illustrated.",
    icon: BookOpen,
    brand: "cyan",
    href: "/guide",
    external: false,
    cta: "Read the Guide",
    stat: "102 topics",
  },
  {
    title: "Templates",
    description:
      "40+ ready-made agent templates. Browse by category, complexity, and use case. Download and customize in seconds.",
    icon: Puzzle,
    brand: "emerald",
    href: "/templates",
    external: false,
    cta: "Browse Templates",
    stat: "40+ ready",
  },
];

export interface ContributeWay {
  title: string;
  description: string;
  brand: BrandKey;
  icon: LucideIcon;
}

export const CONTRIBUTE_WAYS: ContributeWay[] = [
  {
    title: "Share your templates",
    description:
      "Built a useful agent workflow? Share it with the community so others can learn from your setup.",
    brand: "purple",
    icon: Share2,
  },
  {
    title: "Report bugs",
    description:
      "Found something broken? Open a GitHub issue with steps to reproduce. Every bug report makes Personas better.",
    brand: "rose",
    icon: Bug,
  },
  {
    title: "Request features",
    description:
      "Have an idea? Vote on the roadmap or open a feature request. The most-voted features get built first.",
    brand: "cyan",
    icon: Vote,
  },
  {
    title: "Help others",
    description:
      "Answer questions on Discord, review pull requests, or write a blog post about your workflow. Community knowledge compounds.",
    brand: "emerald",
    icon: HelpCircle,
  },
  {
    title: "Build connectors",
    description:
      "Know a service that's missing from the 40+ connector library? Contribute a new connector and help expand the ecosystem.",
    brand: "amber",
    icon: Plug,
  },
  {
    title: "Translate",
    description:
      "Personas supports 14 languages. Help improve translations or add a new language to make the app accessible to more people.",
    brand: "blue",
    icon: Languages,
  },
];
