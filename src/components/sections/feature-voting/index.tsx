"use client";

import SectionWrapper from "@/components/SectionWrapper";
import { SEED_VOTES_TOTAL, features } from "./data";
import { useFeatureVotingState } from "./useFeatureVotingState";
import CustomFeatureRequest from "./components/CustomFeatureRequest";
import FeatureVotingGrid from "./components/FeatureVotingGrid";
import { FeatureVotingHeader } from "./components/FeatureVotingHeader";
import { FeatureVotingSummary } from "./components/FeatureVotingSummary";

export default function FeatureVoting() {
  const {
    votedIds,
    comments,
    boostTotals,
    voteCounts,
    loadState,
    failures,
    handleToggleVote,
    handleAddComment,
    handleBoost,
  } = useFeatureVotingState();

  const totalBoosts = Object.values(boostTotals).reduce((s, v) => s + v, 0);
  const sorted = [...features].sort((a, b) => {
    const aTotal = a.votes + (voteCounts[a.id] ?? 0);
    const bTotal = b.votes + (voteCounts[b.id] ?? 0);
    return bTotal - aTotal;
  });
  const realVotesTotal = Object.values(voteCounts).reduce((s, v) => s + v, 0);

  return (
    <SectionWrapper id="vote">
      <FeatureVotingHeader />

      <FeatureVotingGrid
        loadState={loadState}
        sorted={sorted}
        voteCounts={voteCounts}
        votedIds={votedIds}
        comments={comments}
        boostTotals={boostTotals}
        failures={failures}
        onToggleVote={handleToggleVote}
        onAddComment={handleAddComment}
        onBoost={handleBoost}
      />

      <CustomFeatureRequest />

      {/* Seed and live halves stay separate so the summary can disclose which part was measured (see `data.ts`). */}
      <FeatureVotingSummary seedVotes={SEED_VOTES_TOTAL} liveVotes={realVotesTotal} commentsCount={comments.length} totalBoosts={totalBoosts} loadState={loadState} />
    </SectionWrapper>
  );
}
