"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Minus, ChevronDown } from "lucide-react";
import Image from "next/image";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { COMPARISON_DATA } from "@/data/pricing";

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-emerald/15">
          <Check className="h-3.5 w-3.5 text-brand-emerald" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
          <X className="h-3.5 w-3.5 text-muted" />
        </div>
      </div>
    );
  }
  return (
    <span className="text-sm text-muted text-center block">{value}</span>
  );
}

function CategorySection({
  name,
  features,
  defaultOpen,
}: {
  name: string;
  features: typeof COMPARISON_DATA[0]["features"];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 sm:px-6 py-4 text-left transition-colors hover:bg-white/2"
      >
        <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {name}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="pb-2">
          {features.map((row) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_100px_100px] sm:grid-cols-[1fr_140px_140px] items-center gap-2 px-4 sm:px-6 py-3 transition-colors ${
                row.highlight
                  ? "bg-brand-cyan/[0.03]"
                  : "hover:bg-white/[0.015]"
              }`}
            >
              <span className={`text-sm ${row.highlight ? "text-foreground font-medium" : "text-muted"}`}>
                {row.label}
              </span>
              <CellValue value={row.personas} />
              <CellValue value={row.n8n} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  return (
    <SectionWrapper id="pricing" aria-labelledby="pricing-heading">
      <motion.div variants={fadeUp} className="text-center relative">
        <SectionHeading id="pricing-heading">
          Why{" "}
          <GradientText className="drop-shadow-lg">Personas</GradientText>
          ?
        </SectionHeading>
        <p className="mx-auto mt-8 max-w-3xl text-base text-muted leading-relaxed font-light">
          Personas is a free orchestration layer. You pay only for your own Claude Code usage.
          Compare the features that matter.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mt-16 mx-auto max-w-4xl"
      >
        {/* Comparison table */}
        <div className="rounded-2xl border border-white/8 bg-black/40 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_100px] sm:grid-cols-[1fr_140px_140px] items-center gap-2 px-4 sm:px-6 py-5 border-b border-white/8 bg-white/[0.02]">
            <div className="text-sm font-medium text-muted">Feature</div>
            <div className="text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Image
                  src="/imgs/logo.png"
                  alt="Personas"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
                <span className="text-sm font-semibold text-foreground">Personas</span>
                <span className="rounded-full border border-brand-emerald/30 bg-brand-emerald/10 px-2.5 py-0.5 text-sm font-semibold text-brand-emerald uppercase tracking-wider">
                  Free
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#ea4b83]/15">
                  <span className="text-sm font-bold text-[#ea4b83]">n</span>
                </div>
                <span className="text-sm font-semibold text-foreground">n8n</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-sm font-semibold text-muted uppercase tracking-wider">
                  From €20/mo
                </span>
              </div>
            </div>
          </div>

          {/* Categories */}
          {COMPARISON_DATA.map((cat, i) => (
            <CategorySection
              key={cat.name}
              name={cat.name}
              features={cat.features}
              defaultOpen={i < 3}
            />
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10 text-center space-y-4">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/4 bg-white/1 px-4 py-3 sm:px-6">
          <p className="text-sm text-muted leading-relaxed">
            Personas is a free desktop app for AI agent orchestration. You bring your own Claude subscription.
            <span className="mx-2 hidden sm:inline text-white/10">|</span>
            <span className="text-brand-cyan/70">We never touch your Anthropic bill.</span>
          </p>
        </div>
        <a
          href="/compare"
          className="inline-flex items-center gap-1.5 text-sm text-brand-cyan/70 hover:text-brand-cyan transition-colors"
        >
          See full comparison with CrewAI, LangChain, n8n &amp; more
          <span aria-hidden="true">&rarr;</span>
        </a>
      </motion.div>
    </SectionWrapper>
  );
}
