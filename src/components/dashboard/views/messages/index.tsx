"use client";

import { useMemo, useState } from "react";
import { Mail, MailOpen } from "lucide-react";

import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import FilterBar from "@/components/dashboard/FilterBar";
import { ARRIVE, ARRIVE_CAP, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import {
  type FeedbackMessage,
  type MessageThread,
} from "@/lib/mock-dashboard-data";

import { MessagesPagination } from "./messages-page/MessagesPagination";
import { MessageRow } from "./messages-page/MessageRow";
import { MessageRowGhosts } from "./messages-page/MessageRowGhosts";
import { ThreadDetailModal } from "./messages-page/ThreadDetailModal";
import { ThreadRow } from "@/components/dashboard/ThreadRow";
import { useMessagesData } from "./useMessagesData";
import { useThreadReadState } from "./useThreadReadState";
import PhoneMessages from "./phone/PhoneMessages";
import { useIsMobile } from "@/hooks/useIsMobile";

type MessageView = "threads" | "list";

const PAGE_SIZE = 10;

/**
 * `/dashboard/messages`. At phone width it is a thread list with an in-place
 * report reader (a phone layout of this view, not a new route); from 768 px up
 * it is the paginated desk list with the detail modal below. The view is
 * client-only (next/dynamic ssr:false), so choosing by media query cannot
 * mismatch a server render.
 *
 * Loading tiers (docs/features/dashboard/loading-orchestration.md): the header
 * is T0 (never animated), the toolbar T1, the rows T2 (a delayed row-shaped
 * ghost on a cold load, then a cascade keyed by id), and a thread's
 * markdown body T3 (a `<Deferred>` slot inside the reader).
 */
export default function MessagesView() {
  const phone = useIsMobile();
  return phone ? <PhoneMessages /> : <MessagesPage />;
}

function MessagesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [view, setView] = useState<MessageView>("threads");
  const [fetchedAt] = useState(() => Date.now());

  const { threads: baseThreads, loading, error, retry } = useMessagesData();
  const { threads, unreadCount, markThreadRead, markAllRead } = useThreadReadState(baseThreads);

  // Flat (list) view: every message, parent and reply, newest first. Statuses
  // are already resolved on `threads`, so overrides carry through.
  const flatMessages = useMemo<FeedbackMessage[]>(() => {
    const all: FeedbackMessage[] = [];
    for (const thread of threads) all.push(thread.parent, ...thread.replies);
    return all.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [threads]);

  const isList = view === "list";
  const totalItems = isList ? flatMessages.length : threads.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);
  const start = clampedPage * PAGE_SIZE;
  const threadPageItems = threads.slice(start, start + PAGE_SIZE);
  const messagePageItems = flatMessages.slice(start, start + PAGE_SIZE);
  const isEmpty = (isList ? messagePageItems : threadPageItems).length === 0;

  function openThread(thread: MessageThread) {
    setOpenThreadId(thread.id);
    markThreadRead(thread);
  }

  function openMessage(message: FeedbackMessage) {
    const thread = threads.find((th) => th.id === message.threadId);
    if (thread) openThread(thread);
  }

  const openThread_value =
    threads.find((thread) => thread.id === openThreadId) ?? null;

  const pageLabel = t.messagesPage.pagination.page
    .replace("{n}", String(clampedPage + 1))
    .replace("{total}", String(totalPages));

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10">
          <Mail className="h-5 w-5 text-rose-300" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{t.messagesPage.title}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">{t.messagesPage.subtitle}</p>
        </div>
        <StalenessIndicator fetchedAt={fetchedAt} className="mt-2" />
      </div>

      <div className={`${ARRIVE} mb-3 flex items-center gap-2`} style={arriveAt(0)}>
        <span className="rounded-full border border-glass bg-white/[0.03] px-2.5 py-1 text-sm font-medium text-muted tabular-nums">
          {unreadCount} {t.messagesPage.unread.toLowerCase()}
        </span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-2.5 py-1 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <MailOpen className="h-3 w-3" />
            {t.messagesPage.markAllRead}
          </button>
        )}
        <div className="ml-auto">
          <FilterBar
            compact
            active={view}
            onChange={(k) => {
              setView(k as MessageView);
              setPage(0);
            }}
            options={[
              { key: "threads", label: t.messagesPage.viewThreads, count: threads.length },
              { key: "list", label: t.messagesPage.viewList, count: flatMessages.length },
            ]}
          />
        </div>
      </div>

      {error && <DashboardErrorBanner message={error} onRetry={retry} />}

      {loading ? (
        <MessageRowGhosts />
      ) : isEmpty ? (
        <p className={`${ARRIVE} py-12 text-center text-sm text-muted-dark`} style={arriveAt(1)}>
          {t.messagesPage.empty}
        </p>
      ) : (
        // T2 rows: keyed by id, so only rows that are genuinely new (first
        // arrival, a page turn, the view toggle) enter; a read-state change
        // keeps the element and never replays.
        <div className="space-y-2">
          {isList
            ? messagePageItems.map((message, i) => (
                <div key={message.id} className={ARRIVE} style={arriveAt(i + 1)}>
                  <MessageRow message={message} onOpen={() => openMessage(message)} />
                </div>
              ))
            : threadPageItems.map((thread, i) => (
                <div key={thread.id} className={ARRIVE} style={arriveAt(i + 1)}>
                  <ThreadRow thread={thread} onOpen={() => openThread(thread)} />
                </div>
              ))}
        </div>
      )}

      {!loading && !isEmpty && (
        <MessagesPagination
          arriveIndex={ARRIVE_CAP}
          pageLabel={pageLabel}
          isFirstPage={clampedPage === 0}
          isLastPage={clampedPage >= totalPages - 1}
          labels={t.messagesPage.pagination}
          onPrevious={() => setPage(Math.max(0, clampedPage - 1))}
          onNext={() => setPage(Math.min(totalPages - 1, clampedPage + 1))}
        />
      )}

      <ThreadDetailModal
        thread={openThread_value}
        onClose={() => setOpenThreadId(null)}
      />
    </div>
  );
}
