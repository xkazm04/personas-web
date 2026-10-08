"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MailOpen } from "lucide-react";

import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import { useTranslation } from "@/i18n/useTranslation";
import { mobileCopy } from "@/i18n/pending/mobile";
import type { MessageThread } from "@/lib/mock-dashboard-data";
import { useMessagesData } from "../useMessagesData";
import { useThreadReadState } from "../useThreadReadState";
import PhoneThreadReader from "./PhoneThreadReader";
import PhoneThreadRow from "./PhoneThreadRow";

const STEP = 10;

/** Nearest scrollable ancestor (the dashboard shell), else null for the window. */
function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let p = el?.parentElement ?? null; p; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}

/**
 * `/dashboard/messages` at phone width: threads newest first, 10 at a time,
 * and a tap reads the thread in place of the list. The list stays mounted
 * (hidden) while reading so Back restores the row, the "Show more" depth and
 * the scroll position.
 */
export default function PhoneMessages() {
  const { t } = useTranslation();
  const copy = mobileCopy.messages;
  const { threads: baseThreads, loading, error, retry } = useMessagesData();
  const { threads, unreadCount, markThreadRead, markAllRead } = useThreadReadState(baseThreads);
  const [shown, setShown] = useState(STEP);
  const [openId, setOpenId] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const scrollTop = useRef(0);
  const lastOpened = useRef<string | null>(null);

  const open = openId ? (threads.find((th) => th.id === openId) ?? null) : null;

  // Back: put the scroll position and focus where the reader was opened from.
  useEffect(() => {
    if (open) return;
    const id = lastOpened.current;
    if (!id) return;
    lastOpened.current = null;
    const sp = scrollParent(root.current);
    if (sp) sp.scrollTop = scrollTop.current;
    else window.scrollTo(0, scrollTop.current);
    rows.current.get(id)?.focus({ preventScroll: true });
  }, [open]);

  function openThread(thread: MessageThread) {
    const sp = scrollParent(root.current);
    scrollTop.current = sp ? sp.scrollTop : window.scrollY;
    lastOpened.current = thread.id;
    setOpenId(thread.id);
    markThreadRead(thread);
    if (sp) sp.scrollTop = 0;
    else window.scrollTo(0, 0);
  }

  return (
    <div ref={root}>
      {open && <PhoneThreadReader thread={open} onBack={() => setOpenId(null)} />}
      <div
        hidden={open !== null}
        className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-5 pb-28"
      >
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Mail className="h-5 w-5 text-rose-300" aria-hidden />
          {t.messagesPage.title}
        </h1>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-glass bg-white/[0.03] px-2.5 py-1 text-sm font-medium text-muted tabular-nums">
            {unreadCount} {t.messagesPage.unread.toLowerCase()}
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-glass-hover bg-white/[0.03] px-3 text-sm font-medium text-muted"
            >
              <MailOpen className="h-4 w-4" aria-hidden />
              {t.messagesPage.markAllRead}
            </button>
          )}
        </div>

        {error && <DashboardErrorBanner message={error} onRetry={retry} />}

        {loading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} lines={1} />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-dark">{t.messagesPage.empty}</p>
        ) : (
          <div className="space-y-2">
            {threads.slice(0, shown).map((thread) => (
              <PhoneThreadRow
                key={thread.id}
                thread={thread}
                ref={(el) => {
                  if (el) rows.current.set(thread.id, el);
                  else rows.current.delete(thread.id);
                }}
                onOpen={() => openThread(thread)}
              />
            ))}
            {threads.length > shown && (
              <button
                type="button"
                onClick={() => setShown((n) => n + STEP)}
                className="min-h-[44px] w-full rounded-xl border border-glass-hover bg-white/[0.03] px-3 text-sm font-medium text-muted"
              >
                {copy.showMore}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
