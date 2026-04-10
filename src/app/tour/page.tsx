"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Download, Check, Play } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";
import { TOUR_STEPS } from "@/data/tour";

const scrollMapItems = [
  { label: "TOUR", href: "#tour" },
  { label: "START", href: "#get-started" },
];

function StepIndicator({
  steps,
  activeIndex,
  onSelect,
}: {
  steps: typeof TOUR_STEPS;
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {steps.map((step, i) => (
        <button
          key={step.id}
          onClick={() => onSelect(i)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
            i === activeIndex
              ? "border bg-white/8 text-foreground"
              : i < activeIndex
                ? "border border-white/10 bg-white/3 text-foreground"
                : "border border-white/6 bg-white/1 text-muted hover:border-white/10"
          }`}
          style={{
            borderColor: i === activeIndex ? `${step.color}40` : undefined,
          }}
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              backgroundColor:
                i <= activeIndex ? `${step.color}20` : "rgba(255,255,255,0.05)",
              color: i <= activeIndex ? step.color : "inherit",
            }}
          >
            {i < activeIndex ? <Check className="h-3 w-3" /> : step.number}
          </span>
          <span className="hidden sm:inline">{step.title}</span>
        </button>
      ))}
    </div>
  );
}

function StepContent({ step }: { step: (typeof TOUR_STEPS)[0] }) {
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="grid gap-8 lg:grid-cols-[1fr_1.2fr] items-center"
    >
      {/* Text content */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
            style={{
              backgroundColor: `${step.color}20`,
              color: step.color,
            }}
          >
            {step.number}
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${step.color}10`,
              color: step.color,
            }}
          >
            {step.timeEstimate}
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-base text-muted/80 mb-2 italic">{step.subtitle}</p>
        <p className="text-base text-muted leading-relaxed mb-6">
          {step.description}
        </p>

        <ul className="space-y-3">
          {step.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
              <Check
                className="h-4 w-4 shrink-0 mt-0.5"
                style={{ color: step.color }}
              />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual mock */}
      <div
        className="rounded-2xl border bg-black/60 backdrop-blur-xl p-6 sm:p-8 min-h-[320px] flex flex-col justify-center"
        style={{ borderColor: `${step.color}15` }}
      >
        {/* Simulated window chrome */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <div className="ml-4 flex-1 h-5 rounded-md bg-white/[0.03] flex items-center px-3">
            <span className="text-[10px] text-muted/50 font-mono">personas://</span>
          </div>
        </div>

        {/* Step-specific simulated UI */}
        <div className="space-y-3">
          {step.details.slice(0, 4).map((detail, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-3"
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${step.color}10` }}
              >
                <Play
                  className="h-3.5 w-3.5"
                  style={{ color: step.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="h-2.5 rounded-full mb-1.5"
                  style={{
                    width: `${70 + i * 8}%`,
                    backgroundColor: `${step.color}15`,
                  }}
                />
                <div className="h-2 w-3/5 rounded-full bg-white/[0.04]" />
              </div>
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${step.color}15` }}
              >
                <Check className="h-3 w-3" style={{ color: step.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function TourPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const step = TOUR_STEPS[activeIndex];

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        <SectionWrapper id="tour" aria-label="Product tour">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-cyan/70">
              Product Tour
            </p>
            <SectionHeading>
              From download to{" "}
              <GradientText className="drop-shadow-lg">running agents</GradientText>
              {" "}in 5 minutes
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              See how Personas works — step by step. No signup required, no cloud
              account, no credit card. Just download and build.
            </p>
          </motion.div>

          {/* Step indicators */}
          <motion.div variants={fadeUp} className="mb-12">
            <StepIndicator
              steps={TOUR_STEPS}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
          </motion.div>

          {/* Active step content */}
          <motion.div variants={fadeUp}>
            <AnimatePresence mode="wait">
              <StepContent step={step} />
            </AnimatePresence>
          </motion.div>

          {/* Navigation */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex items-center justify-between"
          >
            <button
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-muted transition-colors hover:border-white/20 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-sm text-muted">
              {activeIndex + 1} / {TOUR_STEPS.length}
            </span>

            {activeIndex < TOUR_STEPS.length - 1 ? (
              <button
                onClick={() =>
                  setActiveIndex((i) => Math.min(TOUR_STEPS.length - 1, i + 1))
                }
                className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                style={{
                  borderColor: `${step.color}30`,
                  color: step.color,
                }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/#download"
                className="flex items-center gap-2 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 px-5 py-2.5 text-sm font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan/25"
              >
                <Download className="h-4 w-4" />
                Download Now
              </Link>
            )}
          </motion.div>
        </SectionWrapper>

        {/* CTA */}
        <SectionWrapper id="get-started" aria-label="Get started">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <SectionHeading>
              Ready to{" "}
              <GradientText className="drop-shadow-lg">build</GradientText>?
            </SectionHeading>
            <p className="mt-6 text-base text-muted leading-relaxed font-light">
              5 minutes from download to your first running agent. Free forever,
              fully private, zero telemetry.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#download"
                className="inline-flex items-center gap-2 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 px-8 py-3 text-sm font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan/25"
              >
                <Download className="h-4 w-4" />
                Download Free
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3 text-sm font-medium text-muted transition-colors hover:border-white/20 hover:text-foreground"
              >
                Explore Features
              </Link>
            </div>
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
