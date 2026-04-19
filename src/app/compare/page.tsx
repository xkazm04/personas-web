"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import ComparisonTable from "@/components/sections/ComparisonTable";
import { SectionIntro } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";

const scrollMapItems = [
  { label: "COMPARE", href: "#comparison" },
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
          <SectionIntro
            eyebrow="Feature comparison"
            heading="How"
            gradient="Personas"
            trailing=" compares"
            description="Desktop-first agent orchestration, free forever. See exactly where Personas leads — and where others have strengths — across pricing, security, triggers, observability, and developer experience."
          />

          <ComparisonTable />
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
              <Link
                href="/#download"
                className="inline-flex items-center gap-2 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 px-8 py-3 text-base font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan/25"
              >
                <Download className="h-4 w-4" />
                Download Free
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 rounded-full border border-glass-hover px-8 py-3 text-base font-medium text-muted transition-colors hover:border-white/20 hover:text-foreground"
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
