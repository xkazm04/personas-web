"use client";

import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Loader2, NotebookPen } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import { Modal } from "@/components/dashboard/Modal";
import BottomSheet from "@/components/primitives/BottomSheet";
import ReachabilityNotice from "@/components/dashboard/views/personas/phone/ReachabilityNotice";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSyncReachability } from "@/hooks/useSyncReachability";
import { useAuthStore } from "@/stores/authStore";
import { useNotesStore } from "@/stores/notesStore";
import { buildNoteZones, noteTotals } from "@/lib/notes/notesModel";
import type { ReachabilityTier } from "@/lib/sync/reachability";
import NoteDetail from "./NoteDetail";
import NoteZoneCard from "./NoteZoneCard";
import { REVIEW_PILL, UNREAD_PILL } from "./NoteCard";
import { mobileCopy } from "@/i18n/pending/mobile";

/** Tiers that get the reachability banner here. Pairing is for commands; reading notes needs none. */
const NOTICE_TIERS: ReadonlySet<ReachabilityTier> = new Set(["offline", "never-synced", "no-account"]);
/** Tiers in which nothing can have synced, so there is no list to show. */
const NO_DATA_TIERS: ReadonlySet<ReachabilityTier> = new Set(["never-synced", "no-account"]);

/**
 * `/dashboard/notes`: the goals from the desktop Notepad (its Quest Log),
 * zoned by project (PHASE2-SPEC.md 5.1 + 6.2). Read-only in v1: a card opens
 * its body sheet; writing stays on the desktop. Notes sync is a separate
 * opt-in on the desktop, off by default (PLAN M19), so an empty list says how
 * to turn it on. The same composition serves both widths: one column of zones
 * on a phone, a board of zone columns from 768 px up; the sheet is a bottom
 * sheet on a phone and a modal on a desktop.
 */
export default function NotesView() {
  const copy = mobileCopy.notes;
  const phone = useIsMobile();
  const { demo, authenticated } = useAuthStore(useShallow((s) => ({ demo: s.isDemo, authenticated: s.isAuthenticated })));
  const reach = useSyncReachability();
  const { notes, loading, loaded, error, fetchedAt } = useNotesStore(
    useShallow((s) => ({ notes: s.notes, loading: s.loading, loaded: s.loaded, error: s.error, fetchedAt: s.fetchedAt })),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  // The clock the sheet's "updated 3 hours ago" is judged at: when the list arrived.
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    void useNotesStore.getState().fetchNotes();
  }, [demo, authenticated]);

  const zones = useMemo(() => buildNoteZones(notes), [notes]);
  const totals = useMemo(() => noteTotals(notes), [notes]);
  const open = openId ? (notes.find((n) => n.id === openId) ?? null) : null;
  const close = () => setOpenId(null);

  const tier = reach.ready ? reach.tier : null;
  const noData = tier !== null && NO_DATA_TIERS.has(tier);

  let body: React.ReactNode;
  if (noData) {
    body = null;
  } else if (error && notes.length === 0) {
    body = (
      <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
        <p>{copy.error}</p>
        <button
          type="button"
          onClick={() => void useNotesStore.getState().fetchNotes()}
          className="mt-2 inline-flex min-h-[44px] items-center rounded-xl border border-glass-hover px-4 text-base font-medium text-foreground"
        >
          {copy.retry}
        </button>
      </div>
    );
  } else if (!loaded || (loading && notes.length === 0)) {
    body = (
      <p className="flex items-center gap-2 text-sm text-muted-dark" aria-busy="true">
        <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
        {copy.loading}
      </p>
    );
  } else if (notes.length === 0) {
    body = <EmptyState icon={NotebookPen} title={copy.emptyTitle} description={copy.emptyBody} />;
  } else {
    body = (
      <div className="grid items-start gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {zones.map((zone) => (
          <NoteZoneCard key={zone.key} zone={zone} onOpen={setOpenId} />
        ))}
      </div>
    );
  }

  const detail = open ? <NoteDetail note={open} now={fetchedAt ?? mountedAt} /> : null;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-brand-purple/25 bg-brand-purple/10">
          <NotebookPen aria-hidden className="h-5 w-5 text-brand-purple" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-dark sm:text-base">{copy.lede}</p>
        </div>
      </header>

      {tier !== null && NOTICE_TIERS.has(tier) && <ReachabilityNotice reach={reach} />}
      {tier === "offline" && notes.length > 0 && <p className="text-sm text-muted">{copy.offlineNote}</p>}

      {!noData && notes.length > 0 && (totals.needsReview > 0 || totals.unreadComments > 0) && (
        <p className="flex flex-wrap gap-2" data-notes-totals>
          {totals.needsReview > 0 && (
            <span className={REVIEW_PILL}>{copy.totalNeedsReview.replace("{count}", String(totals.needsReview))}</span>
          )}
          {totals.unreadComments > 0 && (
            <span className={UNREAD_PILL}>{copy.unread.replace("{count}", String(totals.unreadComments))}</span>
          )}
        </p>
      )}

      {body}

      {demo && !noData && <p className="text-sm text-muted-dark">{copy.demoNote}</p>}

      {phone ? (
        <BottomSheet open={open !== null} onClose={close} title={open?.title} subtitle={open ? (open.projectName ?? copy.noProject) : undefined}>
          {detail}
        </BottomSheet>
      ) : (
        <Modal
          open={open !== null}
          onClose={close}
          title={open?.title}
          subtitle={open ? (open.projectName ?? copy.noProject) : undefined}
          maxWidth="max-w-2xl"
          ariaLabel={open?.title}
        >
          {detail}
        </Modal>
      )}
    </div>
  );
}
