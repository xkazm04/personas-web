"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/i18n/en";
import { SITE_URL } from "@/lib/seo";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import { SHARE_ROUTES, browserShareCapabilities, buildReminderIcs, handoffUrl, nextLocalTime, phoneSendAction, shareOrCopy, waitlistPlatforms } from "../shared/handoff";
import { BUILD_ROUTES, initialHandoff, reduce, view, type HandoffEffect, type HandoffError, type HandoffEvent, type HandoffOutcome, type HandoffPlatform, type HandoffState } from "../shared/handoffMachine";
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
/** The opt-in panel's platforms: those without a live installer (DOWNLOAD_PLAN). */
const WAITLIST: Platform[] = waitlistPlatforms().map((p) => FROM_MACHINE[p]);
/** The packet's flight (pkGo) takes 1.15 s; a fast answer waits for it to land. */
const FLIGHT_MS = 1150;

/**
 * Two lanes on the one shared machine: `send` runs it with every route "share" (the one link, for
 * everyone), `join` with the build's routes, for the opt-in waitlist panel.
 */
type Lane = "send" | "join";
const LANE_ROUTES = { send: SHARE_ROUTES, join: BUILD_ROUTES };
type Lanes = Record<Lane, HandoffState>;

const OUTCOME: Record<WaitlistResult["kind"], HandoffOutcome> = { invalid: "error", joined: "joined", duplicate: "duplicate", aborted: "aborted", error: "error" };
const report = (err: unknown) => captureExceptionScrubbed(err, { tags: { component: "MobileLandingHandoff" } });

/**
 * The phone-to-computer hand-off. The phone cannot know which computer its visitor owns, so the
 * dock sends the one link to everyone (share sheet, else clipboard); the link is marked as a phone
 * hand-off and the computer's download section picks its own installer or waitlist. A visitor who
 * opens the "email me when it is ready" panel picks a platform without an installer and joins its
 * waitlist (POST /api/waitlist) instead. Copy link and a calendar reminder work for everyone.
 * There is no email service, so "email me the installer" is not offered.
 */
