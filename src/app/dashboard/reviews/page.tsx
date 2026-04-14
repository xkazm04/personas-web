"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import ReviewsSplitPane from "./ReviewsSplitPane";

export default function ReviewsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">Manual Reviews</GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          Review and approve agent decisions requiring human oversight
        </p>
      </motion.div>

      <ReviewsSplitPane />
    </motion.div>
  );
}
