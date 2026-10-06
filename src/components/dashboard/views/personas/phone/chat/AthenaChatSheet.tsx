"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import BottomSheet from "@/components/primitives/BottomSheet";
import { useTranslation } from "@/i18n/useTranslation";
import { ATHENA_PERSONA_ID } from "@/lib/chat/chatModel";
import type { SyncReachability } from "@/hooks/useSyncReachability";
import ChatPanel from "./ChatPanel";

/** The sheet around the panel: handle, title row, bottom padding. */
const SHEET_CHROME_PX = 110;

/**
 * The pinned first row of the phone Personas list (PLAN M18: Athena first; no
 * new route). Athena is not a persona, so it has no Pause or overflow, only
 * its chat.
 */
export function AthenaRow({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation();
  const copy = t.mobile.chat;
  return (
    <div data-athena-row className="rounded-2xl border border-glass bg-white/[0.02] p-3">
      <button
        type="button"
        onClick={onOpen}
        aria-label={copy.athenaOpenLabel}
        aria-haspopup="dialog"
        className="flex min-h-[44px] w-full items-center gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-brand-cyan"
      >
        <span
          aria-hidden
          className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-brand-purple/40 bg-brand-purple/15"
        >
          <Sparkles className="h-5 w-5 text-brand-purple" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium text-foreground">{copy.athenaName}</span>
          <span className="block truncate text-sm text-muted-dark">{copy.athenaRowHint}</span>
        </span>
        <ChevronRight aria-hidden className="h-5 w-5 flex-none text-muted-dark" />
      </button>
    </div>
  );
}

/** Athena's chat in a bottom sheet: her threads, a transcript, the composer. */
export default function AthenaChatSheet({ open, reach, onClose }: { open: boolean; reach: SyncReachability; onClose: () => void }) {
  const { t } = useTranslation();
  const copy = t.mobile.chat;
  return (
    <BottomSheet open={open} onClose={onClose} title={copy.athenaName} keyboardSafe>
      <ChatPanel
        threadKind="athena"
        personaId={ATHENA_PERSONA_ID}
        name={copy.athenaName}
        ownerDeviceId={null}
        reach={reach}
        chromePx={SHEET_CHROME_PX}
      />
    </BottomSheet>
  );
}
