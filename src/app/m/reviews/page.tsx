"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import ReviewsFocusFlow from "@/app/dashboard/reviews/ReviewsFocusFlow";
import { useReviewStore } from "@/stores/reviewStore";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function MobileReviewsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const fetchReviews = useReviewStore((s) => s.fetchReviews);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-4"
    >
      <motion.h1 variants={fadeUp} className="text-2xl font-bold tracking-tight">
        {t.dashboard.reviews}
      </motion.h1>
      <ReviewsFocusFlow onExit={() => router.push("/m/overview")} />
    </motion.div>
  );
}
