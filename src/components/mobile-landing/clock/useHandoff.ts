"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/seo";
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

/**
 * The phone -> computer handoff: share the download link to yourself, copy it, or save a
 * calendar reminder for the next 9:00. All real, all local: nothing is uploaded. When neither
 * share nor copy works, `manual` asks the page to show the link for copying by hand.
 */
export function useHandoff(c: ClockCopy, toast: (msg: string) => void) {
  const [manual, setManual] = useState(false);
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
