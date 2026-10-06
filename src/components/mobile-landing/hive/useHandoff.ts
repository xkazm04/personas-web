"use client";

import { useState } from "react";
import type { Translations } from "@/i18n/en";
import { SITE_URL } from "@/lib/seo";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import { browserShareCapabilities, buildReminderIcs, handoffUrl, nextLocalTime, shareOrCopy } from "../shared/handoff";
import { EMAIL_RE, FETCH_TIMEOUT_MS, waitlistErrorMessage } from "@/components/waitlist-modal/waitlistUtils";
import { waitlistErrorLabels } from "@/components/waitlist-modal/waitlistLabels";
import type { MobileLandingCopy } from "./useHiveCopy";

export type Platform = "win" | "mac" | "lin";
export type SendMode = "idle" | "busy" | "sent";
export type SentKind = "shared" | "copied" | "joined" | "already";
export type BeamState = "idle" | "sending" | "sent";

/** The waitlist email field (HandoffPoster renders it with this id). */
export const EMAIL_FIELD_ID = "hm-email";
const focusEmail = () => document.getElementById(EMAIL_FIELD_ID)?.focus();

const API_PLATFORM: Record<Exclude<Platform, "win">, string> = { mac: "macos", lin: "linux" };
/** The packet's flight (pkGo) takes 1.15 s; a fast answer waits for it to land. */
const FLIGHT_MS = 1150;

/**
 * The phone-to-computer hand-off, all real behaviour (the winner's was a labelled simulation):
 * Windows sends the site link through the share sheet or the clipboard; macOS and Linux join the
 * existing waitlist (POST /api/waitlist); anyone can copy the link or download a calendar reminder.
 * There is no email service, so "email me the installer" is not offered.
 */
export function useHandoff(c: MobileLandingCopy["cta"], t: Translations, still: boolean, toast: (s: string) => void) {
  const [platform, setPlatformState] = useState<Platform>("win");
  const [mode, setMode] = useState<SendMode>("idle");
  const [sentKind, setSentKind] = useState<SentKind>("shared");
  const [beam, setBeam] = useState<BeamState>("idle");
  const [email, setEmailState] = useState("");
  const [error, setError] = useState("");
  const [manual, setManual] = useState(false);
  const url = handoffUrl(SITE_URL);
  const payload = { url, title: c.shareTitle, text: c.shareText };
  const platformName = { win: t.downloadSection.windows, mac: t.downloadSection.macos, lin: t.downloadSection.linux }[platform];

  const reset = () => {
    setMode("idle");
    setBeam("idle");
    setError("");
    setManual(false);
  };
  const setPlatform = (p: Platform) => {
    setPlatformState(p);
    reset();
  };
  const setEmail = (v: string) => {
    setEmailState(v);
    if (mode === "sent") reset();
    setError("");
  };

  /** Land the beam no sooner than the packet's flight, then show the sent state. */
  const landAfter = (started: number, kind: SentKind) => {
    const wait = still ? 0 : Math.max(0, FLIGHT_MS - (performance.now() - started));
    setTimeout(() => {
      setSentKind(kind);
      setMode("sent");
      setBeam("sent");
    }, wait);
  };

  const shareLink = async () => {
    const started = performance.now();
    setMode("busy");
    setBeam("sending");
    const outcome = await shareOrCopy(payload, browserShareCapabilities());
    if (outcome === "shared" || outcome === "copied") {
      toast(outcome === "shared" ? c.toastShared : c.toastCopied);
      landAfter(started, outcome);
      return;
    }
    reset();
    if (outcome === "failed") setManual(true);
  };

  const joinWaitlist = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError(t.waitlist.invalidEmail);
      focusEmail();
      return;
    }
    const started = performance.now();
    setError("");
    setMode("busy");
    setBeam("sending");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), platform: API_PLATFORM[platform as Exclude<Platform, "win">] }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = typeof data.code === "string" ? data.code : "none";
        captureExceptionScrubbed(new Error(`waitlist POST failed (status=${res.status}, code=${code})`), { tags: { component: "MobileLandingHandoff" } });
        reset();
        setError(waitlistErrorMessage(res.status, data.code, waitlistErrorLabels(t)));
        return;
      }
      landAfter(started, data.duplicate ? "already" : "joined");
    } catch (err) {
      reset();
      if (err instanceof DOMException && err.name === "AbortError") setError(t.waitlist.errorTimeout);
      else {
        captureExceptionScrubbed(err, { tags: { component: "MobileLandingHandoff" } });
        setError(t.waitlist.errorGeneric);
      }
    } finally {
      clearTimeout(timeout);
    }
  };

  /** The dock button on the last poster. */
  const send = () => {
    if (mode === "busy") return;
    if (mode === "sent") {
      reset();
      if (platform !== "win") focusEmail();
      return;
    }
    if (platform === "win") void shareLink();
    else void joinWaitlist();
  };

  const copyLink = async () => {
    const outcome = await shareOrCopy(payload, { clipboard: browserShareCapabilities().clipboard });
    if (outcome === "copied") toast(c.toastCopied);
    else setManual(true);
  };

  const reminder = () => {
    try {
      const now = new Date();
      const ics = buildReminderIcs({
        start: nextLocalTime(now, 9),
        minutes: 15,
        title: c.reminderTitle,
        description: c.reminderBody.replace("{url}", url),
        url,
        uid: `${crypto.randomUUID?.() ?? now.getTime()}@personas.so`,
        stamp: now,
      });
      const href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
      const a = document.createElement("a");
      a.href = href;
      a.download = "personas-install-reminder.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 4000);
      toast(c.reminderToast);
    } catch {
      toast(c.reminderFail);
    }
  };

  return { platform, platformName, setPlatform, mode, sentKind, beam, email, setEmail, error, manual, url, send, copyLink, reminder };
}

export type Handoff = ReturnType<typeof useHandoff>;
