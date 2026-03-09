"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer, TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";

import TerminalIllustration from "@/components/illustrations/TerminalIllustration";
import ShieldIllustration from "@/components/illustrations/ShieldIllustration";
import PricingIllustration from "@/components/illustrations/PricingIllustration";
import CloudInfraIllustration from "@/components/illustrations/CloudInfraIllustration";
import LocalCloudIllustration from "@/components/illustrations/LocalCloudIllustration";
import AgentGridIllustration from "@/components/illustrations/AgentGridIllustration";

type FAQItem = {
  question: string;
  answer: string;
  illustration: ReactNode;
};

/* ── FAQ data ─────────────────────────────────────────────────────────── */

const faqs: FAQItem[] = [
  {
    question: "What is Claude CLI and why do I need it?",
    answer:
      "Claude CLI is Anthropic's official command-line interface for interacting with Claude. Personas uses it under the hood to run your agents locally — it handles authentication, model access, and streaming responses. You'll need an active Claude Pro or Max subscription and the CLI installed before launching Personas.",
    illustration: <TerminalIllustration />,
  },
  {
    question: "Does Personas collect any telemetry or usage data?",
    answer:
      "No. Personas runs entirely on your machine with zero telemetry. We don't collect analytics, usage metrics, or any personal data. Your prompts, agent configurations, and execution logs never leave your device unless you explicitly enable cloud execution.",
    illustration: <ShieldIllustration />,
  },
  {
    question: "How does the pricing model work?",
    answer:
      "The desktop app is free forever with unlimited local agents. Cloud plans (Starter, Pro, Team) add 24/7 execution, remote workers, and team features on top. You always need your own Claude subscription — we never touch your Anthropic bill. Think of Personas as the orchestration layer, and Claude as the engine.",
    illustration: <PricingIllustration />,
  },
  {
    question: "What is Bring Your Own Infrastructure (BYOI)?",
    answer:
      "BYOI lets you connect your own cloud provider credentials (e.g., Fly.io API tokens) instead of using our managed infrastructure. Personas provisions and manages the workers on your account, giving you unlimited execution without per-month caps — you only pay your cloud provider directly.",
    illustration: <CloudInfraIllustration />,
  },
  {
    question: "What's the difference between local and cloud execution?",
    answer:
      "Local execution runs agents on your machine using Claude CLI — it's instant, free, and private, but stops when your computer sleeps. Cloud execution runs agents on remote workers 24/7, supports event-bus bridging across environments, and enables team collaboration. You can switch between modes per-agent.",
    illustration: <LocalCloudIllustration />,
  },
  {
    question: "Are there any limits on the number of agents?",
    answer:
      "Locally, there are no limits — create as many agents as you want. Cloud plans have worker limits (1–5 depending on tier) and monthly execution caps. Pro and Team plans include burst auto-scaling for traffic spikes. BYOI removes all caps entirely.",
    illustration: <AgentGridIllustration />,
  },
];

function FAQCard({
  item,
  index,
  buttonRef,
  onKeyDown,
}: {
  item: FAQItem;
  index: number;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerId = `faq-trigger-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <motion.div variants={fadeUp}>
      <button
        ref={buttonRef}
        id={triggerId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none focus-visible:rounded-2xl"
      >
        <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-4 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-sm font-medium leading-relaxed sm:text-base">
              {item.question}
            </h3>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={TRANSITION_FAST}
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
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={TRANSITION_NORMAL}
            className="overflow-hidden"
          >
            <div className="px-4 pb-1 pt-3">
              <div className="mb-4 overflow-hidden rounded-xl border border-white/6 bg-white/3">
                <div className="aspect-video w-full">
                  {item.illustration}
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
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const setButtonRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      buttonRefs.current[index] = el;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      const total = faqs.length;
      let nextIndex: number | null = null;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (index + 1) % total;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (index - 1 + total) % total;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = total - 1;
      }

      if (nextIndex !== null) {
        buttonRefs.current[nextIndex]?.focus();
      }
    },
    [],
  );

  return (
    <SectionWrapper id="faq" aria-labelledby="faq-heading">
      <motion.div variants={fadeUp} className="text-center relative">
        <h2 id="faq-heading" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
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
            <FAQCard
              key={i}
              item={item}
              index={i}
              buttonRef={setButtonRef(i)}
              onKeyDown={handleKeyDown(i)}
            />
          ))}
        </div>
        <div className="space-y-4">
          {rightColumn.map((item, i) => (
            <FAQCard
              key={i + midpoint}
              item={item}
              index={i + midpoint}
              buttonRef={setButtonRef(i + midpoint)}
              onKeyDown={handleKeyDown(i + midpoint)}
            />
          ))}
        </div>
      </motion.div>

      {/* Discord CTA */}
      <motion.div variants={fadeUp} className="mt-14 text-center">
        <div className="mx-auto inline-flex flex-col items-center gap-4 rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent px-8 py-6 sm:flex-row sm:gap-6">
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
            className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/10 px-6 py-2 text-sm font-medium text-brand-purple transition-all duration-300 hover:border-brand-purple/30 hover:bg-brand-purple/15 focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:outline-none"
          >
            Join Discord
          </a>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
