"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Top bar for pushed (non-tab) mobile subpages — a back chevron + title. Tab
 * roots don't use this; only drill-in views like /m/alerts.
 */
export default function MobileAppBar({
  title,
  backHref,
  backLabel,
}: {
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Link
        href={backHref}
        aria-label={backLabel}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-glass bg-white/[0.03] text-muted transition-colors hover:text-foreground active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <h1 className="min-w-0 truncate text-xl font-bold tracking-tight">{title}</h1>
    </div>
  );
}
