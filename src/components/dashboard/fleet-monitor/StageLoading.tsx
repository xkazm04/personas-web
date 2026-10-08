"use client";

import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";

/** Placeholder while a fleet view's chunk loads; fills the stage frame. */
export default function StageLoading() {
  return (
    <div role="status" className="flex h-full items-center justify-center text-sm text-muted-dark">
      {personasMonitorCopy.loading}
    </div>
  );
}
