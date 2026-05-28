"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailOpen } from "lucide-react";

import GradientText from "@/components/GradientText";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  type MessageThread,
  type MessageStatus,
} from "@/lib/mock-dashboard-data";

import { MessagesPagination } from "./messages-page/MessagesPagination";
import { ThreadDetailModal } from "./messages-page/ThreadDetailModal";
import { ThreadRow } from "./messages-page/ThreadRow";
import { useMessagesData } from "./useMessagesData";

const PAGE_SIZE = 10;

export default function MessagesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  // Per-message read state (keyed by message id) layered over the mock fixture
  // so "mark all read" / opening a thread can flip threads to read locally.
  const [overrides, setOverrides] = useState<Map<string, MessageStatus>>(
    () => new Map(),
  );
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [fetchedAt] = useState(() => Date.now());

  const { threads: baseThreads } = useMessagesData();

  const threads = useMemo<MessageThread[]>(() => {
    return baseThreads.map((thread) => {
      const applyStatus = (status: MessageStatus, id: string): MessageStatus =>
        overrides.get(id) ?? status;
      const parent = {
        ...thread.parent,
        status: applyStatus(thread.parent.status, thread.parent.id),
      };
      const replies = thread.replies.map((r) => ({
        ...r,
        status: applyStatus(r.status, r.id),
      }));
      const unreadCount = [parent, ...replies].filter(
        (m) => m.status === "unread",
      ).length;
      return { ...thread, parent, replies, unreadCount };
    }).sort(
      (a, b) =>
        new Date(b.latestTimestamp).getTime() -
        new Date(a.latestTimestamp).getTime(),
    );
  }, [baseThreads, overrides]);

  const totalPages = Math.max(1, Math.ceil(threads.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageItems = threads.slice(
    clampedPage * PAGE_SIZE,
    (clampedPage + 1) * PAGE_SIZE,
  );

  const unreadCount = useMemo(
    () => threads.reduce((sum, t) => sum + t.unreadCount, 0),
    [threads],
  );

  function markThreadRead(thread: MessageThread) {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.set(thread.parent.id, "read");
      for (const r of thread.replies) next.set(r.id, "read");
      return next;
    });
  }

  function markAllRead() {
    setOverrides((prev) => {
      const next = new Map(prev);
      for (const thread of threads) {
        next.set(thread.parent.id, "read");
        for (const r of thread.replies) next.set(r.id, "read");
      }
      return next;
    });
  }

  function openThread(thread: MessageThread) {
    setOpenThreadId(thread.id);
    markThreadRead(thread);
  }

  const openThread_value =
    threads.find((thread) => thread.id === openThreadId) ?? null;

  const pageLabel = t.messagesPage.pagination.page
    .replace("{n}", String(clampedPage + 1))
    .replace("{total}", String(totalPages));

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6 flex items-start gap-3">
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
      </motion.div>

      <motion.div variants={fadeUp} className="mb-3 flex items-center gap-2">
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
      </motion.div>

      {pageItems.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-dark">{t.messagesPage.empty}</p>
      ) : (
        <motion.div variants={fadeUp} className="space-y-2">
          {pageItems.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              onOpen={() => openThread(thread)}
            />
          ))}
        </motion.div>
      )}

      <MessagesPagination
        pageLabel={pageLabel}
        isFirstPage={clampedPage === 0}
        isLastPage={clampedPage >= totalPages - 1}
        labels={t.messagesPage.pagination}
        onPrevious={() => setPage((value) => Math.max(0, value - 1))}
        onNext={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
      />

      <ThreadDetailModal
        thread={openThread_value}
        onClose={() => setOpenThreadId(null)}
      />
    </motion.div>
  );
}
