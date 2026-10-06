"use client";

import { MessageCircle } from "lucide-react";

import { MarkdownReport } from "@/components/dashboard/MarkdownReport";
import { Modal } from "@/components/dashboard/Modal";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { relativeTime } from "@/lib/format";
import type { FeedbackMessage, MessageThread } from "@/lib/mock-dashboard-data";

/**
 * Modal showing a whole conversation: the parent message + every reply
 * in chronological order, each rendered as its own markdown article.
 * Mirrors the desktop sub_messages thread view in a single modal so the
 * full context is visible at once.
 */
export function ThreadDetailModal({
  thread,
  onClose,
}: {
  thread: MessageThread | null;
  onClose: () => void;
}) {
  const replyCount = thread?.replies.length ?? 0;

  return (
    <Modal
      open={thread !== null}
      onClose={onClose}
      ariaLabel={thread?.subject}
      maxWidth="max-w-3xl"
      title={thread?.subject}
      subtitle={
        thread ? (
          <span className="inline-flex items-center gap-2">
            <span>{thread.persona}</span>
            <span aria-hidden>·</span>
            <span>{relativeTime(thread.latestTimestamp)}</span>
            {replyCount > 0 && (
              <>
                <span aria-hidden>·</span>
                <span
                  className="inline-flex items-center gap-1 tabular-nums"
                  aria-label={`${replyCount} replies`}
                >
                  <MessageCircle className="h-3 w-3" aria-hidden />
                  {replyCount}
                </span>
              </>
            )}
          </span>
        ) : undefined
      }
    >
      {thread && (
        <div className="space-y-4">
          <ConversationMessage message={thread.parent} />
          {thread.replies.map((reply) => (
            <ConversationMessage key={reply.id} message={reply} isReply />
          ))}
        </div>
      )}
    </Modal>
  );
}

function ConversationMessage({
  message,
  isReply = false,
}: {
  message: FeedbackMessage;
  isReply?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border bg-white/[0.02] ${
        isReply ? "border-glass ml-4 sm:ml-8" : "border-glass-hover"
      }`}
    >
      <header className="flex items-center gap-2.5 border-b border-glass px-4 py-2.5">
        <PersonaAvatar
          color={message.personaColor}
          name={message.persona}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {message.persona}
          </p>
          <p className="text-sm text-muted-dark">
            {relativeTime(message.timestamp)}
          </p>
        </div>
        {message.status === "unread" && (
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400"
            aria-hidden="true"
          />
        )}
      </header>
      <div className="px-4 py-3.5">
        <MarkdownReport content={message.body} />
      </div>
    </article>
  );
}
