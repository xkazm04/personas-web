"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronUp, MessageCircle } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { trackFeatureVote } from "@/lib/analytics";
import { useTranslation } from "@/i18n/useTranslation";
import type { Comment, Feature } from "../local-types";
import { localAccentTokens } from "../data";
import CommentThread from "./CommentThread";
import FeatureVoteIllustration from "./FeatureVoteIllustration";
import FeatureBoostButton from "./FeatureBoostButton";

export default function FeatureVoteCard({
  feature,
  apiCount,
  initialVoted,
  onToggleVote,
  comments,
  onAddComment,
  boostCount,
  onBoost,
  showBoostUI,
}: {
  feature: Feature;
  /** Live vote count from /api/votes for this feature (excludes the marketing seed). */
  apiCount: number;
  initialVoted: boolean;
  onToggleVote: (featureId: string, voted: boolean) => void;
  comments: Comment[];
  onAddComment: (featureId: string, text: string, parentId: string | null) => void;
  boostCount: number;
  onBoost: (featureId: string, tier: number) => void;
  showBoostUI: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const { t } = useTranslation();
  const vt = t.featureVoting;
  const copy = vt.features[feature.id];
  const [voted, setVoted] = useState(initialVoted);
  const [showTiers, setShowTiers] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Prev-state reset pattern: when the parent re-syncs the voted flag from
  // the API response, mirror it locally so the toggle button reflects truth.
  const [prevInitialVoted, setPrevInitialVoted] = useState(initialVoted);
  if (initialVoted !== prevInitialVoted) {
    setPrevInitialVoted(initialVoted);
    setVoted(initialVoted);
  }

  // apiCount already reflects every voter currently in the DB, including
  // this user when initialVoted is true. The total displayed number is
  // the marketing seed + the live API count.
  const count = feature.votes + apiCount;

  const accentTok = localAccentTokens[feature.accent];
  const rgba = (a: number) => `rgba(${accentTok.r},${accentTok.g},${accentTok.b},${a})`;
  const commentCount = comments.filter((c) => c.featureId === feature.id).length;

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackFeatureVote(feature.id, voted ? "undo" : "upvote");
    const newVoted = !voted;
    setVoted(newVoted);
    onToggleVote(feature.id, newVoted);
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={reduced ? undefined : { y: -4, transition: { duration: 0.35, ease: "easeOut" } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-glass bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-glass-hover hover:shadow-[0_8px_60px_rgba(0,0,0,0.35)]"
    >
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-lg font-semibold leading-snug">{copy.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-dark line-clamp-2">{copy.description}</p>
      </div>

      <FeatureVoteIllustration
        feature={feature}
        title={copy.title}
        rgba={rgba}
        imgLoaded={imgLoaded}
        onImgLoad={() => setImgLoaded(true)}
      />

      <div className="relative z-10">
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${rgba(0.2)}, transparent)`,
          }}
        />

        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleVote}
            aria-label={vt.voteAria.replace("{feature}", copy.title)}
            aria-pressed={voted}
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
            <ChevronUp className={`h-3.5 w-3.5 transition-transform duration-300 ${voted ? "scale-110" : ""}`} />
            <span className="tabular-nums">{count}</span>
          </button>

          <span className="flex-1" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComments((v) => !v);
            }}
            aria-label={vt.commentsToggleAria.replace("{feature}", copy.title)}
            aria-expanded={showComments}
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
            {commentCount > 0 && <span className="tabular-nums">{commentCount}</span>}
          </button>

          {showBoostUI && (
            <FeatureBoostButton
              featureId={feature.id}
              featureTitle={copy.title}
              boostCount={boostCount}
              showTiers={showTiers}
              setShowTiers={setShowTiers}
              onBoost={onBoost}
              rgba={rgba}
            />
          )}
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div
                  className="comment-divider mb-3"
                  style={{ color: rgba(0.15) }}
                />
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageCircle className="h-3 w-3 text-muted-dark/60" />
                  <span className="text-base font-semibold text-muted-dark/60 font-mono tracking-wider uppercase">
                    {vt.discussion}
                  </span>
                </div>
                <CommentThread
                  featureId={feature.id}
                  comments={comments}
                  onAddComment={onAddComment}
                  accentRgba={rgba}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
