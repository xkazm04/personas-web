"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, LayoutGrid } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import PromptSelector from "./PromptSelector";
import TerminalSim from "./TerminalSim";

export default function PlaygroundPage() {
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const { t } = useTranslation();
  const pg = t.playgroundPage;

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative min-h-screen overflow-hidden bg-[var(--background)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Hero */}
            <motion.div variants={fadeUp} className="text-center mb-14">
              <SectionHeading as="h1">
                {pg.heroHeading}{" "}
                <GradientText>{pg.heroHeadingGradient}</GradientText>
              </SectionHeading>
              <p className="mt-5 text-muted-dark text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {pg.heroDescription}
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
              <div className="relative rounded-2xl border border-glass-hover bg-white/[0.02] backdrop-blur-xl p-8 text-center overflow-hidden">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-cyan/[0.04] via-transparent to-purple-500/[0.04] pointer-events-none" />

                <h3 className="relative text-xl font-bold text-foreground mb-3">
                  {pg.ctaTitle}
                </h3>
                <p className="relative text-base text-muted-dark mb-6">
                  {pg.ctaDescription}
                </p>
                <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/#download"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 px-5 py-2.5 text-base font-semibold text-brand-cyan transition-all hover:bg-brand-cyan/25"
                  >
                    <Download className="h-4 w-4" />
                    {pg.ctaDownload}
                  </Link>
                  <Link
                    href="/templates"
                    className="inline-flex items-center gap-2 rounded-lg border border-glass-hover bg-white/[0.04] px-5 py-2.5 text-base font-medium text-muted hover:text-foreground hover:border-white/20 transition-all"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    {pg.ctaBrowseTemplates}
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
