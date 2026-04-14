"use client";

import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { revealFromBelow, staggerContainer } from "@/lib/animations";
import { PLATFORM_CARDS } from "./data";
import PlatformCardTile from "./PlatformCardTile";

/**
 * Landing "Platform" section — 6 branded cards with Leonardo-generated
 * illustrations. Each card is opaque on idle, fully visible on hover, and
 * click-toggles an info panel with description + guide deep-link.
 */

export default function VisionGrid() {
  return (
    <SectionWrapper id="vision-grid" className="relative overflow-hidden">
      <div className="mx-auto max-w-3xl text-center relative z-10 mb-14">
        <motion.div variants={revealFromBelow}>
          <SectionHeading>
            The <GradientText>platform</GradientText> behind your agents
          </SectionHeading>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
            Hover a card to see its branded illustration — click to uncover
            what it does.
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {PLATFORM_CARDS.map((card) => (
          <PlatformCardTile key={card.id} card={card} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
