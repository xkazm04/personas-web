import * as Sentry from "@sentry/nextjs";
import type { ReviewSeverity } from "@/lib/types";
import { RECOMMENDED_VOICES } from "./review-voice-data";

/**
 * Voice announcements for manual-review requests pushed from the desktop app
 * (cloud-sync v2). Two concerns live here, deliberately framework-free so both
 * the Realtime hook and the settings "Preview" button can drive them:
 *
 *   1. A tiny pub/sub bus — `useSyncedRealtime` (and the demo trigger) call
 *      `emitNewReview`; the `useReviewVoice` hook subscribes via `onNewReview`.
 *   2. `speak()` — the actual Web Speech output, with cross-tab de-duplication
 *      so the same review isn't read aloud once per open dashboard tab.
 *
 * Phase 1 only speaks a fixed phrase ("New review request"); the signal already
 * carries title/severity/personaId so a later phase can compose a richer
 * sentence without touching the Realtime plumbing again.
 */

export interface NewReviewSignal {
  /** Synced review row id — also the cross-tab de-dup key. */
  id: string;
  title: string;
  severity: ReviewSeverity;
  personaId: string;
}

/** The voice translation copy this module needs (subset of
 *  `t.settingsPage.notifications.voice`). Structural so the hook can pass the
 *  full i18n object straight through. */
export interface VoiceCopy {
  newReviewRequest: string;
  announcement: string;
  unknownPersona: string;
  severity: Record<ReviewSeverity, string>;
}

/** Spoken titles longer than this are clipped so one runaway review can't
 *  produce a minutes-long utterance. */
const MAX_SPOKEN_TITLE = 240;

/**
 * Build the spoken sentence for a review, e.g. "New critical review from Athena:
 * Approve production deploy". Word order lives in each locale's `announcement`
 * template ({severity}/{persona} placeholders); the title — dynamic content
 * from the desktop app — is appended after. Falls back to the fixed phrase when
 * there's nothing to say beyond "a review arrived".
 */
export function composeAnnouncement(
  signal: NewReviewSignal,
  copy: VoiceCopy,
  personaName: string | null,
): string {
  const severityWord = copy.severity[signal.severity] ?? signal.severity;
  const persona = personaName?.trim() || copy.unknownPersona;
  const base = copy.announcement
    .replace("{severity}", severityWord)
    .replace("{persona}", persona);
  const title = signal.title.trim();
  if (!title) return base || copy.newReviewRequest;
  const clipped = title.length > MAX_SPOKEN_TITLE ? `${title.slice(0, MAX_SPOKEN_TITLE)}…` : title;
  return `${base}: ${clipped}`;
}

type Listener = (signal: NewReviewSignal) => void;

const listeners = new Set<Listener>();

/** Subscribe to new-review signals. Returns an unsubscribe function. */
export function onNewReview(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Fan a new-review signal out to every subscriber. A throwing listener is
 *  reported but never blocks the others. */
export function emitNewReview(signal: NewReviewSignal): void {
  for (const listener of listeners) {
    try {
      listener(signal);
    } catch (err) {
      Sentry.captureException(err, { tags: { scope: "review-voice", op: "emit" } });
    }
  }
}

/** How long the speaking tab holds the per-id Web Lock. Long enough that
 *  sibling tabs receiving the same Realtime event collide and skip, short
 *  enough not to leak locks if a tab is closed mid-announcement. */
const ANNOUNCE_LOCK_HOLD_MS = 4000;

function hasSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let voiceListenerBound = false;

function refreshVoices(): SpeechSynthesisVoice[] {
  if (!hasSpeech()) return cachedVoices;
  const next = window.speechSynthesis.getVoices();
  if (next.length) cachedVoices = next; // engines return [] until voices load
  return cachedVoices;
}

/** Voices load asynchronously; warm the cache and keep it fresh via
 *  `voiceschanged`. Called from a user gesture (arm/preview) so the list is
 *  ready before the first real announcement. Safe to call repeatedly. */
function ensureVoices(): void {
  if (!hasSpeech()) return;
  refreshVoices();
  if (voiceListenerBound) return;
  voiceListenerBound = true;
  const synth = window.speechSynthesis;
  if (typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", refreshVoices);
  } else {
    synth.onvoiceschanged = refreshVoices;
  }
}

/**
 * Resolve the best available voice for `lang` using the curated, quality-ordered
 * recommendations (Readium Speech) for the base language: walk that list and
 * return the first voice the device actually has. Falls back to an exact then
 * partial locale match, else undefined (let the browser pick its default).
 */
function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = refreshVoices();
  if (!voices.length) return undefined;
  const lower = lang.toLowerCase();
  const base = lower.split("-")[0];

  const recommended = RECOMMENDED_VOICES[base];
  if (recommended) {
    const byName = new Map<string, SpeechSynthesisVoice>();
    for (const v of voices) byName.set(v.name.toLowerCase(), v);
    for (const name of recommended) {
      const hit = byName.get(name.toLowerCase());
      if (hit) return hit;
    }
  }

  return (
    voices.find((v) => v.lang.toLowerCase() === lower) ??
    voices.find((v) => v.lang.toLowerCase().split("-")[0] === base)
  );
}

/**
 * Nudge the speech engine to life from inside a user gesture. Safari (and iOS
 * especially) refuse `speak()` unless it has seen a gesture first; calling this
 * from the settings toggle / Preview click satisfies that. Also warms the voice
 * list (loads async). A no-op where speech is unavailable.
 */
export function armSpeech(): void {
  if (!hasSpeech()) return;
  ensureVoices();
  try {
    // An empty utterance is enough to mark the engine "user-activated" without
    // making a sound. resume() clears the paused state some engines start in.
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
  } catch {
    /* engine unavailable — announcements will simply no-op */
  }
}

/**
 * Speak `text` once across all tabs. `dedupeId` (the review id) names a Web
 * Lock; only the tab that wins it speaks, and it holds the lock briefly so the
 * others — which receive the same Realtime event almost simultaneously — find
 * it taken and bail. Without Web Locks (older browsers) we just speak directly.
 */
export function speak(text: string, lang: string | undefined, dedupeId: string): void {
  if (!hasSpeech()) return;
  ensureVoices();

  const utter = () => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      if (lang) u.lang = lang;
      const voice = lang ? pickVoice(lang) : undefined;
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang; // keep the tag consistent with the chosen voice
      }
      window.speechSynthesis.speak(u);
    } catch (err) {
      Sentry.captureException(err, { tags: { scope: "review-voice", op: "speak" } });
    }
  };

  if (typeof navigator !== "undefined" && "locks" in navigator) {
    void navigator.locks
      .request(`review-voice-${dedupeId}`, { ifAvailable: true }, (lock) => {
        // Null lock => another tab already owns this id and is announcing it.
        if (!lock) return Promise.resolve();
        utter();
        return new Promise<void>((resolve) => setTimeout(resolve, ANNOUNCE_LOCK_HOLD_MS));
      })
      .catch((err) => {
        // Lock API hiccup shouldn't swallow the announcement entirely.
        Sentry.captureException(err, { tags: { scope: "review-voice", op: "lock" } });
        utter();
      });
  } else {
    utter();
  }
}

/** Map an app locale to a BCP-47 tag the speech engine recognises. Most of our
 *  locale codes are already valid primary subtags; only a couple need a region
 *  to pick a sensible default voice. */
export function localeToSpeechLang(locale: string): string {
  switch (locale) {
    case "en":
      return "en-US";
    case "zh":
      return "zh-CN";
    default:
      return locale;
  }
}
