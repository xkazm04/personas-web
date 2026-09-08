"use client";

import { MessageCircle } from "lucide-react";

import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { MessageThread } from "@/lib/mock-dashboard-data";

/**
 * One row in the message thread list. Shows the persona, subject, reply count,
 * and last-activity timestamp. Click opens the ThreadDetailModal showing the
 * whole conversation. Mirrors the desktop sub_messages thread row.
 */
export function ThreadRow({
  thread,
  onOpen,
}: {
  thread: MessageThread;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const hasUnread = thread.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
        hasUnread
          ? "border-brand-cyan/25 bg-brand-cyan/[0.05] hover:bg-brand-cyan/[0.08]"
          : "border-glass bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
    >
      <PersonaAvatar color={thread.personaColor} name={thread.persona} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-sm ${
              hasUnread ? "font-semibold text-foreground" : "font-medium text-muted"
            }`}
          >
            {thread.subject}
          </span>
          {thread.replies.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-glass-hover bg-white/[0.04] px-1.5 py-0.5 text-sm text-muted-dark">
              <MessageCircle className="h-3 w-3" />
              {thread.replies.length}
            </span>
          )}
          {hasUnread && (
            <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-1.5 py-0.5 text-sm font-medium text-cyan-300">
              {thread.unreadCount} {t.messagesPage.unread.toLowerCase()}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-dark">
          <span>{thread.persona}</span>
          <span aria-hidden>·</span>
          <span>{relativeTime(thread.latestTimestamp)}</span>
        </div>
      </div>
    </button>
  );
}
