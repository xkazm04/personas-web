"use client";

import { useState } from "react";
import { mobileCopy } from "@/i18n/pending/mobile";
import { getSyncedReport, type SyncedReport } from "@/lib/supabaseApi";
import { useAuthStore } from "@/stores/authStore";

type Load = { phase: "idle" } | { phase: "loading" } | { phase: "error" } | { phase: "done"; report: SyncedReport | null };

/** The sync mirror, not the demo: the only plane where a report row exists (same predicate as `src/lib/api.ts`). */
const USE_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

/**
 * A council Approval's report on the phone: a collapsed **Report** expander
 * that fetches the synced report once on first open and shows its title and
 * content as plain text. Renders nothing off the Supabase mirror or in demo.
 */
export default function PhoneReviewReport({ reportId }: { reportId: string }) {
  const copy = mobileCopy.reviews;
  const isDemo = useAuthStore((s) => s.isDemo);
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState<Load>({ phase: "idle" });

  if (!USE_SUPABASE || isDemo) return null;

  const fetchReport = () => {
    setLoad({ phase: "loading" });
    getSyncedReport(reportId).then(
      (report) => setLoad({ phase: "done", report }),
      () => setLoad({ phase: "error" }),
    );
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && load.phase === "idle") fetchReport();
  };

  return (
    <div data-review-report className="mt-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="inline-flex min-h-[44px] items-center text-sm font-medium text-brand-cyan focus-visible:outline-2 focus-visible:outline-brand-cyan"
      >
        {copy.report}
      </button>
      {open && (
        <div className="rounded-xl border border-glass bg-white/[0.03] p-3">
          {load.phase === "loading" && <p className="text-sm text-muted">{copy.reportLoading}</p>}
          {load.phase === "error" && (
            <div role="alert" className="text-sm text-muted">
              <p>{copy.reportError}</p>
              <button
                type="button"
                onClick={fetchReport}
                className="inline-flex min-h-[44px] items-center font-medium text-brand-cyan focus-visible:outline-2 focus-visible:outline-brand-cyan"
              >
                {copy.reportRetry}
              </button>
            </div>
          )}
          {load.phase === "done" && !load.report && <p className="text-sm text-muted">{copy.reportNotSynced}</p>}
          {load.phase === "done" && load.report && (
            <>
              {load.report.title && (
                <h3 className="text-sm font-semibold text-foreground wrap-break-word">{load.report.title}</h3>
              )}
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted wrap-break-word">{load.report.content ?? ""}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
