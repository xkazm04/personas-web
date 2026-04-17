"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, LayoutGrid } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";
import PromptSelector from "./PromptSelector";
import TerminalSim from "./TerminalSim";

export default function PlaygroundPage() {
  const [activePrompt, setActivePrompt] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[var(--background)] overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Hero */}
            <motion.div variants={fadeUp} className="text-center mb-14">
              <SectionHeading as="h1">
                See agents in{" "}
                <GradientText>action</GradientText>
              </SectionHeading>
              <p className="mt-5 text-muted-dark text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Pick a task below and watch how a Personas agent breaks it
                down, selects the right tools, and delivers results — all in
                seconds.
              </p>
            </motion.div>

            <PromptSelector active={activePrompt} onSelect={setActivePrompt} />

            <motion.div variants={fadeUp} className="mx-auto max-w-3xl mb-16">
              <TerminalSim
                active={activePrompt}
                onReset={() => setActivePrompt(null)}
              />
            </motion.div>

            {/* Bottom CTA */}
            <motion.div variants={fadeUp} className="mx-auto max-w-xl">
              <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 text-center overflow-hidden">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-cyan/[0.04] via-transparent to-purple-500/[0.04] pointer-events-none" />

                <h3 className="relative text-xl font-bold text-foreground mb-3">
                  Ready to build your own agents?
                </h3>
                <p className="relative text-base text-muted-dark mb-6">
                  Download Personas and create autonomous agents that connect
                  to your tools, follow your rules, and run on your schedule.
                </p>
                <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/#download"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 px-5 py-2.5 text-base font-semibold text-brand-cyan transition-all hover:bg-brand-cyan/25"
                  >
                    <Download className="h-4 w-4" />
                    Download Personas
                  </Link>
                  <Link
                    href="/templates"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-base font-medium text-muted hover:text-foreground hover:border-white/20 transition-all"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Browse Templates
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
