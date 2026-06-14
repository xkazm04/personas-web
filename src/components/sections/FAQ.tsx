"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { useIsMobile } from "@/hooks/useIsMobile";
import { fadeUp, staggerContainer, TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";

import { useTranslation } from "@/i18n/useTranslation";
import { FAQDiscordCTA } from "./faq/FAQDiscordCTA";
import { FAQHeader } from "./faq/FAQHeader";
import { FALLBACK_ILLUSTRATION, FAQ_ILLUSTRATIONS_BY_POSITION, warnOnFaqIllustrationDrift, type FAQItem } from "./faq/faqIllustrations";


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
        <div className="rounded-2xl border border-glass bg-gradient-to-br from-white/[0.02] to-transparent p-4 transition-all duration-300 hover:border-glass-hover hover:bg-white/[0.025]">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base font-medium leading-relaxed sm:text-lg">
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
              <div aria-hidden="true" className="mb-4 overflow-hidden rounded-xl border border-glass-hover">
                <div className="aspect-video w-full">
                  {item.illustration}
                </div>
              </div>
              <p className="text-base text-foreground/75 leading-relaxed">
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
  const isMobile = useIsMobile();

  warnOnFaqIllustrationDrift(t.faqSection.questions.length);
  const faqs: FAQItem[] = t.faqSection.questions.map((q, i) => ({
    question: q.q,
    answer: q.a,
    illustration: FAQ_ILLUSTRATIONS_BY_POSITION[i] ?? FALLBACK_ILLUSTRATION,
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

      if (isMobile) {
        // Single stacked column (below md): focus follows reading order.
        if (e.key === "ArrowDown") nextIndex = (index + 1) % total;
        else if (e.key === "ArrowUp") nextIndex = (index - 1 + total) % total;
        else if (e.key === "Home") nextIndex = 0;
        else if (e.key === "End") nextIndex = total - 1;
      } else {
        // Two columns (md+): Up/Down stay within a column and Left/Right cross
        // columns, so keyboard order matches the on-screen spatial layout
        // instead of jumping from the bottom-left card to the top-right one.
        const inLeft = index < midpoint;
        const colStart = inLeft ? 0 : midpoint;
        const colEnd = inLeft ? midpoint - 1 : total - 1;
        if (e.key === "ArrowDown") nextIndex = index < colEnd ? index + 1 : colStart;
        else if (e.key === "ArrowUp") nextIndex = index > colStart ? index - 1 : colEnd;
        else if (e.key === "ArrowRight") nextIndex = inLeft ? Math.min(index + midpoint, total - 1) : null;
        else if (e.key === "ArrowLeft") nextIndex = inLeft ? null : index - midpoint;
        else if (e.key === "Home") nextIndex = colStart;
        else if (e.key === "End") nextIndex = colEnd;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        buttonRefs.current[nextIndex]?.focus();
      }
    };

  return (
    <SectionWrapper id="faq" aria-labelledby="faq-heading">
      <FAQHeader heading={t.faqSection.heading} headingGradient={t.faqSection.headingGradient} subtitle={t.faqSection.subtitle} />

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

      <FAQDiscordCTA stillQuestions={t.faqSection.stillQuestions} discordSubtitle={t.faqSection.discordSubtitle} joinDiscord={t.faqSection.joinDiscord} />
    </SectionWrapper>
  );
}
