"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { trackFeatureComment } from "@/lib/analytics";
import type { Comment } from "./local-types";
import {
  KOFI_USERNAME,
  features,
  getOrCreateAuthor,
  readBoosts,
  readComments,
  readVotedIds,
  writeBoosts,
  writeComments,
  writeVotedIds,
} from "./data";
import FeatureVoteCard from "./components/FeatureVoteCard";
import CustomFeatureRequest from "./components/CustomFeatureRequest";

export default function FeatureVoting() {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [boosts, setBoosts] = useState<Record<string, number>>({});

  useEffect(() => {
    queueMicrotask(() => {
      setVotedIds(readVotedIds());
      setComments(readComments());
      setBoosts(readBoosts());
    });
  }, []);

  const handleToggleVote = useCallback((featureId: string, voted: boolean) => {
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (voted) next.add(featureId);
      else next.delete(featureId);
      writeVotedIds(next);
      return next;
    });
  }, []);

  const handleAddComment = useCallback(
    (featureId: string, text: string, parentId: string | null) => {
      const author = getOrCreateAuthor();
      const newComment: Comment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        featureId,
        parentId,
        text,
        author,
        timestamp: Date.now(),
      };
      trackFeatureComment(featureId, parentId ? "reply" : "add");
      setComments((prev) => {
        const next = [...prev, newComment];
        writeComments(next);
        return next;
      });
    },
    []
  );

  const handleBoost = useCallback((featureId: string, weight: number) => {
    setBoosts((prev) => {
      const next = { ...prev, [featureId]: (prev[featureId] ?? 0) + weight };
      writeBoosts(next);
      return next;
    });
  }, []);

  const totalBoosts = Object.values(boosts).reduce((s, v) => s + v, 0);
  const sorted = [...features].sort((a, b) => b.votes - a.votes);

  return (
    <SectionWrapper id="vote">
      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-base font-semibold tracking-widest uppercase text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono mb-6">
          Community
        </span>
        <span className="ml-2 inline-block rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-base font-mono tracking-wider uppercase text-muted-dark/60 mb-6">
          Demo
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl drop-shadow-md">
          Vote for{" "}
          <GradientText className="drop-shadow-lg">what&apos;s next</GradientText>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Help us prioritize. Pick the features that matter most to you and shape the
          future of Personas.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-6 sm:grid-cols-2"
      >
        {sorted.map((feature) => (
          <FeatureVoteCard
            key={feature.id}
            feature={feature}
            initialVoted={votedIds.has(feature.id)}
            onToggleVote={handleToggleVote}
            comments={comments}
            onAddComment={handleAddComment}
            boostCount={boosts[feature.id] ?? 0}
            onBoost={handleBoost}
            showBoostUI={!!KOFI_USERNAME}
          />
        ))}
      </motion.div>

      <CustomFeatureRequest />

      <motion.div variants={fadeUp} className="mt-8 text-center">
        <p className="text-base font-mono text-muted-dark tracking-wide">
          {(sorted.reduce((s, f) => s + f.votes, 0) + votedIds.size).toLocaleString()}{" "}
          total votes&ensp;·&ensp;{comments.length} comment
          {comments.length !== 1 ? "s" : ""}
          {totalBoosts > 0 && (
            <>
              &ensp;·&ensp;{totalBoosts} boost{totalBoosts !== 1 ? "s" : ""}
            </>
          )}
          &ensp;·&ensp;Stored in your browser
        </p>
        <p className="mt-1.5 text-base text-muted-dark/60 font-mono tracking-wide">
          Demo mode &mdash; votes and comments are saved locally and are not shared with
          other users
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
