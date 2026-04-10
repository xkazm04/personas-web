"use client";

import { motion } from "framer-motion";
import { Download, Shield, Zap, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import ComparisonTable from "@/components/sections/ComparisonTable";
import { fadeUp } from "@/lib/animations";
import { VERDICT_POINTS } from "@/data/comparison";

const VERDICT_ICONS = [Shield, Zap, Zap, MessageSquare];

const scrollMapItems = [
  { label: "COMPARE", href: "#comparison" },
  { label: "WHY", href: "#verdict" },
  { label: "GET", href: "#download-cta" },
];

export default function ComparePage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        {/* ── Hero ───────────────────────────────────────────────── */}
        <SectionWrapper id="comparison" aria-label="Competitor comparison">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-cyan/70">
              Feature comparison
            </p>
            <SectionHeading>
              How{" "}
              <GradientText className="drop-shadow-lg">Personas</GradientText>
              {" "}compares
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Desktop-first agent orchestration, free forever. See exactly where
              Personas leads — and where others have strengths — across pricing,
              security, triggers, observability, and developer experience.
            </p>
          </motion.div>

          <ComparisonTable />
        </SectionWrapper>

        {/* ── Verdict / Why Personas ─────────────────────────────── */}
        <SectionWrapper id="verdict" aria-label="Why choose Personas">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <SectionHeading>
              Why teams choose{" "}
              <GradientText className="drop-shadow-lg">Personas</GradientText>
            </SectionHeading>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {VERDICT_POINTS.map((point, i) => {
              const Icon = VERDICT_ICONS[i] ?? Shield;
              return (
                <motion.div
                  key={point.title}
                  variants={fadeUp}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 transition-colors hover:border-white/[0.1]"
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${point.color}15` }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: point.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {point.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </SectionWrapper>

        {/* ── Download CTA ──────────────────────────────────────── */}
        <SectionWrapper id="download-cta" aria-label="Download Personas">
          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <SectionHeading>
              Ready to{" "}
              <GradientText className="drop-shadow-lg">switch</GradientText>?
            </SectionHeading>
            <p className="mt-6 text-base text-muted leading-relaxed font-light">
              Download Personas free — no signup, no credit card, no cloud
              account. Your agents run on your machine from minute one.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/#download"
                className="inline-flex items-center gap-2 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 px-8 py-3 text-sm font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan/25"
              >
                <Download className="h-4 w-4" />
                Download Free
              </a>
              <a
                href="/features"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3 text-sm font-medium text-muted transition-colors hover:border-white/20 hover:text-foreground"
              >
                Explore Features
              </a>
            </div>
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
