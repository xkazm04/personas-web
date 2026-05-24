"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { SettingToggle } from "./SettingToggle";

/** Healing-alert severity toggles + weekly digest. Demo-only local state. */
export function NotificationsCard() {
  const { t } = useTranslation();
  const n = t.settingsPage.notifications;
  const [sev, setSev] = useState({ critical: true, high: true, medium: false, low: false });
  const [digest, setDigest] = useState(true);

  const rows: Array<{ key: keyof typeof sev; label: string; dot: string }> = [
    { key: "critical", label: n.severity.critical, dot: "bg-rose-400" },
    { key: "high", label: n.severity.high, dot: "bg-orange-400" },
    { key: "medium", label: n.severity.medium, dot: "bg-amber-400" },
    { key: "low", label: n.severity.low, dot: "bg-blue-400" },
  ];

  return (
    <GlowCard accent="amber" variants={fadeUp} className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">{n.title}</h2>
        <span className="ml-auto text-sm text-muted-dark">{n.subtitle}</span>
      </div>
      <div className="divide-y divide-glass">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3 py-2.5">
            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${r.dot}`} />
            <span className="flex-1 text-sm text-foreground">{r.label}</span>
            <SettingToggle on={sev[r.key]} onChange={(v) => setSev((s) => ({ ...s, [r.key]: v }))} label={r.label} />
          </div>
        ))}
        <div className="flex items-center gap-3 py-2.5">
          <span className="flex-1 text-sm text-foreground">{n.weeklyDigest}</span>
          <SettingToggle on={digest} onChange={setDigest} label={n.weeklyDigest} />
        </div>
      </div>
    </GlowCard>
  );
}
