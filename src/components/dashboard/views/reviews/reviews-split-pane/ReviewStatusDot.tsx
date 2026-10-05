import { Check, X } from "lucide-react";
import type { ManualReviewItem } from "@/lib/types";

export function ReviewStatusDot({ status }: { status: ManualReviewItem["status"] }) {
  if (status === "pending") {
    return (
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>
    );
  }

  if (status === "approved") {
    return (
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20 flex-shrink-0">
        <Check className="h-2 w-2 text-emerald-400" />
      </span>
    );
  }

  return (
    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500/20 flex-shrink-0">
      <X className="h-2 w-2 text-red-400" />
    </span>
  );
}
