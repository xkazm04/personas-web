"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface TranslationNoticeProps {
  /** The whole unit on screen: the current English page, or the older translation. */
  showing: "translated" | "canonical";
  /** Switch to the other whole unit. */
  onToggle: () => void;
}

/**
 * One-line notice above a guide topic whose translation predates its current
 * English, with a single toggle between the two whole units. Static: no motion,
 * and the markup is identical in both states (only the button label changes),
 * so keyboard focus stays on the toggle across a switch.
 */
export default function TranslationNotice({ showing, onToggle }: TranslationNoticeProps) {
  const { t } = useTranslation();
  const copy = t.guide.translationNotice;
  return (
    <div
      role="status"
      className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-glass bg-white/[0.02] px-4 py-3 text-sm text-muted"
    >
      <Languages aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-amber" />
      <p className="min-w-0 flex-1">{copy.staleBody}</p>
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50"
      >
        {showing === "canonical" ? copy.showTranslation : copy.showCurrent}
      </button>
    </div>
  );
}
