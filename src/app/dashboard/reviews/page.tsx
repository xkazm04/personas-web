"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Focus } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import ReviewsSplitPane from "./ReviewsSplitPane";
import ReviewsFocusFlow from "./ReviewsFocusFlow";
import { useTranslation } from "@/i18n/useTranslation";

export default function ReviewsPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"split" | "focus">("split");

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-4 flex items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">Manual Reviews</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">
            Review and approve agent decisions requiring human oversight
          </p>
        </div>
        {mode === "split" && (
          <button
            type="button"
            onClick={() => setMode("focus")}
            className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-2 text-sm font-medium text-cyan-300 transition-all hover:bg-brand-cyan/15"
          >
            <Focus className="h-3.5 w-3.5" />
            {t.reviewsPage.focus.enter}
          </button>
        )}
      </motion.div>

      {mode === "split" ? (
        <ReviewsSplitPane />
      ) : (
        <ReviewsFocusFlow onExit={() => setMode("split")} />
      )}
    </motion.div>
  );
}
