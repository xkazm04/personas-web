"use client";

import { CornerDownRight } from "lucide-react";

import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { FeedbackMessage } from "@/lib/mock-dashboard-data";

/**
 * One row in the flat (list) message view — a single message, parent or reply.
 * Click opens the parent thread in the ThreadDetailModal. The web counterpart
 * to the desktop sub_messages flat-list row (vs the grouped ThreadRow).
 */
export function MessageRow({
  message,
  onOpen,
}: {
  message: FeedbackMessage;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const unread = message.status === "unread";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
        unread
          ? "border-brand-cyan/25 bg-brand-cyan/[0.05] hover:bg-brand-cyan/[0.08]"
          : "border-glass bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
    >
      <PersonaAvatar color={message.personaColor} name={message.persona} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {!message.isThreadParent && (
            <CornerDownRight className="h-3 w-3 flex-shrink-0 text-muted-dark" aria-label={t.messagesPage.reply} />
          )}
          <span className={`truncate text-sm ${unread ? "font-semibold text-foreground" : "font-medium text-muted"}`}>
            {message.subject}
          </span>
          {unread && (
            <span className="flex-shrink-0 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-1.5 py-0.5 text-sm font-medium text-cyan-300">
              {t.messagesPage.unread.toLowerCase()}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-dark">
          <span>{message.persona}</span>
          <span aria-hidden>·</span>
          <span>{relativeTime(message.timestamp)}</span>
        </div>
      </div>
    </button>
  );
}
