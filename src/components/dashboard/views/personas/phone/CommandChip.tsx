"use client";

import { Check, Loader2, Send, TriangleAlert } from "lucide-react";
import type { CommandStatus, InflightCommand } from "@/lib/commands/commandReducer";
import { chatErrorKind } from "@/lib/chat/chatModel";
import { isDeskOnly } from "@/lib/commands/commandRefusal";
import { mobileCopy } from "@/i18n/pending/mobile";

const TONE: Record<CommandStatus, string> = {
  pending: "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan",
  executing: "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan",
  completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  failed: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  rejected: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  expired: "border-amber-500/25 bg-amber-500/10 text-amber-300",
};

/** The desktop's reason codes read as words; anything unrecognized shows as sent. */
function reasonText(error: string | null): string {
  if (!error) return "";
  const code = error.split(":")[0].trim();
  return code.replace(/_/g, " ");
}

/**
 * One command's lifecycle as a chip (PHASE2-SPEC.md 4.3): Sending... ->
 * Working... -> Done, or Failed / Refused with the desktop's reason, or
 * "Your computer didn't answer". Announced politely as it changes.
 */
export default function CommandChip({ command }: { command: InflightCommand }) {
  const copy = mobileCopy.command;
  const { status } = command;
  const deskOnly = (status === "failed" || status === "rejected") && isDeskOnly(command.error);
  const label = deskOnly
    ? copy.deskOnly
    : status === "failed"
      ? copy.failed.replace("{reason}", reasonText(command.error))
      : status === "rejected"
        ? chatErrorKind(status, command.error) === "replayed"
          ? copy.replayed
          : copy.rejected.replace("{reason}", reasonText(command.error))
        : copy[status];
  const Icon =
    status === "pending" ? Send : status === "executing" ? Loader2 : status === "completed" ? Check : TriangleAlert;

  return (
    <span
      role="status"
      aria-live="polite"
      data-command-status={status}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${TONE[status]}`}
    >
      <Icon aria-hidden className={`h-3.5 w-3.5 flex-none ${status === "executing" ? "motion-safe:animate-spin" : ""}`} />
      <span className="truncate">{label}</span>
    </span>
  );
}
