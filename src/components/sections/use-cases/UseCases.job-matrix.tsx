"use client";

import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import JobMatrix from "./UseCases.job-matrix.matrix";

/**
 * Use-cases, "job matrix" direction (/illustrate prototype). Claim: one persona
 * keeps its identity and picks up many jobs across your tools. The matrix is
 * every real tool by every real job from `data.ts`, framed as a single persona
 * card with one spine in the persona's colour running through all rows.
 */
export default function UseCasesJobMatrix() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="use-cases">
      <SectionIntro heading={t.useCasesSection.heading} gradient={t.useCasesSection.headingGradient} />

      <div data-tour-diagram="tools">
        <JobMatrix />
      </div>

      <motion.div variants={fadeUp} className="mt-12 flex justify-center">
        <Link
          href="/templates"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brand-cyan/30 bg-brand-cyan/5 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:border-brand-cyan/50 hover:bg-brand-cyan/10 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <LayoutGrid className="relative h-5 w-5 text-brand-cyan transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="relative">{t.useCasesSection.browseTemplates}</span>
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}
