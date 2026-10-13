"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import type { Comment } from "../local-types";
import CommentThread from "./CommentThread";

/** The collapsible discussion under a feature card. */
export default function FeatureCommentsPanel({
  open,
  featureId,
  comments,
  onAddComment,
  heading,
  rgba,
}: {
  open: boolean;
  featureId: string;
  comments: Comment[];
  onAddComment: (featureId: string, text: string, parentId: string | null) => void;
  heading: string;
  rgba: (alpha: number) => string;
}) {
  const reduced = useStillMotion();

  return (
    <AnimatePresence>
      {open && (
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
                {heading}
              </span>
            </div>
            <CommentThread
              featureId={featureId}
              comments={comments}
              onAddComment={onAddComment}
              accentRgba={rgba}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
