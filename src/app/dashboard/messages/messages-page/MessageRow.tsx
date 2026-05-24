import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { MarkdownReport } from "@/components/dashboard/MarkdownReport";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { FeedbackMessage } from "@/lib/mock-dashboard-data";

export function MessageRow({
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
            <span aria-hidden>-</span>
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
            <div className="px-3 pb-3.5 pt-1">
              <article className="rounded-xl border border-glass bg-white/[0.02] px-4 py-3.5">
                <MarkdownReport content={msg.body} />
              </article>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
