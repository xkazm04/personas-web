"use client";

import { motion } from "framer-motion";
import {
  GitBranch,
  ShieldCheck,
  Cpu,
  HeartPulse,
  Dna,
  Zap,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { revealFromBelow, staggerContainer } from "@/lib/animations";

import type { LucideIcon } from "lucide-react";

/* ────────────────────────── Data ────────────────────────── */

interface GuideLink {
  label: string;
  category: string;
  topic: string;
}

interface Capability {
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
  details: string[];
  slug?: string;
  guideTopics?: GuideLink[];
}

const capabilities: Capability[] = [
  {
    title: "Multi-Agent Canvas",
    icon: GitBranch,
    color: "#06b6d4",
    slug: "orchestration",
    description:
      "Wire agents into visual pipelines. Drag, connect, and orchestrate multi-agent workflows on an interactive canvas.",
    details: [
      "Visual node-based editor",
      "Data-flow connections",
      "Real-time execution status",
    ],
    guideTopics: [
      { label: "What are pipelines?", category: "pipelines", topic: "what-are-pipelines" },
      { label: "The team canvas", category: "pipelines", topic: "the-team-canvas" },
    ],
  },
  {
    title: "Credential Vault",
    icon: ShieldCheck,
    color: "#a855f7",
    slug: "security",
    description:
      "AES-256-GCM encryption with OS-native keyring integration. Your secrets never leave your device.",
    details: [
      "OS keyring (Windows/macOS/Linux)",
      "Automatic token refresh",
      "Zero-knowledge architecture",
    ],
    guideTopics: [
      { label: "How Personas keeps your data safe", category: "credentials", topic: "how-personas-keeps-your-data-safe" },
      { label: "Understanding the credential vault", category: "credentials", topic: "understanding-the-credential-vault" },
    ],
  },
  {
    title: "Multi-Provider AI",
    icon: Cpu,
    color: "#34d399",
    slug: "multi-provider",
    description:
      "Switch between Claude, OpenAI, Gemini, Ollama, and custom endpoints. Automatic failover with circuit-breaker health tracking.",
    details: [
      "6+ AI providers supported",
      "Automatic failover",
      "Cost attribution per model",
    ],
    guideTopics: [
      { label: "Choosing your AI provider", category: "getting-started", topic: "choosing-your-ai-provider" },
      { label: "Cost tracking per model", category: "monitoring", topic: "cost-tracking-per-model" },
    ],
  },
  {
    title: "Self-Healing Engine",
    icon: HeartPulse,
    color: "#f43f5e",
    description:
      "Automatic failure detection, root-cause analysis, and recovery. Agents fix themselves so you don't have to.",
    details: [
      "Transient failure recovery",
      "One-click fixes",
      "Auto-rollback on failure",
    ],
    guideTopics: [
      { label: "Self-healing explained", category: "troubleshooting", topic: "self-healing-explained" },
      { label: "Agent health indicators", category: "agents-prompts", topic: "agent-health-indicators" },
    ],
  },
  {
    title: "Genome Evolution",
    icon: Dna,
    color: "#fbbf24",
    slug: "genome",
    description:
      "Evolutionary prompt optimization. Breed, mutate, and select the best-performing agent configurations automatically.",
    details: [
      "Evolutionary breeding cycles",
      "Fitness scoring",
      "Automated A/B testing",
    ],
    guideTopics: [
      { label: "Genome evolution basics", category: "testing", topic: "genome-evolution-basics" },
      { label: "Running a breeding cycle", category: "testing", topic: "running-a-breeding-cycle" },
    ],
  },
  {
    title: "Trigger System",
    icon: Zap,
    color: "#60a5fa",
    description:
      "6 trigger types: schedule, webhook, clipboard monitor, file watcher, chain triggers, and custom events.",
    details: [
      "Cron scheduling",
      "Webhook endpoints",
      "File & clipboard watchers",
    ],
    guideTopics: [
      { label: "How triggers work", category: "triggers", topic: "how-triggers-work" },
      { label: "Schedule triggers", category: "triggers", topic: "schedule-triggers" },
    ],
  },
];

/* ────────────────────────── Card animation ────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/* ────────────────────────── Component ────────────────────────── */

export default function VisionGrid() {
  return (
    <SectionWrapper id="vision-grid" className="relative overflow-hidden">
      {/* ── Heading ── */}
      <div className="mx-auto max-w-3xl text-center relative z-10 mb-14">
        <motion.div variants={revealFromBelow}>
          <SectionHeading>
            The <GradientText>platform</GradientText> behind your agents
          </SectionHeading>
        </motion.div>
      </div>

      {/* ── Capability card grid: 3 columns on desktop, 1 on mobile ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {capabilities.map((cap) => {
          const Icon = cap.icon;

          const inner = (
            <div className="relative flex flex-col px-5 py-6">
                {/* Icon circle */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full mb-4"
                  style={{ backgroundColor: `${cap.color}18` }}
                >
                  <Icon className="h-5 w-5" style={{ color: cap.color }} />
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {cap.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-dark mb-4">
                  {cap.description}
                </p>

                {/* Detail bullets */}
                <ul className="space-y-1.5">
                  {cap.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-center gap-2 text-sm text-foreground/60"
                    >
                      <span
                        className="h-1 w-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cap.color }}
                      />
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* Learn more link */}
                {cap.slug && (
                  <Link
                    href={`/features/${cap.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: cap.color }}
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}

                {/* Guide topic links */}
                {cap.guideTopics && cap.guideTopics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                    {cap.guideTopics.map((gt) => (
                      <Link
                        key={gt.topic}
                        href={`/guide/${gt.category}/${gt.topic}`}
                        className="flex items-center gap-1.5 text-xs text-muted-dark hover:text-brand-cyan transition-colors"
                      >
                        <BookOpen className="h-3 w-3 shrink-0" />
                        <span className="truncate">{gt.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          );

          return (
            <motion.div
              key={cap.title}
              variants={cardVariants}
              className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:bg-white/[0.05] hover:border-white/[0.12] hover:scale-[1.02]"
            >
              {inner}
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
