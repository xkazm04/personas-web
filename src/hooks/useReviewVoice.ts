"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  onNewReview,
  speak,
  composeAnnouncement,
  localeToSpeechLang,
  type VoiceCopy,
} from "@/lib/review-voice";
import { useReviewVoiceStore } from "@/stores/reviewVoiceStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Bridges the new-review signal bus to Web Speech. Mounted once for the
 * dashboard's lifetime; when a review arrives (from `useSyncedRealtime` in
 * supabase mode, or the settings "Preview" button anywhere) it composes a
 * spoken sentence — "New {severity} review from {persona}: {title}" — and reads
 * it aloud, but only if the user enabled the toggle.
 *
 * The latest voice copy + locale ride in a ref so we subscribe exactly once and
 * never tear the listener down on a locale switch. `enabled` and the persona
 * roster are read live from their stores inside the callback for the same reason.
 */
export function useReviewVoice(): void {
  const { t, language } = useTranslation();
  const voice = t.settingsPage.notifications.voice;
  const lang = useMemo(() => localeToSpeechLang(language), [language]);

  const latest = useRef<{ voice: VoiceCopy; lang: string }>({ voice, lang });
  useEffect(() => {
    latest.current = { voice, lang };
  }, [voice, lang]);

  useEffect(() => {
    return onNewReview((signal) => {
      if (!useReviewVoiceStore.getState().enabled) return;
      const persona = usePersonaStore
        .getState()
        .personas.find((p) => p.id === signal.personaId);
      const text = composeAnnouncement(signal, latest.current.voice, persona?.name ?? null);
      speak(text, latest.current.lang, signal.id);
    });
  }, []);
}
