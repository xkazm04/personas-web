import { useId } from "react";
import { FolderGit2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { NoteZone } from "@/lib/notes/notesModel";
import NoteCard from "./NoteCard";

/** A project's zone, as in the desktop Quest Log: its name, how many goals, then the goals in rail order. */
export default function NoteZoneCard({ zone, onOpen }: { zone: NoteZone; onOpen: (id: string) => void }) {
  const { t } = useTranslation();
  const copy = t.mobile.notes;
  const headingId = useId();
  const count = zone.notes.length === 1 ? copy.goalsOne : copy.goals.replace("{count}", String(zone.notes.length));

  return (
    <section
      aria-labelledby={headingId}
      data-note-zone={zone.key}
      className="min-w-0 rounded-2xl border border-glass bg-white/[0.02] p-3 sm:p-4"
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="flex min-w-0 items-center gap-2 text-base font-semibold text-foreground">
          <FolderGit2 aria-hidden className="h-4 w-4 flex-none self-center text-brand-purple" />
          <span className={`truncate ${zone.name === null ? "italic text-muted" : ""}`}>{zone.name ?? copy.noProject}</span>
        </h2>
        <span className="flex-none text-sm tabular-nums text-muted-dark">{count}</span>
      </header>
      <ul className="flex flex-col gap-2">
        {zone.notes.map((note) => (
          <NoteCard key={note.id} note={note} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  );
}
