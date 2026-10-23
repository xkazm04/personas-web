"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { CornerDownRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { Comment, WriteFailure } from "../local-types";
import CommentBubble from "./CommentBubble";
import CommentInput from "./CommentInput";

export default function CommentThread({
  featureId,
  comments,
  onAddComment,
  accentRgba,
  restore,
}: {
  featureId: string;
  comments: Comment[];
  onAddComment: (featureId: string, text: string, parentId: string | null) => void;
  accentRgba: (a: number) => string;
  /** A refused comment: its text goes back to the input it came from. */
  restore?: WriteFailure;
}) {
  const reduced = useStillMotion();
  const { t } = useTranslation();
  const vt = t.featureVoting;
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  // A refused reply reopens its reply box, which then takes the text back.
  const [seenRestore, setSeenRestore] = useState(restore?.seq);
  if (restore?.seq !== seenRestore) {
    setSeenRestore(restore?.seq);
    if (restore?.parentId) setReplyingTo(restore.parentId);
  }
  const draftFor = (parentId: string | null) => (restore && (restore.parentId ?? null) === parentId && restore.text !== undefined ? { text: restore.text, seq: restore.seq } : undefined);
  const featureComments = comments.filter((c) => c.featureId === featureId);
  const topLevel = featureComments.filter((c) => c.parentId === null);
  const replies = featureComments.filter((c) => c.parentId !== null);

  const getReplies = (parentId: string) =>
    replies.filter((c) => c.parentId === parentId).sort((a, b) => a.timestamp - b.timestamp);

  const handleReply = (parentId: string) => {
    setReplyingTo((prev) => (prev === parentId ? null : parentId));
  };

  return (
    <div className="space-y-1">
      {topLevel.length === 0 && (
        <p className="text-base text-muted-dark/60 font-mono py-1">
          {vt.noComments}
        </p>
      )}
      {topLevel
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((comment) => (
          <div key={comment.id}>
            <CommentBubble
              comment={comment}
              accentRgba={accentRgba}
              onReply={handleReply}
            />
            {getReplies(comment.id).map((reply) => (
              <CommentBubble
                key={reply.id}
                comment={reply}
                accentRgba={accentRgba}
                depth={1}
              />
            ))}
            <AnimatePresence>
              {replyingTo === comment.id && (
                <motion.div
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.2 }}
                  className="overflow-hidden ms-[clamp(12px,2vw,16px)] ps-3 border-s border-glass"
                >
                  <div className="flex items-center gap-1 mb-1.5 mt-1">
                    <CornerDownRight className="h-2.5 w-2.5 text-muted-dark/60" />
                    <span className="text-base text-muted-dark/60 font-mono">
                      {vt.replying}
                    </span>
                  </div>
                  <CommentInput
                    onSubmit={(text) => {
                      onAddComment(featureId, text, comment.id);
                      setReplyingTo(null);
                    }}
                    placeholder={vt.writeReplyPlaceholder}
                    submitLabel={vt.sendCommentAria}
                    accentRgba={accentRgba}
                    autoFocus
                    restore={draftFor(comment.id)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

      <div className="pt-2">
        <CommentInput
          onSubmit={(text) => onAddComment(featureId, text, null)}
          placeholder={vt.addCommentPlaceholder}
          submitLabel={vt.sendCommentAria}
          accentRgba={accentRgba}
          restore={draftFor(null)}
        />
      </div>
    </div>
  );
}
