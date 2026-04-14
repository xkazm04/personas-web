"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionIntro, TerminalPanel } from "@/components/primitives";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp } from "@/lib/animations";
import { DOWNLOAD_FAQS } from "@/data/download";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-base font-medium text-foreground pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-base text-muted leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

export default function DownloadFaq() {
  return (
    <SectionWrapper id="download-faq" aria-label="Download FAQ">
      <SectionIntro heading="Frequently" gradient="asked" />

      <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
        <TerminalPanel bg={40} shadow="none" bodyClassName="px-6">
          {DOWNLOAD_FAQS.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </TerminalPanel>
      </motion.div>
    </SectionWrapper>
  );
}
