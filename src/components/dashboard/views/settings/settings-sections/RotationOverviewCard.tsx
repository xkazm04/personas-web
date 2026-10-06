"use client";

import { AlertTriangle, KeyRound } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { MOCK_CREDENTIAL_ROTATIONS } from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";

/**
 * Rotation Overview: per-credential rotation status — policy, auto vs manual,
 * anomaly, and next-rotation / overdue. The web counterpart to the desktop
 * overview's Rotation Overview. Demo-only (the vault is local-by-design and not
 * part of the cloud sync set, like the model-providers card).
 */
export function RotationOverviewCard() {
  const { t } = useTranslation();
  const r = t.settingsPage.rotation;
  const isDemo = useAuthStore((s) => s.isDemo);

  if (!isDemo) return null;

  return (
    <GlowCard accent="amber" variants={fadeUp} className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">{r.title}</h2>
        <span className="ml-auto text-sm text-muted-dark">{r.subtitle}</span>
      </div>
      <div className="divide-y divide-glass">
        {MOCK_CREDENTIAL_ROTATIONS.map((cred) => (
          <div key={cred.id} className="flex items-center gap-2.5 py-2.5">
            <KeyRound className="h-3.5 w-3.5 flex-shrink-0 text-muted-dark" />
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{cred.secret}</span>

            <span
              className={`flex-shrink-0 rounded-md border px-1.5 py-0.5 text-xs font-medium ${
                cred.hasPolicy
                  ? "border-cyan-500/20 bg-cyan-500/8 text-cyan-300"
                  : "border-glass bg-white/[0.04] text-muted-dark"
              }`}
            >
              {cred.hasPolicy ? r.hasPolicy : r.noPolicy}
            </span>

            {cred.hasPolicy && (
              <span
                className={`flex-shrink-0 rounded-md border px-1.5 py-0.5 text-xs font-medium ${
                  cred.enabled
                    ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-300"
                    : "border-glass bg-white/[0.04] text-muted-dark"
                }`}
              >
                {cred.enabled ? r.auto : r.manual}
              </span>
            )}

            {cred.anomaly && (
              <span className="flex flex-shrink-0 items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 text-xs font-medium text-rose-300">
                <AlertTriangle className="h-2.5 w-2.5" />
                {r.anomaly}
              </span>
            )}

            <span className="w-16 flex-shrink-0 text-right text-sm tabular-nums">
              {cred.overdue ? (
                <span className="text-rose-300">{r.overdue}</span>
              ) : cred.nextRotation === "—" ? (
                <span className="text-muted-dark">{cred.nextRotation}</span>
              ) : (
                <span className="text-muted-dark">
                  {r.next} {cred.nextRotation}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}
