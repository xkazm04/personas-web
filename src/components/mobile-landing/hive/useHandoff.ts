"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/i18n/en";
import { SITE_URL } from "@/lib/seo";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import { browserShareCapabilities, buildReminderIcs, handoffUrl, nextLocalTime, shareOrCopy } from "../shared/handoff";
import { initialHandoff, reduce, view, type HandoffEffect, type HandoffError, type HandoffEvent, type HandoffOutcome, type HandoffPlatform, type HandoffState } from "../shared/handoffMachine";
import { submitWaitlist, waitlistErrorText, type WaitlistResult } from "../shared/submitWaitlist";
import { waitlistErrorLabels } from "@/components/waitlist-modal/waitlistLabels";
import type { MobileLandingCopy } from "./useHiveCopy";

/** The hive's short platform keys (HiveLanding's names map, the radio's data-p). */
export type Platform = "win" | "mac" | "lin";
export type BeamState = "idle" | "sending" | "sent";

/** The waitlist email field (HandoffPoster renders it with this id). */
export const EMAIL_FIELD_ID = "hm-email";
const focusEmail = () => document.getElementById(EMAIL_FIELD_ID)?.focus();

const TO_MACHINE: Record<Platform, HandoffPlatform> = { win: "windows", mac: "macos", lin: "linux" };
const FROM_MACHINE: Record<HandoffPlatform, Platform> = { windows: "win", macos: "mac", linux: "lin" };
/** The packet's flight (pkGo) takes 1.15 s; a fast answer waits for it to land. */
const FLIGHT_MS = 1150;

const OUTCOME: Record<WaitlistResult["kind"], HandoffOutcome> = { invalid: "error", joined: "joined", duplicate: "duplicate", aborted: "aborted", error: "error" };
const report = (err: unknown) => captureExceptionScrubbed(err, { tags: { component: "MobileLandingHandoff" } });

/**
 * The phone-to-computer hand-off, driven by the shared machine (shared/handoffMachine): each
 * platform shares the link when its installer is live (DOWNLOAD_PLAN) and joins the waitlist
 * otherwise (POST /api/waitlist); anyone can copy the link or download a calendar reminder.
 * There is no email service, so "email me the installer" is not offered.
 */
export function useHandoff(c: MobileLandingCopy["cta"], t: Translations, still: boolean, toast: (s: string) => void) {
  const [state, setState] = useState<HandoffState>(() => initialHandoff());
  const [email, setEmailState] = useState("");
  const stateRef = useRef(state);
  /** The beam's landing timer and the in-flight POST, both abandoned on platform change / unmount. */
  const landRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flightRef = useRef<AbortController | null>(null);
  const url = handoffUrl(SITE_URL);
  const payload = { url, title: c.shareTitle, text: c.shareText };
  const platform = FROM_MACHINE[state.platform];
  const platformName = { win: t.downloadSection.windows, mac: t.downloadSection.macos, lin: t.downloadSection.linux }[platform];

  const abandon = () => {
    if (landRef.current) clearTimeout(landRef.current);
    landRef.current = null;
    flightRef.current?.abort();
    flightRef.current = null;
  };
  useEffect(() => abandon, []);

  const dispatch = (event: HandoffEvent): HandoffEffect | null => {
    const [next, effect] = reduce(stateRef.current, event);
    if (next !== stateRef.current) {
      stateRef.current = next;
      setState(next);
    }
    return effect;
  };
  /** True while the submission `token` is still the one the machine waits on. */
  const inFlight = (token: number) => stateRef.current.phase === "busy" && stateRef.current.token === token;

  /** Land the beam no sooner than the packet's flight; the machine drops it if the token moved on. */
  const landAfter = (started: number, token: number, outcome: HandoffOutcome, code?: HandoffError) => {
    const wait = still ? 0 : Math.max(0, FLIGHT_MS - (performance.now() - started));
    landRef.current = setTimeout(() => {
      landRef.current = null;
      dispatch({ type: "result", token, outcome, code });
    }, wait);
  };

  const run = async (effect: HandoffEffect | null) => {
    if (!effect) return;
    if (effect.kind === "focus") return focusEmail();
    const started = performance.now();
    if (effect.kind === "share") {
      const outcome = await shareOrCopy(payload, browserShareCapabilities());
      if (!inFlight(effect.token)) return;
      if (outcome === "shared" || outcome === "copied") {
        toast(outcome === "shared" ? c.toastShared : c.toastCopied);
        landAfter(started, effect.token, outcome);
      } else {
        dispatch({ type: "result", token: effect.token, outcome: outcome === "failed" ? "manual" : "cancelled" });
      }
      return;
    }
    const controller = new AbortController();
    flightRef.current = controller;
    const result = await submitWaitlist({ email: effect.email, platform: effect.platform }, { signal: controller.signal, report });
    if (flightRef.current === controller) flightRef.current = null;
    if (!inFlight(effect.token)) return;
    if (result.kind === "joined" || result.kind === "duplicate") landAfter(started, effect.token, OUTCOME[result.kind]);
    else dispatch({ type: "result", token: effect.token, outcome: OUTCOME[result.kind], code: result.kind === "error" ? result.code : result.kind === "invalid" ? "invalid" : undefined });
    if (result.kind === "invalid") focusEmail();
  };

  const setPlatform = (p: Platform) => {
    abandon();
    dispatch({ type: "platform", platform: TO_MACHINE[p] });
  };
  const setEmail = (v: string) => {
    setEmailState(v);
    dispatch({ type: "edit" });
  };

  /** The dock button on the last poster (and Enter in the email field). */
  const send = () => void run(dispatch({ type: "submit", email }));

  const copyLink = async () => {
    const outcome = await shareOrCopy(payload, { clipboard: browserShareCapabilities().clipboard });
    if (outcome === "copied") toast(c.toastCopied);
    else dispatch({ type: "manual" });
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

  const v = view(state);
  const beam: BeamState = state.phase === "busy" ? "sending" : state.phase === "sent" ? "sent" : "idle";
  const error = v.error ? waitlistErrorText(v.error, { ...waitlistErrorLabels(t), errorTimeout: t.waitlist.errorTimeout }) : "";

  return { platform, platformName, setPlatform, view: v, beam, email, setEmail, error, url, send, copyLink, reminder };
}

export type Handoff = ReturnType<typeof useHandoff>;
