"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_URL } from "@/lib/seo";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import { legacyCopyToClipboard } from "@/components/waitlist-modal/waitlistUtils";
import {
  browserShareCapabilities,
  buildReminderIcs,
  handoffUrl,
  nextLocalTime,
  shareOrCopy,
  type ShareCapabilities,
  type ShareOutcome,
} from "../shared/handoff";
import { BUILD_ROUTES, initialHandoff, reduce, view, type HandoffEvent, type HandoffPlatform, type HandoffState } from "../shared/handoffMachine";
import { submitWaitlist } from "../shared/submitWaitlist";
import { REMINDER_HOUR, REMINDER_MINUTES } from "./data";
import { fill, type ClockCopy } from "./copy";

/** The clipboard, with the textarea fallback for browsers without the async API. */
function clipboardOnly(): ShareCapabilities {
  const caps = browserShareCapabilities();
  return {
    clipboard: caps.clipboard ?? {
      writeText: async (text) => {
        if (!legacyCopyToClipboard(text)) throw new Error("copy refused");
      },
    },
  };
}

/** The m2 waitlist email field (Waitlist renders it with this id). */
export const WAITLIST_FIELD_ID = "m2-mail";

const reportWaitlist = (err: unknown) => captureExceptionScrubbed(err, { tags: { component: "MobileLanding2Waitlist" } });

/**
 * The phone -> computer handoff: share the download link to yourself, copy it, or save a
 * calendar reminder for the next 9:00 (all local: nothing is uploaded), or join a platform's
 * waitlist. Which platform gets which comes from the shared machine (shared/handoffMachine),
 * routed by DOWNLOAD_PLAN; it also refuses a second submit while one is in flight and drops a
 * result whose platform the visitor has already left. When neither share nor copy works,
 * `manual` asks the page to show the link for copying by hand.
 */
export function useHandoff(c: ClockCopy, toast: (msg: string) => void) {
  const [manual, setManual] = useState(false);
  const [state, setState] = useState<HandoffState>(() => initialHandoff());
  const [email, setEmailState] = useState("");
  const stateRef = useRef(state);
  const flightRef = useRef<AbortController | null>(null);
  useEffect(() => () => flightRef.current?.abort(), []);

  const dispatch = (event: HandoffEvent) => {
    const [next, effect] = reduce(stateRef.current, event);
    if (next !== stateRef.current) {
      stateRef.current = next;
      setState(next);
    }
    return effect;
  };

  const submit = async () => {
    const effect = dispatch({ type: "submit", email });
    if (effect?.kind === "focus") document.getElementById(WAITLIST_FIELD_ID)?.focus();
    if (effect?.kind !== "post") return;
    const controller = new AbortController();
    flightRef.current = controller;
    const r = await submitWaitlist({ email: effect.email, platform: effect.platform }, { signal: controller.signal, report: reportWaitlist });
    if (flightRef.current === controller) flightRef.current = null;
    if (r.kind === "joined" || r.kind === "duplicate" || r.kind === "aborted") dispatch({ type: "result", token: effect.token, outcome: r.kind });
    else dispatch({ type: "result", token: effect.token, outcome: "error", code: r.kind === "error" ? r.code : "invalid" });
  };
  const url = handoffUrl(SITE_URL);
  const payload = { url, title: c.share.title, text: c.share.text };

  function report(out: ShareOutcome) {
    if (out === "shared") toast(c.toast.shared);
    else if (out === "copied") toast(c.toast.copied);
    if (out === "failed") setManual(true);
  }

  return {
    url,
    manual,
    state,
    view: view(state),
    routes: BUILD_ROUTES,
    email,
    setEmail: (v: string) => {
      setEmailState(v);
      dispatch({ type: "edit" });
    },
    setPlatform: (p: HandoffPlatform) => {
      flightRef.current?.abort();
      flightRef.current = null;
      dispatch({ type: "platform", platform: p });
    },
    submit: () => void submit(),
    share: async () => report(await shareOrCopy(payload, { ...browserShareCapabilities(), ...clipboardOnly() })),
    copy: async () => report(await shareOrCopy(payload, clipboardOnly())),
    remind: () => {
      try {
        // Dates are made here, in the click, never during render.
        const now = new Date();
        const start = nextLocalTime(now, REMINDER_HOUR);
        const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : now.getTime().toString(36);
        const ics = buildReminderIcs({
          start,
          minutes: REMINDER_MINUTES,
          title: c.ics.title,
          description: fill(c.ics.description, { url }),
          url,
          uid: `${id}@personas.so`,
          stamp: now,
        });
        const href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = href;
        a.download = c.ics.file;
        document.body.appendChild(a);
        a.click();
        window.setTimeout(() => {
          URL.revokeObjectURL(href);
          a.remove();
        }, 1500);
        const day = start.toLocaleDateString(undefined, { weekday: "long" });
        toast(fill(c.toast.reminder, { day }));
      } catch {
        toast(c.toast.reminderFailed);
      }
    },
  };
}
