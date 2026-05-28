import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";

import StatusBadge from "@/components/dashboard/StatusBadge";
import { useExecutionPolling } from "@/hooks/useExecutionPolling";
import { formatCost, formatDuration } from "@/lib/format";

const STICKY_BOTTOM_THRESHOLD_PX = 24;

export function ExecutionOutput({
  executionId,
  labels,
}: {
  executionId: string;
  labels: {
    status: string;
    duration: string;
    cost: string;
    stdout: string;
    waitingForWorker: string;
    noOutputYet: string;
    jumpToLatest: string;
  };
}) {
  const { output, status, durationMs, totalCostUsd } =
    useExecutionPolling(executionId);

  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyBottomRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const scrollToBottom = useCallback(
    (smooth: boolean) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth && !reduceMotion ? "smooth" : "auto",
      });
    },
    [reduceMotion],
  );

  // Pause auto-follow the moment the user scrolls up; resume when they return
  // to the bottom. State updates live in the scroll handler, not the effect body.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distance <= STICKY_BOTTOM_THRESHOLD_PX;
      stickyBottomRef.current = atBottom;
      setShowJumpToLatest((prev) => (prev === !atBottom ? prev : !atBottom));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Pin to the bottom as new lines stream in, but only while the user is parked
  // there. DOM-only mutation keeps this React 19 effect free of setState calls.
  useEffect(() => {
    if (stickyBottomRef.current) {
      scrollToBottom(false);
    }
  }, [output.length, status, scrollToBottom]);

  const handleJumpToLatest = () => {
    // Resume auto-follow; the scroll handler clears the pill once we land at the
    // bottom, so the pill rides the (gated) smooth scroll down instead of flickering.
    stickyBottomRef.current = true;
    scrollToBottom(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm text-muted-dark">
        <span>
          {labels.status}: <StatusBadge status={status} />
        </span>
        {durationMs !== undefined && (
          <span>{labels.duration}: {formatDuration(durationMs)}</span>
        )}
        {totalCostUsd !== undefined && (
          <span>{labels.cost}: {formatCost(totalCostUsd)}</span>
        )}
      </div>

      <div className="relative mt-2">
        <div
          ref={scrollRef}
          className="relative max-h-80 overflow-auto rounded-xl border border-glass-hover bg-background p-4 font-mono text-sm leading-relaxed text-slate-300 shadow-inner"
        >
          <div className="absolute left-0 top-0 flex w-full items-center gap-1.5 bg-white/[0.02] px-3 py-2 border-b border-glass">
            <div className="h-2 w-2 rounded-full bg-red-500/80" />
            <div className="h-2 w-2 rounded-full bg-amber-500/80" />
            <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-sm text-muted-dark">{labels.stdout}</span>
          </div>
          <div className="mt-6">
            {output.length === 0 ? (
              <span className="text-muted-dark flex items-center gap-2">
                {status === "queued" ? labels.waitingForWorker : labels.noOutputYet}
                {status === "running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-cyan" />}
              </span>
            ) : (
              <div className="space-y-1">
                {output.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap break-all text-emerald-400/90">
                    <span className="mr-2 text-white/60 select-none">{">"}</span>
                    {line}
                  </div>
                ))}
                {status === "running" && (
                  <div className="animate-pulse text-brand-cyan/80">_</div>
                )}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showJumpToLatest && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: reduceMotion ? 0 : 0.15 }}
              onClick={handleJumpToLatest}
              aria-label={labels.jumpToLatest}
              className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/15 px-3 py-1 text-xs font-medium text-brand-cyan shadow-sm backdrop-blur-sm transition-colors hover:bg-brand-cyan/25"
            >
              <ArrowDown className="h-3 w-3" />
              {labels.jumpToLatest}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
