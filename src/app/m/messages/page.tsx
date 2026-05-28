"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MailOpen } from "lucide-react";

import { ThreadRow } from "@/app/dashboard/messages/messages-page/ThreadRow";
import { ThreadDetailModal } from "@/app/dashboard/messages/messages-page/ThreadDetailModal";
import {
  MOCK_MESSAGE_THREADS,
  type MessageThread,
  type MessageStatus,
} from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function MobileMessagesPage() {
  const { t } = useTranslation();
  // Per-message read state keyed by message id, layered over the mock fixture
  // (matches the desktop messages page).
  const [overrides, setOverrides] = useState<Map<string, MessageStatus>>(
    () => new Map(),
  );
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);

  const threads = useMemo<MessageThread[]>(() => {
    return MOCK_MESSAGE_THREADS.map((thread) => {
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
  }, [overrides]);

  const unreadCount = useMemo(
    () => threads.reduce((sum, th) => sum + th.unreadCount, 0),
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

  const openThreadValue = threads.find((th) => th.id === openThreadId) ?? null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-4"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between gap-2"
      >
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.messages}</h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <MailOpen className="h-3.5 w-3.5" />
            {t.messagesPage.markAllRead}
          </button>
        )}
      </motion.div>

      <motion.div variants={fadeUp}>
        <span className="rounded-full border border-glass bg-white/[0.03] px-2.5 py-1 text-sm font-medium text-muted tabular-nums">
          {unreadCount} {t.messagesPage.unread.toLowerCase()}
        </span>
      </motion.div>

      {threads.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-dark">
          {t.messagesPage.empty}
        </p>
      ) : (
        <motion.div variants={fadeUp} className="space-y-2">
          {threads.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              onOpen={() => openThread(thread)}
            />
          ))}
        </motion.div>
      )}

      <ThreadDetailModal
        thread={openThreadValue}
        onClose={() => setOpenThreadId(null)}
      />
    </motion.div>
  );
}
