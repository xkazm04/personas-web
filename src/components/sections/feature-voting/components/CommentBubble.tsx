"use client";

import { Reply } from "lucide-react";
import type { Comment } from "../local-types";
import { formatTimeAgo } from "../data";

export default function CommentBubble({
  comment,
  accentRgba,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  accentRgba: (a: number) => string;
  onReply: (parentId: string) => void;
  depth?: number;
}) {
  return (
    <div className={depth > 0 ? "ml-4 pl-3 border-l border-glass" : ""}>
      <div className="py-1.5">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-base font-semibold font-mono tracking-wide"
            style={{ color: accentRgba(0.7) }}
          >
            {comment.author}
          </span>
          <span className="text-base text-muted-dark/60 font-mono">
            {formatTimeAgo(comment.timestamp)}
          </span>
        </div>
        <p className="text-base leading-relaxed text-muted-dark">{comment.text}</p>
        <button
          onClick={() => onReply(comment.id)}
          className="mt-1 flex items-center gap-1 text-base text-muted-dark/60 hover:text-muted-dark/70 transition-colors cursor-pointer"
        >
          <Reply className="h-2.5 w-2.5" />
          Reply
        </button>
      </div>
    </div>
  );
}
