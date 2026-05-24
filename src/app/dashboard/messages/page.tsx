"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailOpen } from "lucide-react";

import GradientText from "@/components/GradientText";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_MESSAGES,
  type MessageStatus,
} from "@/lib/mock-dashboard-data";

import { MessageRow } from "./messages-page/MessageRow";
import { MessagesPagination } from "./messages-page/MessagesPagination";

const PAGE_SIZE = 10;

export default function MessagesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [statuses, setStatuses] = useState<Map<string, MessageStatus>>(
    () => new Map(MOCK_MESSAGES.map((message) => [message.id, message.status])),
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [fetchedAt] = useState(() => Date.now());

  const ordered = useMemo(() => {
    return [...MOCK_MESSAGES].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, []);

  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageItems = ordered
    .slice(clampedPage * PAGE_SIZE, (clampedPage + 1) * PAGE_SIZE)
    .map((message) => ({
      ...message,
      status: statuses.get(message.id) ?? message.status,
    }));

  const unreadCount = useMemo(
    () => Array.from(statuses.values()).filter((status) => status === "unread").length,
    [statuses],
  );

  function markRead(id: string) {
    setStatuses((prev) => {
      if (prev.get(id) === "read") return prev;
      const next = new Map(prev);
      next.set(id, "read");
      return next;
    });
  }

  function markAllRead() {
    setStatuses((prev) => {
      const next = new Map(prev);
      for (const id of next.keys()) next.set(id, "read");
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
          <p className="mt-1 text-base text-muted-dark">
            {t.messagesPage.subtitle}
          </p>
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
        <p className="py-12 text-center text-sm text-muted-dark">
          {t.messagesPage.empty}
        </p>
      ) : (
        <motion.div variants={fadeUp} className="space-y-2">
          {pageItems.map((message) => (
            <MessageRow
              key={message.id}
              msg={message}
              expanded={expandedIds.has(message.id)}
              onToggle={() => toggleExpand(message.id)}
              onOpen={() => markRead(message.id)}
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
    </motion.div>
  );
}
