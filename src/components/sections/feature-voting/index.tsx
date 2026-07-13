"use client";

import { useCallback, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import SectionWrapper from "@/components/SectionWrapper";
import { trackFeatureComment } from "@/lib/analytics";
import { useAbortableEffect } from "@/hooks/useAbortableEffect";
import type { Comment, LoadState } from "./local-types";
import {
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
import CustomFeatureRequest from "./components/CustomFeatureRequest";
import FeatureVotingGrid from "./components/FeatureVotingGrid";
import { FeatureVotingHeader } from "./components/FeatureVotingHeader";
import { FeatureVotingSummary } from "./components/FeatureVotingSummary";

export default function FeatureVoting() {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [boostTotals, setBoostTotals] = useState<Record<string, number>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const voterIdRef = useRef<string>("");
  const boostInFlightRef = useRef<Set<string>>(new Set());

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
      // Only claim "Live" if at least one source actually resolved; if the
      // whole batch rejected, drop into a quiet degraded state rather than
      // presenting seed-only data as though it were live.
      const anyOk =
        votes.status === "fulfilled" ||
        comm.status === "fulfilled" ||
        boosts.status === "fulfilled";
      setLoadState(anyOk ? "live" : "degraded");
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
    // The Ko-fi <a> has no native in-flight guard; ignore re-clicks on a feature
    // whose boost is still in flight so a double-click can't double-apply.
    if (boostInFlightRef.current.has(featureId)) return;
    boostInFlightRef.current.add(featureId);

    setBoostTotals((prev) => ({
      ...prev,
      [featureId]: (prev[featureId] ?? 0) + weight,
    }));

    postBoost({
      featureId,
      voterId: voterIdRef.current,
      weight,
      tierValue: weight,
    })
      .then(() => {
        // The server upserts one boost row per (feature, voter): a re-boost
        // REPLACES the tier rather than adding, so the optimistic += drifts high.
        // Reconcile from the authoritative totals (best-effort — the boost has
        // already succeeded, so a refetch failure must NOT roll it back).
        // Retry once before accepting the drift, then give up silently.
        fetchBoostTotals()
          .then((authoritative) => setBoostTotals(authoritative))
          .catch(() =>
            fetchBoostTotals()
              .then((authoritative) => setBoostTotals(authoritative))
              .catch(() => {}),
          );
      })
      .catch((err) => {
        Sentry.captureException(err, {
          tags: { component: "FeatureVoting", action: "boost" },
        });
        setBoostTotals((prev) => ({
          ...prev,
          [featureId]: Math.max(0, (prev[featureId] ?? 0) - weight),
        }));
      })
      .finally(() => {
        boostInFlightRef.current.delete(featureId);
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

      <FeatureVotingGrid
        loadState={loadState}
        sorted={sorted}
        voteCounts={voteCounts}
        votedIds={votedIds}
        comments={comments}
        boostTotals={boostTotals}
        onToggleVote={handleToggleVote}
        onAddComment={handleAddComment}
        onBoost={handleBoost}
      />

      <CustomFeatureRequest />

      <FeatureVotingSummary totalVotes={sorted.reduce((s, f) => s + f.votes, 0) + realVotesTotal} commentsCount={comments.length} totalBoosts={totalBoosts} loadState={loadState} />
    </SectionWrapper>
  );
}
