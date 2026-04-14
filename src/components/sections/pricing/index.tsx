"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { staggerContainer } from "@/lib/animations";
import { FEATURE_GROUPS } from "./data";
import FeatureGroupCard from "./FeatureGroupCard";

/**
 * Landing section — re-labelled from the old Pricing tiers to a feature-group
 * showcase sourced from /guide categories. Anchor remains `#pricing` so the
 * scroll-map and existing hash links keep working.
 */

export default function Pricing() {
  return (
    <SectionWrapper id="pricing" aria-labelledby="compare-heading">
      <SectionIntro
        id="compare-heading"
        heading="Everything is"
        gradient="free"
        description="The desktop app and every capability below ship free forever. No tiers, no per-seat pricing — just a complete agent platform running on your machine."
      />

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
