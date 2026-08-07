"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Rocket, Send } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import ExecuteToast from "@/app/dashboard/agents/agents-page/ExecuteToast";
import { useTranslation } from "@/i18n/useTranslation";
import {
  MOCK_APPROVED_WORK,
  MOCK_APPROVED_WORK_STALE_DAYS,
} from "@/lib/mock-dashboard-data";

/**
 * Approved work — Mission Control's reconciliation card: which approved ideas
 * actually got dispatched into work, and which decisions nothing ever acted
 * on. Undispatched rows carry a one-click Dispatch affordance; in this demo
 * dispatching only marks the row locally and confirms with a toast (no
 * orchestrator behind it). Web counterpart to the desktop's title-bar
 * "Approved work" tray + dispatch panel.
 */
export function ApprovedWorkCard() {
  const { t } = useTranslation();
  const labels = t.dashboard.home.approvedWork;
  // Demo-local dispatch ledger: ids the user has "sent" this session.
  const [sentIds, setSentIds] = useState<ReadonlySet<string>>(new Set());
  const [toast, setToast] = useState<{ key: number; message: string } | null>(null);
  // Monotonic toast key (re-keys restart the dismiss timer); a ref, not
  // Date.now(), to satisfy the React 19 render-purity rule.
  const toastSeq = useRef(0);

  const rows = MOCK_APPROVED_WORK;
  const isWaiting = (item: (typeof rows)[number]) => item.undispatched && !sentIds.has(item.id);
  const waiting = rows.filter(isWaiting);
  const staleCount = waiting.filter(
    (item) => (item.ageHours ?? 0) > MOCK_APPROVED_WORK_STALE_DAYS * 24,
  ).length;

  const dispatch = (ids: string[]) => {
    setSentIds((prev) => new Set([...prev, ...ids]));
    toastSeq.current += 1;
    setToast({
      key: toastSeq.current,
      message: labels.toast.replace("{count}", String(ids.length)),
    });
  };

  return (
    <GlowCard accent="amber" className="flex h-full flex-col p-5">
      <div className="mb-1 flex items-center gap-2">
        <Rocket className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
        {waiting.length > 0 && (
          <span className="ml-auto rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-sm font-medium tabular-nums text-amber-300">
            {waiting.length}
          </span>
        )}
      </div>
      <p className="mb-3 text-sm text-muted-dark">
        {labels.summary
          .replace("{undispatched}", String(waiting.length))
          .replace("{total}", String(rows.length))}
        {staleCount > 0 && (
          <span className="text-amber-300">
            {" · "}
            {labels.stale
              .replace("{count}", String(staleCount))
              .replace("{days}", String(MOCK_APPROVED_WORK_STALE_DAYS))}
          </span>
        )}
      </p>

      {waiting.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-6 text-center text-sm text-muted-dark">
          {labels.empty}
        </p>
      ) : (
        <div className="-mx-1 flex-1 space-y-1">
          {rows.map((item) => {
            const pending = isWaiting(item);
            const stale = pending && (item.ageHours ?? 0) > MOCK_APPROVED_WORK_STALE_DAYS * 24;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${pending ? "text-foreground" : "text-muted-dark"}`}>
                    {item.title}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-dark">
                    <span className="truncate">{item.project}</span>
                    <span
                      className={`inline-flex flex-shrink-0 items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${
                        pending
                          ? stale
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            : "border-glass bg-white/[0.04] text-muted-dark"
                          : "border-emerald-500/25 bg-emerald-500/8 text-emerald-300"
                      }`}
                    >
                      {pending ? labels.neverDispatched : labels.dispatched}
                    </span>
                    {pending && item.ageHours !== null && (
                      <span className="flex-shrink-0 tabular-nums">
                        {item.ageHours >= 24 ? `${Math.floor(item.ageHours / 24)}d` : `${item.ageHours}h`}
                      </span>
                    )}
                  </p>
                </div>
                {pending && (
                  <button
                    type="button"
                    onClick={() => dispatch([item.id])}
                    className="flex-shrink-0 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 focus-ring focus-visible:ring-offset-0"
                  >
                    {labels.dispatch}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {waiting.length > 1 && (
        <button
          type="button"
          onClick={() => dispatch(waiting.map((item) => item.id))}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-glass-hover bg-white/[0.04] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08] focus-ring focus-visible:ring-offset-0"
        >
          <Send className="h-3.5 w-3.5" />
          {labels.sendAll.replace("{count}", String(waiting.length))}
        </button>
      )}

      <AnimatePresence>
        {toast && (
          <ExecuteToast
            key={toast.key}
            status="success"
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </GlowCard>
  );
}
