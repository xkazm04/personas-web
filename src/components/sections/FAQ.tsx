"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer, TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";

import { useTranslation } from "@/i18n/useTranslation";
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

const illustrations = [
  <TerminalIllustration key="terminal" />,
  <ShieldIllustration key="shield" />,
  <PricingIllustration key="pricing" />,
  <CloudInfraIllustration key="cloud" />,
  <LocalCloudIllustration key="local" />,
  <AgentGridIllustration key="grid" />,
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
              <p className="text-sm text-muted leading-relaxed">
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
  const { t } = useTranslation();

  const faqs: FAQItem[] = t.faqSection.questions.map((q, i) => ({
    question: q.q,
    answer: q.a,
    illustration: illustrations[i],
  }));
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

  const handleKeyDown =
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
    };

  return (
    <SectionWrapper id="faq" aria-labelledby="faq-heading">
      <motion.div variants={fadeUp} className="text-center relative">
        <h2 id="faq-heading" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
          {t.faqSection.heading}{" "}
          <GradientText className="drop-shadow-lg">{t.faqSection.headingGradient}</GradientText>
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          {t.faqSection.subtitle}
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
            <p className="text-sm font-medium">{t.faqSection.stillQuestions}</p>
            <p className="mt-1 text-sm text-muted-dark">
              {t.faqSection.discordSubtitle}
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/10 px-6 py-2 text-sm font-medium text-brand-purple transition-all duration-300 hover:border-brand-purple/30 hover:bg-brand-purple/15 focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:outline-none"
          >
            {t.faqSection.joinDiscord}
          </a>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
