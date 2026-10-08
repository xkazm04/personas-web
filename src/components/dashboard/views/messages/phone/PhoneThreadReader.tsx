"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

import { MarkdownReport } from "@/components/dashboard/MarkdownReport";
import Deferred from "@/components/dashboard/arrival/Deferred";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { mobileCopy } from "@/i18n/pending/mobile";
import { relativeTime } from "@/lib/format";
import type { FeedbackMessage, MessageThread } from "@/lib/mock-dashboard-data";

/**
 * A whole conversation in place of the list: Back, the subject, then the
 * parent and each reply as an article. `message.payload` (synced metadata with
 * desktop file paths) is deliberately never rendered here.
 *
 * Back, the subject and the meta line are chrome and paint at once (focus
 * lands on the heading); the markdown-rendered articles are the deep (T3)
 * body and mount in the view's arrival queue below them.
 */
/** One article's settled minimum (header + padding + a couple of lines): a floor, not a size. */
const THREAD_BODY_FLOOR = 140;

export default function PhoneThreadReader({
  thread,
  onBack,
}: {
  thread: MessageThread;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-5 pb-28">
      <button
        type="button"
        onClick={onBack}
        aria-label={mobileCopy.messages.backLabel}
        className="flex min-h-[44px] w-fit items-center gap-2 rounded-lg border border-glass-hover bg-white/[0.03] px-3 text-sm font-medium text-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t.messagesPage.title}
      </button>
      <div>
        <h2
          ref={heading}
          tabIndex={-1}
          className="text-xl font-bold tracking-tight text-foreground wrap-break-word outline-none"
        >
          {thread.subject}
        </h2>
        <p className="mt-1 text-sm text-muted-dark">
          {thread.persona} · {relativeTime(thread.latestTimestamp)}
        </p>
      </div>
      <Deferred minHeight={THREAD_BODY_FLOOR} order={0} className="flex flex-col gap-4">
        <ReaderMessage message={thread.parent} />
        {thread.replies.map((reply) => (
          <ReaderMessage key={reply.id} message={reply} isReply />
        ))}
      </Deferred>
    </div>
  );
}

function ReaderMessage({
  message,
  isReply = false,
}: {
  message: FeedbackMessage;
  isReply?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border bg-white/[0.02] ${
        isReply ? "border-glass" : "border-glass-hover"
      }`}
    >
      <header className="flex items-center gap-2.5 border-b border-glass px-3 py-2.5">
        <PersonaAvatar color={message.personaColor} name={message.persona} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{message.persona}</p>
          <p className="text-sm text-muted-dark">{relativeTime(message.timestamp)}</p>
        </div>
      </header>
      <div className="min-w-0 px-3 py-3.5 wrap-break-word">
        <MarkdownReport content={message.body} />
      </div>
    </article>
  );
}
