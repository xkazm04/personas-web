"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import Image from "next/image";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

type FAQItem = {
  question: string;
  answer: string;
  mediaSrc: string;
  mediaAlt: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is Claude CLI and why do I need it?",
    answer:
      "Claude CLI is Anthropic's official command-line interface for interacting with Claude. Personas uses it under the hood to run your agents locally — it handles authentication, model access, and streaming responses. You'll need an active Claude Pro or Max subscription and the CLI installed before launching Personas.",
    mediaSrc: "/imgs/illustration_hd.jpg",
    mediaAlt: "FAQ media placeholder for Claude CLI setup",
  },
  {
    question: "Does Personas collect any telemetry or usage data?",
    answer:
      "No. Personas runs entirely on your machine with zero telemetry. We don't collect analytics, usage metrics, or any personal data. Your prompts, agent configurations, and execution logs never leave your device unless you explicitly enable cloud execution.",
    mediaSrc: "/imgs/illustration_hd.jpg",
    mediaAlt: "FAQ media placeholder for telemetry and privacy",
  },
  {
    question: "How does the pricing model work?",
    answer:
      "The desktop app is free forever with unlimited local agents. Cloud plans (Starter, Pro, Team) add 24/7 execution, remote workers, and team features on top. You always need your own Claude subscription — we never touch your Anthropic bill. Think of Personas as the orchestration layer, and Claude as the engine.",
    mediaSrc: "/imgs/illustration_hd.jpg",
    mediaAlt: "FAQ media placeholder for pricing model",
  },
  {
    question: "What is Bring Your Own Infrastructure (BYOI)?",
    answer:
      "BYOI lets you connect your own cloud provider credentials (e.g., Fly.io API tokens) instead of using our managed infrastructure. Personas provisions and manages the workers on your account, giving you unlimited execution without per-month caps — you only pay your cloud provider directly.",
    mediaSrc: "/imgs/illustration_hd.jpg",
    mediaAlt: "FAQ media placeholder for BYOI",
  },
  {
    question: "What's the difference between local and cloud execution?",
    answer:
      "Local execution runs agents on your machine using Claude CLI — it's instant, free, and private, but stops when your computer sleeps. Cloud execution runs agents on remote workers 24/7, supports event-bus bridging across environments, and enables team collaboration. You can switch between modes per-agent.",
    mediaSrc: "/imgs/illustration_hd.jpg",
    mediaAlt: "FAQ media placeholder for execution modes",
  },
  {
    question: "Are there any limits on the number of agents?",
    answer:
      "Locally, there are no limits — create as many agents as you want. Cloud plans have worker limits (1–5 depending on tier) and monthly execution caps. Pro and Team plans include burst auto-scaling for traffic spikes. BYOI removes all caps entirely.",
    mediaSrc: "/imgs/illustration_hd.jpg",
    mediaAlt: "FAQ media placeholder for agent limits",
  },
];

function FAQCard({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div variants={fadeUp}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left cursor-pointer group"
      >
        <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-5 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-sm font-medium leading-relaxed sm:text-base">
              {item.question}
            </h3>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 mt-0.5"
            >
              <ChevronDown className="h-4 w-4 text-muted-dark transition-colors duration-300 group-hover:text-muted" />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-1 pt-3">
              <div className="mb-4 overflow-hidden rounded-xl border border-white/6 bg-white/3">
                <div className="relative aspect-video w-full">
                  <Image
                    src={item.mediaSrc}
                    alt={item.mediaAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/45" />
                  <div className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white/80">
                    GIF placeholder
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-dark leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const midpoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midpoint);
  const rightColumn = faqs.slice(midpoint);

  return (
    <SectionWrapper id="faq" dotGrid>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[10%] top-[30%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute right-[10%] bottom-[30%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 60%)",
          }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
          Frequently{" "}
          <GradientText className="drop-shadow-lg">asked</GradientText>
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          Everything you need to know about getting started with Personas.
        </p>
      </motion.div>

      {/* Two-column FAQ grid */}
      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-4 md:grid-cols-2"
      >
        <div className="space-y-4">
          {leftColumn.map((item, i) => (
            <FAQCard key={i} item={item} index={i} />
          ))}
        </div>
        <div className="space-y-4">
          {rightColumn.map((item, i) => (
            <FAQCard key={i + midpoint} item={item} index={i + midpoint} />
          ))}
        </div>
      </motion.div>

      {/* Discord CTA */}
      <motion.div variants={fadeUp} className="mt-14 text-center">
        <div className="mx-auto inline-flex flex-col items-center gap-4 rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent px-8 py-6 sm:flex-row sm:gap-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 ring-1 ring-brand-purple/20">
            <MessageCircle className="h-5 w-5 text-brand-purple" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium">Still have questions?</p>
            <p className="mt-1 text-xs text-muted-dark">
              Join our Discord community for help and discussion.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/10 px-5 py-2 text-sm font-medium text-brand-purple transition-all duration-300 hover:border-brand-purple/30 hover:bg-brand-purple/15"
          >
            Join Discord
          </a>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