export function useHandoff(c: MobileLandingCopy["cta"], t: Translations, still: boolean, toast: (s: string) => void) {
  const [lanes, setLanes] = useState<Lanes>(() => ({
    send: initialHandoff(SHARE_ROUTES),
    join: initialHandoff(BUILD_ROUTES, TO_MACHINE[WAITLIST[0] ?? "win"]),
  }));
  const [optIn, setOptIn] = useState(false);
  const [email, setEmailState] = useState("");
  const lanesRef = useRef(lanes);
  /** Each lane's beam-landing timer, and the in-flight POST; abandoned on platform change / unmount. */
  const landRef = useRef<Record<Lane, ReturnType<typeof setTimeout> | null>>({ send: null, join: null });
  const flightRef = useRef<AbortController | null>(null);
  const url = handoffUrl(SITE_URL, "m");
  const payload = { url, title: c.shareTitle, text: c.shareText };
  const platform = FROM_MACHINE[lanes.join.platform];
  const platformName = { win: t.downloadSection.windows, mac: t.downloadSection.macos, lin: t.downloadSection.linux }[platform];
  const action = phoneSendAction({ platform: lanes.join.platform, email, optIn: optIn ? "waitlist" : undefined });
  const active: Lane = action.kind === "waitlist" ? "join" : "send";

  const abandon = (lane: Lane) => {
    const timer = landRef.current[lane];
    if (timer) clearTimeout(timer);
    landRef.current[lane] = null;
    if (lane === "join") {
      flightRef.current?.abort();
      flightRef.current = null;
    }
  };
  useEffect(
    () => () => {
      abandon("send");
      abandon("join");
    },
    [],
  );

  const dispatch = (lane: Lane, event: HandoffEvent): HandoffEffect | null => {
    const [next, effect] = reduce(lanesRef.current[lane], event, LANE_ROUTES[lane]);
    if (next !== lanesRef.current[lane]) {
      lanesRef.current = { ...lanesRef.current, [lane]: next };
      setLanes(lanesRef.current);
    }
    return effect;
  };
  /** True while the submission `token` is still the one the lane's machine waits on. */
  const inFlight = (lane: Lane, token: number) => lanesRef.current[lane].phase === "busy" && lanesRef.current[lane].token === token;

  /** Land the beam no sooner than the packet's flight; the machine drops it if the token moved on. */
  const landAfter = (lane: Lane, started: number, token: number, outcome: HandoffOutcome, code?: HandoffError) => {
    const wait = still ? 0 : Math.max(0, FLIGHT_MS - (performance.now() - started));
    landRef.current[lane] = setTimeout(() => {
      landRef.current[lane] = null;
      dispatch(lane, { type: "result", token, outcome, code });
    }, wait);
  };

  const run = async (lane: Lane, effect: HandoffEffect | null) => {
    if (!effect) return;
    if (effect.kind === "focus") return focusEmail();
    const started = performance.now();
    if (effect.kind === "share") {
      const outcome = await shareOrCopy(payload, browserShareCapabilities());
      if (!inFlight(lane, effect.token)) return;
      if (outcome === "shared" || outcome === "copied") {
        toast(outcome === "shared" ? c.toastShared : c.toastCopied);
        landAfter(lane, started, effect.token, outcome);
      } else {
        dispatch(lane, { type: "result", token: effect.token, outcome: outcome === "failed" ? "manual" : "cancelled" });
      }
      return;
    }
    const controller = new AbortController();
    flightRef.current = controller;
    const result = await submitWaitlist({ email: effect.email, platform: effect.platform }, { signal: controller.signal, report });
    if (flightRef.current === controller) flightRef.current = null;
    if (!inFlight(lane, effect.token)) return;
    if (result.kind === "joined" || result.kind === "duplicate") landAfter(lane, started, effect.token, OUTCOME[result.kind]);
    else dispatch(lane, { type: "result", token: effect.token, outcome: OUTCOME[result.kind], code: result.kind === "error" ? result.code : result.kind === "invalid" ? "invalid" : undefined });
    if (result.kind === "invalid") focusEmail();
  };

  const setPlatform = (p: Platform) => {
    abandon("join");
    dispatch("join", { type: "platform", platform: TO_MACHINE[p] });
  };
  const setEmail = (v: string) => {
    setEmailState(v);
    dispatch("join", { type: "edit" });
  };
  /** Open or close the "email me when it is ready" panel; opening moves focus to its email field. */
  const toggleOptIn = () => {
    const open = !optIn;
    setOptIn(open);
    if (open) setTimeout(focusEmail, 0);
  };

  /** The dock button on the last poster: the one link, or the opted-in waitlist. */
  const send = () => void run(active, dispatch(active, { type: "submit", email }));
  /** Enter / submit inside the opt-in panel: always the waitlist. */
  const join = () => void run("join", dispatch("join", { type: "submit", email }));

  const copyLink = async () => {
    const outcome = await shareOrCopy(payload, { clipboard: browserShareCapabilities().clipboard });
    if (outcome === "copied") toast(c.toastCopied);
    else dispatch("send", { type: "manual" });
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

  const lane = lanes[active];
  const v = view(lane);
  const beam: BeamState = lane.phase === "busy" ? "sending" : lane.phase === "sent" ? "sent" : "idle";
  const error = v.error ? waitlistErrorText(v.error, { ...waitlistErrorLabels(t), errorTimeout: t.waitlist.errorTimeout }) : "";
  /** Show the link for copying by hand once share and copy both failed. */
  const manual = lanes.send.phase === "idle" && lanes.send.manual;

  return { platform, platformName, setPlatform, waitlist: WAITLIST, optIn, toggleOptIn, lane: active, view: v, beam, email, setEmail, error, manual, url, send, join, copyLink, reminder };
}

export type Handoff = ReturnType<typeof useHandoff>;
