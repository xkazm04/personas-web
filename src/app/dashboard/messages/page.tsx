"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import JsonViewer from "@/components/dashboard/JsonViewer";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_MESSAGES,
  type FeedbackMessage,
  type MessageStatus,
} from "@/lib/mock-dashboard-data";
import { relativeTime } from "@/lib/format";
import { useTranslation } from "@/i18n/useTranslation";

const PAGE_SIZE = 10;

function MessageRow({
  msg,
  expanded,
  onToggle,
  onOpen,
}: {
  msg: FeedbackMessage;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const isUnread = msg.status === "unread";
  return (
    <div
      className={`rounded-xl border transition-colors ${
        isUnread
          ? "border-brand-cyan/20 bg-brand-cyan/[0.04]"
          : "border-glass bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
    >
      <button
        type="button"
        onClick={() => {
          onOpen();
          onToggle();
        }}
        className="flex w-full items-start gap-3 p-3 text-left"
      >
        <PersonaAvatar color={msg.personaColor} name={msg.persona} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm ${
                isUnread ? "font-semibold text-foreground" : "font-medium text-muted"
              }`}
            >
              {msg.subject}
            </span>
            {isUnread && (
              <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-1.5 py-0.5 text-sm font-medium text-cyan-300">
                {t.messagesPage.unread}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-dark">
            <span>{msg.persona}</span>
            <span aria-hidden>·</span>
            <span>{relativeTime(msg.timestamp)}</span>
          </div>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 text-muted-dark transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-glass"
          >
            <div className="p-3">
              <JsonViewer payload={msg.payload} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [statuses, setStatuses] = useState<Map<string, MessageStatus>>(
    () => new Map(MOCK_MESSAGES.map((m) => [m.id, m.status])),
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
    .map((m) => ({ ...m, status: statuses.get(m.id) ?? m.status }));

  const unreadCount = useMemo(
    () =>
      Array.from(statuses.values()).filter((s) => s === "unread").length,
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

      <motion.div
        variants={fadeUp}
        className="mb-3 flex items-center gap-2"
      >
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
          {pageItems.map((msg) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              expanded={expandedIds.has(msg.id)}
              onToggle={() => toggleExpand(msg.id)}
              onOpen={() => markRead(msg.id)}
            />
          ))}
        </motion.div>
      )}

      <motion.div
        variants={fadeUp}
        className="mt-4 flex items-center justify-between"
      >
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={clampedPage === 0}
          className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3 w-3" />
          {t.messagesPage.pagination.prev}
        </button>
        <span className="text-sm text-muted-dark tabular-nums">{pageLabel}</span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={clampedPage >= totalPages - 1}
          className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.messagesPage.pagination.next}
          <ChevronRight className="h-3 w-3" />
        </button>
      </motion.div>
    </motion.div>
  );
}
