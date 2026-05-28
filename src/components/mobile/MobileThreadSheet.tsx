"use client";

import { MessageCircle } from "lucide-react";

import MobileSheet from "@/components/mobile/MobileSheet";
import { MarkdownReport } from "@/components/dashboard/MarkdownReport";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { relativeTime } from "@/lib/format";
import type { FeedbackMessage, MessageThread } from "@/lib/mock-dashboard-data";

/**
 * Mobile message-thread detail rendered in a bottom sheet (replaces the desktop
 * centered ThreadDetailModal on `/m`). Shows the parent message + every reply
 * in order, each as its own markdown article.
 */
export default function MobileThreadSheet({
  thread,
  onClose,
}: {
  thread: MessageThread | null;
  onClose: () => void;
}) {
  const replyCount = thread?.replies.length ?? 0;

  return (
    <MobileSheet
      open={thread !== null}
      onClose={onClose}
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
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <MessageCircle className="h-3 w-3" />
                  {replyCount}
                </span>
              </>
            )}
          </span>
        ) : undefined
      }
    >
      {thread && (
        <div className="space-y-3 pb-2">
          <ConversationMessage message={thread.parent} />
          {thread.replies.map((reply) => (
            <ConversationMessage key={reply.id} message={reply} isReply />
          ))}
        </div>
      )}
    </MobileSheet>
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
      className={`rounded-2xl border bg-white/[0.02] ${
        isReply ? "ml-3 border-glass" : "border-glass-hover"
      }`}
    >
      <header className="flex items-center gap-2.5 border-b border-glass px-3.5 py-2.5">
        <PersonaAvatar color={message.personaColor} name={message.persona} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {message.persona}
          </p>
          <p className="text-[13px] text-muted-dark">
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
      <div className="px-3.5 py-3">
        <MarkdownReport content={message.body} />
      </div>
    </article>
  );
}
