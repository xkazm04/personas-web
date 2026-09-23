import { Wand2, Zap, Monitor, Activity } from "lucide-react";
import type { Layer } from "./types";

export const layers: Layer[] = [
  {
    id: "deploy",
    label: "Runtime",
    pillar: "Run",
    icon: Monitor,
    brand: "emerald",
    description:
      "Agents run on your own computer, and your credentials stay in your operating system's keyring. There are no servers to rent or maintain.",
  },
  {
    id: "coordinate",
    label: "Execution",
    pillar: "Coordinate",
    icon: Zap,
    brand: "cyan",
    description:
      "One action triggers the next automatically. An email arrives, Slack gets notified, GitHub gets updated — all without you lifting a finger.",
  },
  {
    id: "design",
    label: "Intelligence",
    pillar: "Design",
    icon: Wand2,
    brand: "purple",
    description:
      "Describe what you want in plain English. Personas helps you build the right agent with step-by-step guidance and smart suggestions.",
  },
  {
    id: "monitor",
    label: "Observability",
    pillar: "Monitor",
    icon: Activity,
    brand: "amber",
    description:
      "See everything your agents do in real time. Track performance, review activity logs, and let the system fix problems automatically.",
  },
];
