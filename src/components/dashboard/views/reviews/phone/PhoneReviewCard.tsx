"use client";

import { useId, useState } from "react";
import { AlertOctagon, Check, MessageSquarePlus, X } from "lucide-react";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import CommandChip from "@/components/dashboard/views/personas/phone/CommandChip";
import { useTranslation } from "@/i18n/useTranslation";
import { mobileCopy } from "@/i18n/pending/mobile";
import { REVIEW_NOTES_MAX } from "@/lib/commands/reviewDecide";
import type { InflightCommand } from "@/lib/commands/commandReducer";
import type { ManualReviewItem } from "@/lib/types";
import { useReviewStore } from "@/stores/reviewStore";
import { DueChip } from "../review-due";
import { reviewSeverityConfig } from "../reviews-split-pane/reviewSeverityConfig";

/** A body longer than this is clamped behind "Show more". */
const CLAMP_CHARS = 180;

/** A review's content is its title, a newline, then its description. */
export function splitReviewContent(content: string): { title: string; body: string } {
  const at = content.indexOf("\n");
  if (at === -1) return { title: content.trim(), body: "" };
  return { title: content.slice(0, at).trim(), body: content.slice(at + 1).trim() };
}

interface Props {
  review: ManualReviewItem;
  now: number;
  /** The online gate for this review's desktop (or always, on the orchestrator plane). */
  canDecide: boolean;
  /** The last verdict command sent for it, when it came back pending (failed, refused, expired). */
  command: InflightCommand | null;
  onDecide: (id: string, verdict: "approved" | "rejected") => void;
}

/**
 * One pending review on the phone (PLAN M20): who asks, how urgent, what it
 * is, an optional note, and two 48 px buttons. A verdict goes through the
 * store's `decide`, so it opens the same 5 s undo window as the desk before
 * anything is sent.
 */
export default function PhoneReviewCard({ review, now, canDecide, command, onDecide }: Props) {
  const { t } = useTranslation();
  const copy = mobileCopy.reviews;
  const titleId = useId();
  const noteId = useId();
  const draft = useReviewStore((s) => s.drafts[review.id]);
  const setDraft = useReviewStore((s) => s.setDraft);
  const [expanded, setExpanded] = useState(false);
  const [noteOpen, setNoteOpen] = useState(() => Boolean(draft));
  const { title, body } = splitReviewContent(review.content);
  const long = body.length > CLAMP_CHARS;
  const sev = reviewSeverityConfig[review.severity];
  const SevIcon = sev.icon;

  return (
    <li data-review-card={review.id} className="list-none">
      <article aria-labelledby={titleId} className="rounded-2xl border border-glass bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <PersonaAvatar icon={review.personaIcon} color={review.personaColor} name={review.personaName} size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-muted">
            {review.personaName ?? t.eventsPage.unknownAgent}
          </span>
          <span className={`inline-flex items-center gap-1 text-sm font-medium ${sev.color}`}>
            <SevIcon aria-hidden className="h-3.5 w-3.5" />
            {t.reviewsPage.severity[review.severity]}
          </span>
        </div>

        <h2 id={titleId} className="mt-2 text-base font-semibold text-foreground wrap-break-word">
          {title || t.dashboardUi.content}
        </h2>
        <div className="mt-1">
          <DueChip review={review} now={now} compact />
        </div>

        {review.parseError && (
          <p role="alert" className="mt-2 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            <AlertOctagon aria-hidden className="mt-0.5 h-4 w-4 flex-none text-rose-400" />
            {t.reviewsPage.parseError.detail}
          </p>
        )}

        {body && (
          <div className="mt-2">
            <p className={`whitespace-pre-wrap text-sm text-muted wrap-break-word ${long && !expanded ? "line-clamp-3" : ""}`}>{body}</p>
            {long && (
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 inline-flex min-h-[44px] items-center text-sm font-medium text-brand-cyan focus-visible:outline-2 focus-visible:outline-brand-cyan"
              >
                {expanded ? copy.showLess : copy.showMore}
              </button>
            )}
          </div>
        )}

        {noteOpen ? (
          <div className="mt-3">
            <label htmlFor={noteId} className="text-sm font-medium text-muted-dark">
              {t.dashboardUi.reviewerNotes}
            </label>
            <textarea
              id={noteId}
              data-review-note
              value={draft ?? ""}
              onChange={(e) => setDraft(review.id, e.target.value)}
              maxLength={REVIEW_NOTES_MAX}
              rows={2}
              placeholder={t.dashboardUi.notesPlaceholder}
              className="mt-1 min-h-[44px] w-full resize-none rounded-xl border border-glass-hover bg-white/[0.03] px-3 py-2.5 text-base text-foreground placeholder:text-muted-dark focus-visible:outline-2 focus-visible:outline-brand-cyan"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand-cyan"
          >
            <MessageSquarePlus aria-hidden className="h-4 w-4" />
            {copy.addNote}
          </button>
        )}

        {command && (
          <div className="mt-2">
            <CommandChip command={command} />
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            data-review-action="approve"
            disabled={!canDecide}
            onClick={() => onDecide(review.id, "approved")}
            aria-label={copy.approveLabel.replace("{title}", title)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-base font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check aria-hidden className="h-5 w-5" />
            {t.reviewsPage.focus.approve}
          </button>
          <button
            type="button"
            data-review-action="reject"
            disabled={!canDecide}
            onClick={() => onDecide(review.id, "rejected")}
            aria-label={copy.rejectLabel.replace("{title}", title)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 text-base font-medium text-rose-300 transition-colors hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X aria-hidden className="h-5 w-5" />
            {t.reviewsPage.focus.reject}
          </button>
        </div>
      </article>
    </li>
  );
}
