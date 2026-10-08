"use client";

import { TriangleAlert } from "lucide-react";
import { mobileCopy } from "@/i18n/pending/mobile";
import { useReviewStore } from "@/stores/reviewStore";

/**
 * An overdue review the escalation could not approve automatically (on a
 * command plane: no paired phone, the desktop offline or refusing). Shown
 * rather than swallowed; the store retries it after a cool-down, and the
 * review stays pending for a human meanwhile.
 */
export default function EscalationFailureNotice() {
  const failure = useReviewStore((s) => s.escalationFailure);
  if (!failure) return null;
  return (
    <p
      role="alert"
      data-escalation-failure
      className="flex items-start gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-300"
    >
      <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 flex-none" />
      {mobileCopy.reviews.escalationFailed.replace("{reason}", failure.reason.replace(/_/g, " "))}
    </p>
  );
}
