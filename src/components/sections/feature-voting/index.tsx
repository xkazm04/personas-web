"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import SectionWrapper from "@/components/SectionWrapper";
import { staggerContainer } from "@/lib/animations";
import { trackFeatureComment } from "@/lib/analytics";
import { useAbortableEffect } from "@/hooks/useAbortableEffect";
import type { Comment } from "./local-types";
import {
  KOFI_USERNAME,
  features,
  fetchBoostTotals,
  fetchComments,
  fetchVotes,
  getOrCreateAuthor,
  getOrCreateVoterId,
  postBoost,
  postComment,
  postVoteToggle,
} from "./data";
import FeatureVoteCard from "./components/FeatureVoteCard";
import CustomFeatureRequest from "./components/CustomFeatureRequest";
import { FeatureVotingHeader } from "./components/FeatureVotingHeader";
import { FeatureVotingSummary } from "./components/FeatureVotingSummary";

export default function FeatureVoting() {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [boostTotals, setBoostTotals] = useState<Record<string, number>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const voterIdRef = useRef<string>("");

  useAbortableEffect((signal) => {
    if (!voterIdRef.current) {
      voterIdRef.current = getOrCreateVoterId();
    }

    Promise.allSettled([
      fetchVotes(voterIdRef.current, signal),
      fetchComments(signal),
      fetchBoostTotals(signal),
    ]).then(([votes, comm, boosts]) => {
      if (signal.aborted) return;
      if (votes.status === "fulfilled") {
        setVoteCounts(votes.value.counts);
        setVotedIds(votes.value.userVotes);
      }
      if (comm.status === "fulfilled") {
        setComments(comm.value);
      }
      if (boosts.status === "fulfilled") {
        setBoostTotals(boosts.value);
      }
      setLoaded(true);
    });
  }, []);

  const handleToggleVote = useCallback(
    (featureId: string, voted: boolean) => {
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (voted) next.add(featureId);
        else next.delete(featureId);
        return next;
      });
      // Optimistic count update — corrected if the API rejects.
      setVoteCounts((prev) => ({
        ...prev,
        [featureId]: Math.max(0, (prev[featureId] ?? 0) + (voted ? 1 : -1)),
      }));

      postVoteToggle(featureId, voterIdRef.current).catch((err) => {
        Sentry.captureException(err, {
          tags: { component: "FeatureVoting", action: "toggleVote" },
        });
        // Roll back the optimistic update.
        setVotedIds((prev) => {
          const next = new Set(prev);
          if (voted) next.delete(featureId);
          else next.add(featureId);
          return next;
        });
        setVoteCounts((prev) => ({
          ...prev,
          [featureId]: Math.max(0, (prev[featureId] ?? 0) + (voted ? -1 : 1)),
        }));
      });
    },
    [],
  );

  const handleAddComment = useCallback(
    (featureId: string, text: string, parentId: string | null) => {
      const author = getOrCreateAuthor();
      trackFeatureComment(featureId, parentId ? "reply" : "add");

      // Optimistic — show immediately, replace with server row when it lands.
      const optimisticId = `pending-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const optimistic: Comment = {
        id: optimisticId,
        featureId,
        parentId,
        text,
        author,
        timestamp: Date.now(),
      };
      setComments((prev) => [...prev, optimistic]);

      postComment({ featureId, parentId, text, author })
        .then((saved) => {
          setComments((prev) => prev.map((c) => (c.id === optimisticId ? saved : c)));
        })
        .catch((err) => {
          Sentry.captureException(err, {
            tags: { component: "FeatureVoting", action: "addComment" },
          });
          // Roll back the optimistic insert.
          setComments((prev) => prev.filter((c) => c.id !== optimisticId));
        });
    },
    [],
  );

  const handleBoost = useCallback((featureId: string, weight: number) => {
    setBoostTotals((prev) => ({
      ...prev,
      [featureId]: (prev[featureId] ?? 0) + weight,
    }));

    postBoost({
      featureId,
      voterId: voterIdRef.current,
      weight,
      tierValue: weight,
    }).catch((err) => {
      Sentry.captureException(err, {
        tags: { component: "FeatureVoting", action: "boost" },
      });
      setBoostTotals((prev) => ({
        ...prev,
        [featureId]: Math.max(0, (prev[featureId] ?? 0) - weight),
      }));
    });
  }, []);

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

      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-6 sm:grid-cols-2"
      >
        {sorted.map((feature) => (
          <FeatureVoteCard
            key={feature.id}
            feature={feature}
            apiCount={voteCounts[feature.id] ?? 0}
            initialVoted={votedIds.has(feature.id)}
            onToggleVote={handleToggleVote}
            comments={comments}
            onAddComment={handleAddComment}
            boostCount={boostTotals[feature.id] ?? 0}
            onBoost={handleBoost}
            showBoostUI={!!KOFI_USERNAME}
          />
        ))}
      </motion.div>

      <CustomFeatureRequest />

      <FeatureVotingSummary totalVotes={sorted.reduce((s, f) => s + f.votes, 0) + realVotesTotal} commentsCount={comments.length} totalBoosts={totalBoosts} loaded={loaded} />
    </SectionWrapper>
  );
}
