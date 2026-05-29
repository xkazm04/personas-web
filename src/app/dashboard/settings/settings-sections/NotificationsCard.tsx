"use client";

import { useRef, useState } from "react";
import { Bell, Volume2 } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { useReviewVoiceStore } from "@/stores/reviewVoiceStore";
import { useReviewStore } from "@/stores/reviewStore";
import { usePersonaStore } from "@/stores/personaStore";
import { armSpeech, emitNewReview } from "@/lib/review-voice";
import { SettingToggle } from "./SettingToggle";

/** Healing-alert severity toggles + weekly digest (demo-only local state), plus
 *  the spoken new-review announcement toggle (persisted in reviewVoiceStore). */
export function NotificationsCard() {
  const { t } = useTranslation();
  const n = t.settingsPage.notifications;
  const [sev, setSev] = useState({ critical: true, high: true, medium: false, low: false });
  const [digest, setDigest] = useState(true);

  const voiceEnabled = useReviewVoiceStore((s) => s.enabled);
  const setVoiceEnabled = useReviewVoiceStore((s) => s.setEnabled);
  const previewSeq = useRef(0);

  const handleVoiceToggle = (on: boolean) => {
    // Toggling on is a user gesture — use it to wake the speech engine so the
    // first real announcement isn't swallowed by autoplay policy (Safari/iOS).
    if (on) armSpeech();
    setVoiceEnabled(on);
  };

  // Demo trigger: emit a new-review signal through the same bus the Realtime
  // hook uses, so the announcement is testable without a live tenant. Prefers a
  // real pending review (mock data in demo mode) so the composed sentence sounds
  // realistic; otherwise synthesizes one against the first persona.
  const handlePreview = () => {
    armSpeech();
    const review = useReviewStore.getState().reviews.find((r) => r.status === "pending");
    const firstPersona = usePersonaStore.getState().personas[0];
    emitNewReview({
      id: `preview-${(previewSeq.current += 1)}`,
      title: review?.content?.split("\n")[0]?.trim() ?? "",
      severity: review?.severity ?? "warning",
      personaId: review?.personaId ?? firstPersona?.id ?? "",
    });
  };

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
        <div className="flex items-center gap-3 py-2.5">
          <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-brand-cyan" />
          <span className="flex-1 text-sm text-foreground">{n.voice.label}</span>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!voiceEnabled}
            className="rounded-md border border-glass px-2 py-1 text-xs text-muted-dark transition-colors hover:border-glass-hover hover:text-foreground focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {n.voice.preview}
          </button>
          <SettingToggle on={voiceEnabled} onChange={handleVoiceToggle} label={n.voice.label} />
        </div>
      </div>
    </GlowCard>
  );
}
