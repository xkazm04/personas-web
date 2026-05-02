import { Wand2, Zap, Cloud, Activity } from "lucide-react";
import type { Layer } from "./types";

export const layers: Layer[] = [
  {
    id: "deploy",
    label: "Infrastructure",
    pillar: "Deploy",
    icon: Cloud,
    brand: "emerald",
    description:
      "Run agents on your computer or in the cloud — or both at once. Deploy with a single click, and use your own servers if you prefer.",
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
