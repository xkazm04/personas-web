"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { trackFeatureVote } from "@/lib/analytics";
import type { Comment, Feature } from "../local-types";
import { localAccentTokens } from "../data";
import CommentThread from "./CommentThread";
import FeatureVoteIllustration from "./FeatureVoteIllustration";
import FeatureBoostButton from "./FeatureBoostButton";

export default function FeatureVoteCard({
  feature,
  initialVoted,
  onToggleVote,
  comments,
  onAddComment,
  boostCount,
  onBoost,
  showBoostUI,
}: {
  feature: Feature;
  initialVoted: boolean;
  onToggleVote: (featureId: string, voted: boolean) => void;
  comments: Comment[];
  onAddComment: (featureId: string, text: string, parentId: string | null) => void;
  boostCount: number;
  onBoost: (featureId: string, tier: number) => void;
  showBoostUI: boolean;
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(feature.votes + (initialVoted ? 1 : 0));
  const [showTiers, setShowTiers] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setVoted(initialVoted);
      setCount(feature.votes + (initialVoted ? 1 : 0));
    });
  }, [initialVoted, feature.votes]);

  const t = localAccentTokens[feature.accent];
  const rgba = (a: number) => `rgba(${t.r},${t.g},${t.b},${a})`;
  const commentCount = comments.filter((c) => c.featureId === feature.id).length;

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackFeatureVote(feature.id, voted ? "undo" : "upvote");
    const newVoted = !voted;
    setVoted(newVoted);
    setCount((c) => c + (newVoted ? 1 : -1));
    onToggleVote(feature.id, newVoted);
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.35, ease: "easeOut" } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-white/[0.1] hover:shadow-[0_8px_60px_rgba(0,0,0,0.35)]"
    >
      <FeatureVoteIllustration
        feature={feature}
        rgba={rgba}
        imgLoaded={imgLoaded}
        onImgLoad={() => setImgLoaded(true)}
      />

      <div
        className="relative z-10 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${rgba(0.2)}, transparent)`,
          }}
        />

        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleVote}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-base font-medium transition-all duration-300 cursor-pointer shrink-0"
            style={
              voted
                ? {
                    backgroundColor: rgba(0.15),
                    borderColor: rgba(0.3),
                    color: rgba(1),
                    boxShadow: `0 0 20px ${rgba(0.2)}`,
                  }
                : {
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.06)",
                    color: "var(--muted-dark)",
                  }
            }
          >
            <ChevronUp
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                voted ? "scale-110" : ""
              }`}
            />
            <span className="tabular-nums">{count}</span>
          </button>

          <h3 className="text-base font-semibold leading-tight flex-1 text-center">
            {feature.title}
          </h3>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComments((v) => !v);
              if (!showComments) setExpanded(true);
            }}
            className="flex items-center gap-1 rounded-full border px-2 py-1 text-base font-medium transition-all duration-300 cursor-pointer shrink-0"
            style={
              showComments
                ? {
                    borderColor: rgba(0.2),
                    backgroundColor: rgba(0.08),
                    color: rgba(0.8),
                  }
                : {
                    borderColor: "rgba(255,255,255,0.06)",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    color: "var(--muted-dark)",
                  }
            }
          >
            <MessageCircle className="h-3 w-3" />
            {commentCount > 0 && (
              <span className="tabular-nums">{commentCount}</span>
            )}
          </button>

          {showBoostUI && (
            <FeatureBoostButton
              featureId={feature.id}
              boostCount={boostCount}
              showTiers={showTiers}
              setShowTiers={setShowTiers}
              onBoost={onBoost}
              rgba={rgba}
            />
          )}

          <ChevronDown
            className={`h-4 w-4 text-muted-dark shrink-0 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div
                  className="h-px mb-3 opacity-30"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${rgba(0.15)}, transparent)`,
                  }}
                />
                <p className="text-base leading-relaxed text-muted-dark">
                  {feature.description}
                </p>

                <AnimatePresence>
                  {showComments && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className="h-px mt-3 mb-3 opacity-30"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${rgba(0.15)}, transparent)`,
                        }}
                      />
                      <div className="flex items-center gap-1.5 mb-2">
                        <MessageCircle className="h-3 w-3 text-muted-dark/60" />
                        <span className="text-base font-semibold text-muted-dark/60 font-mono tracking-wider uppercase">
                          Discussion
                        </span>
                      </div>
                      <CommentThread
                        featureId={feature.id}
                        comments={comments}
                        onAddComment={onAddComment}
                        accentRgba={rgba}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
