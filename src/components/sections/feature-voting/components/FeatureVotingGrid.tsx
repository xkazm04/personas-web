"use client";

import { motion } from "framer-motion";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import { staggerContainer } from "@/lib/animations";
import { KOFI_USERNAME } from "../data";
import type { Comment, Feature, LoadState } from "../local-types";
import FeatureVoteCard from "./FeatureVoteCard";

// Two columns from sm, three from lg. With an odd card count the last card
// would sit alone on the two-column row, so it spans both columns there; at lg
// the set (three cards today) fills one row.
const GRID =
  "mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 " +
  "sm:[&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1";

export default function FeatureVotingGrid({
  loadState,
  sorted,
  voteCounts,
  votedIds,
  comments,
  boostTotals,
  onToggleVote,
  onAddComment,
  onBoost,
}: {
  loadState: LoadState;
  sorted: Feature[];
  voteCounts: Record<string, number>;
  votedIds: Set<string>;
  comments: Comment[];
  boostTotals: Record<string, number>;
  onToggleVote: (featureId: string, voted: boolean) => void;
  onAddComment: (featureId: string, text: string, parentId: string | null) => void;
  onBoost: (featureId: string, weight: number) => void;
}) {
  if (loadState === "loading") {
    return (
      <div className={GRID} aria-hidden="true">
        {sorted.map((feature) => (
          <SkeletonCard key={feature.id} lines={3} />
        ))}
      </div>
    );
  }

  // Self-drives its own whileInView reveal (rather than inheriting from
  // SectionWrapper) so cards that mount when the load resolves AFTER the
  // section has already scrolled into view still animate in instead of
  // staying stuck invisible (framer late-mount + one-shot reveal gotcha).
  return (
    <motion.div
      data-tour-diagram="vote"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className={GRID}
    >
      {sorted.map((feature) => (
        <FeatureVoteCard
          key={feature.id}
          feature={feature}
          apiCount={voteCounts[feature.id] ?? 0}
          initialVoted={votedIds.has(feature.id)}
          onToggleVote={onToggleVote}
          comments={comments}
          onAddComment={onAddComment}
          boostCount={boostTotals[feature.id] ?? 0}
          onBoost={onBoost}
          showBoostUI={!!KOFI_USERNAME}
        />
      ))}
    </motion.div>
  );
}
