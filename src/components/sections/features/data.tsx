import type { Variants } from "framer-motion";
import { Wand2, Zap, Cloud, Activity } from "lucide-react";
import type { Feature, FeatureEntrance } from "./types";
import { DesignVisual, CoordinateVisual, DeployVisual, TelemetryVisual } from "./components/visuals";

export const cardOrchestrator: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

export const heroSlideIn: Variants = {
  hidden: { opacity: 0, x: -60, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Grid-card entrance variants keyed by the FeatureEntrance discriminator
 * on each Feature. Adding a 5th feature is `entrance: "fadeUp"` (or any
 * existing key); no parallel array to keep in sync, no silent index drift.
 */
export const gridCardVariants: Record<FeatureEntrance, Variants> = {
  slideLeft: {
    hidden: { opacity: 0, x: -40, rotate: -2 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 40, rotate: -1 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40, rotate: 2 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

export const connectorDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.8, delay: 0.9, ease: "easeOut" },
  },
};

export const features: Feature[] = [
  {
    icon: Wand2,
    accent: "purple",
    entrance: "fadeUp",
    number: "01",
    title: "Design with natural language",
    proof: "Prompt scaffolding",
    description:
      "Describe what you want your agent to do. The design engine analyzes feasibility, suggests tools, and generates the optimal prompt structure.",
    visual: <DesignVisual />,
    guideTopics: [
      { label: "Creating a new agent", category: "agents-prompts", topic: "creating-a-new-agent" },
      { label: "Writing effective prompts", category: "agents-prompts", topic: "writing-effective-prompts" },
    ],
  },
  {
    icon: Zap,
    accent: "cyan",
    entrance: "slideLeft",
    number: "02",
    title: "Agents that coordinate",
    proof: "Event-driven chaining",
    description:
      "Built-in event bus lets agents trigger each other. Email agent → Slack agent → GitHub agent. Runs locally, no cloud required.",
    visual: <CoordinateVisual />,
    guideTopics: [
      { label: "Event-based triggers", category: "triggers", topic: "event-based-triggers" },
      { label: "Chain triggers", category: "triggers", topic: "chain-triggers" },
    ],
  },
  {
    icon: Cloud,
    accent: "emerald",
    entrance: "fadeUp",
    number: "03",
    title: "One-click cloud deployment",
    proof: "Hybrid execution",
    description:
      "When you need 24/7 operation, deploy your agents to the cloud with one click. Bring your own infrastructure or use ours.",
    visual: <DeployVisual />,
    guideTopics: [
      { label: "Local vs cloud execution", category: "deployment", topic: "local-vs-cloud-execution" },
      { label: "Cloud orchestrator setup", category: "deployment", topic: "connecting-to-the-cloud-orchestrator" },
    ],
  },
  {
    icon: Activity,
    accent: "amber",
    entrance: "slideRight",
    number: "04",
    title: "Full visibility",
    proof: "Operational telemetry",
    description:
      "Real-time execution streaming, event audit trails, healing engine, and usage analytics. Know exactly what your agents are doing.",
    visual: <TelemetryVisual />,
    guideTopics: [
      { label: "Cost tracking per model", category: "monitoring", topic: "cost-tracking-per-model" },
      { label: "Success rate metrics", category: "monitoring", topic: "success-rate-metrics" },
    ],
  },
];
