"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import PrimaryCTA from "@/components/PrimaryCTA";
import { SectionIntro } from "@/components/primitives";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { FEATURE_GROUPS } from "./data";
import FeatureGroupCard from "./FeatureGroupCard";

const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;

/**
 * Landing section — re-labelled from the old Pricing tiers to a feature-group
 * showcase sourced from /guide categories. Anchor remains `#pricing` so the
 * scroll-map and existing hash links keep working.
 */

export default function Pricing() {
  const { t } = useTranslation();
  return (
    <SectionWrapper id="pricing" aria-labelledby="compare-heading">
      <SectionIntro
        id="compare-heading"
        heading={t.compareSection.heading}
        gradient={t.compareSection.headingGradient}
        description={t.compareSection.description}
      />

      {/* Offer framing — the section dropped its old price tiers, so restate the
          actual offer (free, self-hosted, no markup) with a primary CTA. */}
      <motion.div
        variants={fadeUp}
        className="mx-auto mt-10 max-w-3xl rounded-2xl border border-glass bg-white/[0.02] px-6 py-6 text-center backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <span className="text-brand-cyan">Free forever</span>
          <span className="text-foreground/80">Self-hosted</span>
          <span className="text-foreground/80">No per-run markup</span>
          <span className="text-foreground/80">Open source</span>
        </div>
        <p className="mx-auto mt-3 max-w-xl text-sm font-light text-muted-dark">
          Personas runs on your machine. No orchestration markup and no per-seat
          pricing. Paid cloud and priority support are optional, not required.
        </p>
        <div className="mt-5 flex justify-center">
          <PrimaryCTA
            href={DOWNLOAD_URL ? "/api/download" : "#download"}
            icon={Download}
            label="Get started free"
          />
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-14 mx-auto max-w-6xl grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURE_GROUPS.map((group) => (
          <FeatureGroupCard key={group.id} group={group} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
