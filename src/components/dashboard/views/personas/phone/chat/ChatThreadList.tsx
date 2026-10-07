"use client";

import { ChevronRight, Loader2, MessageSquarePlus, Pin } from "lucide-react";
import { useI18nStore } from "@/stores/i18nStore";
import { formatDue } from "@/lib/review-sla";
import type { ChatSession } from "@/lib/chat/chatModel";
import type { ListStatus } from "@/stores/chatStore";
import { mobileCopy } from "@/i18n/pending/mobile";

interface Props {
  sessions: readonly ChatSession[];
  status: ListStatus;
  /** The reachability clock: "updated 3 hours ago" is judged against it. */
  now: number;
  onOpen: (session: ChatSession) => void;
  onNew: () => void;
  onReload: () => void;
}

const ROW =
  "flex min-h-[44px] w-full items-center gap-3 rounded-xl border border-glass bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-brand-cyan";

/**
 * The threads of one chat (Athena's, or one persona's), pinned first then by
 * latest activity, and **New chat**. Chat sync is a desktop opt-in, off by
 * default (PLAN M19), so an empty list says how to turn it on instead of
 * looking broken.
 */
export default function ChatThreadList({ sessions, status, now, onOpen, onNew, onReload }: Props) {
  const copy = mobileCopy.chat;
  const language = useI18nStore((s) => s.language);

  let body: React.ReactNode;
  if (status.error && sessions.length === 0) {
    body = (
      <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
        <p>{copy.error}</p>
        <button
          type="button"
          onClick={onReload}
          className="mt-2 inline-flex min-h-[44px] items-center rounded-xl border border-glass-hover px-4 text-base font-medium text-foreground"
        >
          {copy.retry}
        </button>
      </div>
    );
  } else if (!status.loaded && sessions.length === 0) {
    body = (
      <p className="flex items-center gap-2 text-sm text-muted-dark" aria-busy="true">
        <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
        {copy.loading}
      </p>
    );
  } else if (sessions.length === 0) {
    body = (
      <section data-chat-empty aria-labelledby="chat-empty" className="rounded-2xl border border-glass bg-white/[0.02] p-4">
        <h3 id="chat-empty" className="text-base font-semibold text-foreground">
          {copy.emptyTitle}
        </h3>
        <p className="mt-1 text-sm text-muted">{copy.emptyBody}</p>
      </section>
    );
  } else {
    body = (
      <ul aria-label={copy.threadsLabel} className="flex flex-col gap-2">
        {sessions.map((s) => {
          const updated = Date.parse(s.updatedAt);
          const ago = Number.isFinite(updated) ? formatDue(Math.min(-1, updated - now), language) : null;
          return (
            <li key={`${s.deviceId}|${s.sessionId}`}>
              <button type="button" data-chat-thread={s.sessionId} onClick={() => onOpen(s)} className={ROW}>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    {s.pinned && (
                      <>
                        <Pin aria-hidden className="h-3.5 w-3.5 flex-none text-brand-cyan" />
                        <span className="sr-only">{copy.pinned}: </span>
                      </>
                    )}
                    <span className="truncate text-base font-medium text-foreground">{s.title?.trim() || copy.untitled}</span>
                  </span>
                  {ago && <span className="block truncate text-sm text-muted-dark">{copy.updated.replace("{ago}", ago)}</span>}
                </span>
                <ChevronRight aria-hidden className="h-4 w-4 flex-none text-muted-dark" />
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain py-1">
      <button
        type="button"
        data-chat-action="new"
        onClick={onNew}
        className="inline-flex min-h-[44px] flex-none items-center justify-center gap-2 rounded-xl bg-brand-cyan/15 px-4 text-base font-medium text-foreground transition-colors hover:bg-brand-cyan/25 focus-visible:outline-2 focus-visible:outline-brand-cyan"
      >
        <MessageSquarePlus aria-hidden className="h-4 w-4 text-brand-cyan" />
        {copy.newChat}
      </button>
      {body}
    </div>
  );
}
