import { useTranslation } from "@/i18n/useTranslation";
import type { SyncedNote } from "@/lib/notes/notesModel";
import RailGlyph from "./RailGlyph";

export const REVIEW_PILL = "rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-sm font-medium text-amber-300";
export const UNREAD_PILL = "rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-sm font-medium text-cyan-300";

/** One goal: title, its status on the rail, and what waits for the operator. Tapping opens the body sheet. */
export default function NoteCard({ note, onOpen }: { note: SyncedNote; onOpen: (id: string) => void }) {
  const { t } = useTranslation();
  const copy = t.mobile.notes;
  return (
    <li>
      <button
        type="button"
        data-note-card={note.id}
        aria-haspopup="dialog"
        onClick={() => onOpen(note.id)}
        className="flex min-h-[44px] w-full flex-col gap-2 rounded-xl border border-glass bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-brand-cyan"
      >
        <span className="line-clamp-2 text-sm font-medium text-foreground [overflow-wrap:anywhere]">{note.title}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <RailGlyph status={note.status} />
            {copy.status[note.status]}
          </span>
          {note.openReviews > 0 && (
            <span className={REVIEW_PILL}>{copy.needsReview.replace("{count}", String(note.openReviews))}</span>
          )}
          {note.unreadComments > 0 && (
            <span className={UNREAD_PILL}>{copy.unread.replace("{count}", String(note.unreadComments))}</span>
          )}
        </span>
      </button>
    </li>
  );
}
