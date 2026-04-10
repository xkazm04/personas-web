"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  GitBranch,
  BookOpen,
  Puzzle,
  Users,
  Heart,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

const DISCORD_URL = "https://discord.gg/personas";
const GITHUB_URL = "https://github.com";

interface CommunityChannel {
  title: string;
  description: string;
  icon: typeof MessageSquare;
  color: string;
  href: string;
  external: boolean;
  cta: string;
}

const CHANNELS: CommunityChannel[] = [
  {
    title: "Discord",
    description:
      "Chat with other builders, get help with agent configs, share your workflows, and vote on features. The fastest way to get answers.",
    icon: MessageSquare,
    color: "#5865F2",
    href: DISCORD_URL,
    external: true,
    cta: "Join Discord",
  },
  {
    title: "GitHub",
    description:
      "Report bugs, request features, and contribute to the project. Star the repo to stay updated on releases.",
    icon: GitBranch,
    color: "#f0f6fc",
    href: GITHUB_URL,
    external: true,
    cta: "View on GitHub",
  },
  {
    title: "Guide",
    description:
      "102 topics covering everything from first install to advanced pipeline orchestration. Searchable, categorized, and illustrated.",
    icon: BookOpen,
    color: "#06b6d4",
    href: "/guide",
    external: false,
    cta: "Read the Guide",
  },
  {
    title: "Templates",
    description:
      "40+ ready-made agent templates. Browse by category, complexity, and use case. Download and customize in seconds.",
    icon: Puzzle,
    color: "#a855f7",
    href: "/templates",
    external: false,
    cta: "Browse Templates",
  },
];

interface ContributeWay {
  title: string;
  description: string;
  color: string;
}

const CONTRIBUTE_WAYS: ContributeWay[] = [
  {
    title: "Share your templates",
    description: "Built a useful agent workflow? Share it with the community so others can learn from your setup.",
    color: "#a855f7",
  },
  {
    title: "Report bugs",
    description: "Found something broken? Open a GitHub issue with steps to reproduce. Every bug report makes Personas better.",
    color: "#f43f5e",
  },
  {
    title: "Request features",
    description: "Have an idea? Vote on the roadmap or open a feature request. The most-voted features get built first.",
    color: "#06b6d4",
  },
  {
    title: "Help others",
    description: "Answer questions on Discord, review pull requests, or write a blog post about your workflow. Community knowledge compounds.",
    color: "#34d399",
  },
  {
    title: "Build connectors",
    description: "Know a service that's missing from the 40+ connector library? Contribute a new connector and help expand the ecosystem.",
    color: "#fbbf24",
  },
  {
    title: "Translate",
    description: "Personas supports 14 languages. Help improve translations or add a new language to make the app accessible to more people.",
    color: "#06b6d4",
  },
];

const scrollMapItems = [
  { label: "COMMUNITY", href: "#community" },
  { label: "CONTRIBUTE", href: "#contribute" },
  { label: "JOIN", href: "#join-cta" },
];

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        {/* ── Hero + Channels ────────────────────────────────── */}
        <SectionWrapper id="community" aria-label="Community">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-purple/70">
              Community
            </p>
            <SectionHeading>
              Built by{" "}
              <GradientText className="drop-shadow-lg">builders</GradientText>,
              for builders
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Join developers, DevOps engineers, and automation enthusiasts who
              are building AI agent workflows with Personas. Get help, share
              ideas, and shape the product.
            </p>
          </motion.div>

          {/* Channel cards */}
          <motion.div
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2"
          >
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const cardClass = "group flex flex-col h-full rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 transition-colors hover:border-white/[0.1]";
              const inner = (
                <>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${ch.color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: ch.color }} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-cyan transition-colors">
                        {ch.title}
                      </h3>
                      {ch.external && (
                        <ExternalLink className="h-4 w-4 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      {ch.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-medium group-hover:text-brand-cyan transition-colors" style={{ color: ch.color }}>
                      {ch.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                </>
              );

              return (
                <motion.div key={ch.title} variants={fadeUp}>
                  {ch.external ? (
                    <a href={ch.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                      {inner}
                    </a>
                  ) : (
                    <Link href={ch.href} className={cardClass}>
                      {inner}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </SectionWrapper>

        {/* ── Contribute ─────────────────────────────────────── */}
        <SectionWrapper id="contribute" aria-label="How to contribute">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              Ways to{" "}
              <GradientText className="drop-shadow-lg">contribute</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Personas is better because of its community. Here&apos;s how you
              can help — no matter your skill level.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {CONTRIBUTE_WAYS.map((way) => (
              <motion.div
                key={way.title}
                variants={fadeUp}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4" style={{ color: way.color }} />
                  <h3 className="text-sm font-semibold text-foreground">
                    {way.title}
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {way.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </SectionWrapper>

        {/* ── CTA ────────────────────────────────────────────── */}
        <SectionWrapper id="join-cta" aria-label="Join the community">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="h-8 w-8 text-brand-purple/60" />
            </div>
            <SectionHeading>
              Join the{" "}
              <GradientText className="drop-shadow-lg">conversation</GradientText>
            </SectionHeading>
            <p className="mt-6 text-base text-muted leading-relaxed font-light">
              Get help in minutes, share what you&apos;re building, and help
              shape the future of local-first AI agent orchestration.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "rgba(88,101,242,0.15)",
                  borderColor: "rgba(88,101,242,0.3)",
                  color: "#5865F2",
                  border: "1px solid rgba(88,101,242,0.3)",
                }}
              >
                <MessageSquare className="h-4 w-4" />
                Join Discord
              </a>
              <Link
                href="/download"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3 text-sm font-medium text-muted transition-colors hover:border-white/20 hover:text-foreground"
              >
                Download Personas
              </Link>
            </div>
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
