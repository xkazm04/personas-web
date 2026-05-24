"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { MOCK_VAULT_CHANGES, type VaultAction } from "@/lib/mock-dashboard-data";

const ACTION_TINT: Record<VaultAction, string> = {
  rotated: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
  added: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
  revoked: "border-rose-500/20 bg-rose-500/8 text-rose-400",
  synced: "border-purple-500/20 bg-purple-500/8 text-purple-400",
};

/**
 * Credential-vault recent changes: rotations, additions, revocations, and
 * syncs of stored secrets. The web counterpart to the desktop overview's
 * VaultRecentChangesCard. Secret names are technical identifiers shown
 * verbatim (not translated).
 */
export function VaultChangesCard() {
  const { t } = useTranslation();
  const labels = t.dashboard.home.vaultChanges;

  return (
    <GlowCard accent="emerald" className="h-full p-5">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-emerald-400" />
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
        <span className="ml-auto text-sm text-muted-dark">{labels.subtitle}</span>
      </div>

      {MOCK_VAULT_CHANGES.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-dark">{labels.empty}</p>
      ) : (
        <div className="space-y-1.5">
          {MOCK_VAULT_CHANGES.map((change) => (
            <Link
              key={change.id}
              href="/dashboard/settings"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03] focus-ring focus-visible:ring-offset-0"
            >
              <KeyRound className="h-3.5 w-3.5 flex-shrink-0 text-muted-dark" />
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                {change.secret}
              </span>
              <span
                className={`flex-shrink-0 rounded-md border px-1.5 py-0.5 text-sm font-medium ${ACTION_TINT[change.action]}`}
              >
                {labels.actions[change.action]}
              </span>
              <span className="w-8 flex-shrink-0 text-right text-sm tabular-nums text-muted-dark">
                {change.ago}
              </span>
            </Link>
          ))}
        </div>
      )}
    </GlowCard>
  );
}
