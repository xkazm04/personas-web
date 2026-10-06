import { railPosition, type NoteStatus } from "@/lib/notes/notesModel";

/** Segment fill by rail: plan is purple, brainstorm cyan, a draft (both rails) neutral, a finished note emerald. */
function fillFor(status: NoteStatus): string {
  if (status === "completed" || status === "shipped") return "bg-brand-emerald";
  const { rail } = railPosition(status);
  if (rail === "plan") return "bg-brand-purple";
  if (rail === "brainstorm") return "bg-brand-cyan";
  return "bg-muted-dark";
}

/**
 * The status rail glyph: one segment per step of the note's rail (draft and
 * three more), filled up to where the note is. Decorative: the status label
 * beside it carries the meaning, so colour is never the only signal.
 */
export default function RailGlyph({ status, className = "" }: { status: NoteStatus; className?: string }) {
  const { steps, index } = railPosition(status);
  const fill = fillFor(status);
  return (
    <span aria-hidden className={`inline-flex flex-none items-center gap-0.5 ${className}`} data-rail-glyph={status}>
      {steps.map((step, i) => (
        <span key={step} className={`h-1.5 w-3 rounded-full ${i <= index ? fill : "bg-white/10"}`} />
      ))}
    </span>
  );
}
