"use client";

import { forwardRef } from "react";
import { MessageCircle } from "lucide-react";

import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { mobileCopy } from "@/i18n/pending/mobile";
import { relativeTime } from "@/lib/format";
import type { MessageThread } from "@/lib/mock-dashboard-data";

/** One thread as a 44 px+ tap target: avatar, wrapped subject, persona and time, replies, unread pill. */
const PhoneThreadRow = forwardRef<
  HTMLButtonElement,
  { thread: MessageThread; onOpen: () => void }
>(function PhoneThreadRow({ thread, onOpen }, ref) {
  const { t } = useTranslation();
  const replies = thread.replies.length;
  const hasUnread = thread.unreadCount > 0;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border p-3 text-left ${
        hasUnread
          ? "border-brand-cyan/25 bg-brand-cyan/[0.05]"
          : "border-glass bg-white/[0.02]"
      }`}
    >
      <PersonaAvatar color={thread.personaColor} name={thread.persona} size="sm" />
      <div className="min-w-0 flex-1">
        <p
          className={`line-clamp-2 text-sm wrap-break-word ${
            hasUnread ? "font-semibold text-foreground" : "font-medium text-muted"
          }`}
        >
          {thread.subject}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-dark">
          {thread.persona} · {relativeTime(thread.latestTimestamp)}
        </p>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        {replies > 0 && (
          <span
            className="inline-flex items-center gap-1 text-sm text-muted-dark tabular-nums"
            aria-label={mobileCopy.messages.replies.replace("{n}", String(replies))}
          >
            <MessageCircle className="h-3 w-3" aria-hidden />
            {replies}
          </span>
        )}
        {hasUnread && (
          <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-1.5 py-0.5 text-sm font-medium text-cyan-300">
            {thread.unreadCount} {t.messagesPage.unread.toLowerCase()}
          </span>
        )}
      </div>
    </button>
  );
});

export default PhoneThreadRow;
