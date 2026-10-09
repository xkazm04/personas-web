"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MailOpen } from "lucide-react";

import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import { mobileCopy } from "@/i18n/pending/mobile";
import type { MessageThread } from "@/lib/mock-dashboard-data";
import { useMessagesData } from "../useMessagesData";
import { useThreadReadState } from "../useThreadReadState";
import { MessageRowGhosts } from "../messages-page/MessageRowGhosts";
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
 *
 * Loading tiers: the title is T0, the unread toolbar T1, the rows T2 (a
 * delayed row-shaped ghost on a cold load, then a cascade keyed by thread id;
 * a "Show more" batch cascades from its own first row).
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
        <div className={`${ARRIVE} flex items-center gap-2`} style={arriveAt(0)}>
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
          <MessageRowGhosts />
        ) : threads.length === 0 ? (
          <p className={`${ARRIVE} py-12 text-center text-sm text-muted-dark`} style={arriveAt(1)}>
            {t.messagesPage.empty}
          </p>
        ) : (
          <div className="space-y-2">
            {threads.slice(0, shown).map((thread, i) => (
              // Index from the latest batch's first row: earlier rows have
              // already arrived (kept by key), so only the new batch cascades.
              <div key={thread.id} className={ARRIVE} style={arriveAt(i - (shown - STEP) + 1)}>
                <PhoneThreadRow
                  thread={thread}
                  ref={(el) => {
                    if (el) rows.current.set(thread.id, el);
                    else rows.current.delete(thread.id);
                  }}
                  onOpen={() => openThread(thread)}
                />
              </div>
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
