import { MarkdownReport } from "@/components/dashboard/MarkdownReport";
import { useTranslation } from "@/i18n/useTranslation";
import { useI18nStore } from "@/stores/i18nStore";
import { formatDue } from "@/lib/review-sla";
import { railPosition, type SyncedNote } from "@/lib/notes/notesModel";
import { REVIEW_PILL, UNREAD_PILL } from "./NoteCard";

const LABEL = "text-sm font-medium uppercase tracking-wider text-muted-dark";

/**
 * The body sheet's content: where the note is on its rail, what waits for the
 * operator, the run summary, and the markdown body (rendered by the dashboard's
 * own renderer: React elements only, no HTML injection). Read-only (v1).
 */
export default function NoteDetail({ note, now }: { note: SyncedNote; now: number }) {
  const { t } = useTranslation();
  const language = useI18nStore((s) => s.language);
  const copy = t.mobile.notes;
  const { rail, steps, index } = railPosition(note.status);
  const updated = Date.parse(note.updatedAt);

  return (
    <div className="flex flex-col gap-5 pb-2" data-note-detail={note.id}>
      <section aria-label={copy.sheet.status}>
        <p className={LABEL}>{rail === "plan" ? copy.sheet.planRail : rail === "brainstorm" ? copy.sheet.brainstormRail : copy.sheet.status}</p>
        <ol className="mt-2 flex flex-wrap items-center gap-1.5">
          {steps.map((step, i) => (
            <li
              key={step}
              aria-current={i === index ? "step" : undefined}
              className={`rounded-full border px-2.5 py-0.5 text-sm ${
                i === index
                  ? "border-brand-cyan/40 bg-brand-cyan/15 font-medium text-foreground"
                  : i < index
                    ? "border-glass text-muted"
                    : "border-glass text-muted-dark"
              }`}
            >
              {copy.status[step]}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-muted-dark">
          {note.dispatchTarget ? `${copy.sheet.dispatch[note.dispatchTarget]} · ` : ""}
          {Number.isFinite(updated) ? copy.sheet.updated.replace("{ago}", formatDue(updated - now, language)) : ""}
        </p>
      </section>

      {(note.openReviews > 0 || note.unreadComments > 0) && (
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {note.openReviews > 0 && (
              <span className={REVIEW_PILL}>{copy.needsReview.replace("{count}", String(note.openReviews))}</span>
            )}
            {note.unreadComments > 0 && (
              <span className={UNREAD_PILL}>{copy.unread.replace("{count}", String(note.unreadComments))}</span>
            )}
          </div>
          <p className="text-sm text-muted">{copy.sheet.reviewsHint}</p>
        </section>
      )}

      {note.resultSummary && (
        <section className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
          <h3 className={LABEL}>{copy.sheet.runSummary}</h3>
          <p className="mt-1 text-sm text-foreground [overflow-wrap:anywhere]">{note.resultSummary}</p>
        </section>
      )}

      <section>
        <h3 className={LABEL}>{copy.sheet.body}</h3>
        {note.bodyMd.trim() ? (
          <MarkdownReport content={note.bodyMd} className="mt-1 [overflow-wrap:anywhere]" />
        ) : (
          <p className="mt-1 text-sm text-muted-dark">{copy.sheet.noBody}</p>
        )}
      </section>
    </div>
  );
}
