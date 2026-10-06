/**
 * Phone -> computer handoff for the /m landings. Personas is a desktop app, so a phone visitor
 * cannot install it; these are the honest ways to carry the intent to their computer, all without
 * a backend: the native share sheet, the clipboard, and a calendar reminder file. (macOS and Linux
 * visitors use the existing waitlist API instead - see waitlist-modal/waitlistUtils.)
 *
 * Pure apart from shareOrCopy, which takes its browser capabilities as an argument so it is
 * testable. Callers create Dates in event handlers, never during render (React purity rule).
 */

/** The page a visitor should open on their computer: the site's download section. */
export function handoffUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/#download-section`;
}

/** The next occurrence of `hour`:00 in local time, strictly after `now`. */
export function nextLocalTime(now: Date, hour: number): Date {
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0);
  if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
  return at;
}

export interface ReminderInput {
  start: Date;
  minutes: number;
  title: string;
  description: string;
  url: string;
  /** Stable unique id, e.g. `${random}@personas.so`. */
  uid: string;
  /** Creation time (DTSTAMP). */
  stamp: Date;
}

const pad = (n: number) => String(n).padStart(2, "0");

function icsUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** RFC 5545 TEXT escaping: backslash, semicolon, comma, newline. */
function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold a content line to 75 octets, continuation lines starting with one space. */
function fold(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    const limit = out.length === 0 ? 75 : 74; // continuation lines carry a leading space
    if (enc.encode(cur + ch).length > limit) {
      out.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.join("\r\n ");
}

/** A one-event calendar file reminding the visitor to install Personas on their computer. */
export function buildReminderIcs(r: ReminderInput): string {
  const end = new Date(r.start.getTime() + r.minutes * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Personas//m handoff//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${r.uid}`,
    `DTSTAMP:${icsUtc(r.stamp)}`,
    `DTSTART:${icsUtc(r.start)}`,
    `DTEND:${icsUtc(end)}`,
    `SUMMARY:${icsText(r.title)}`,
    `DESCRIPTION:${icsText(r.description)}`,
    `URL:${r.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export interface SharePayload {
  url: string;
  title: string;
  text: string;
}

export interface ShareCapabilities {
  share?: (data: SharePayload) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
}

export type ShareOutcome = "shared" | "cancelled" | "copied" | "failed";

/**
 * Prefer the native share sheet (the natural phone -> computer path: AirDrop, a note, a message to
 * yourself); without one, copy the link. "failed" means the UI should show the link for manual copy.
 */
export async function shareOrCopy(payload: SharePayload, caps: ShareCapabilities): Promise<ShareOutcome> {
  if (caps.share) {
    try {
      await caps.share(payload);
      return "shared";
    } catch (err) {
      if ((err as { name?: string } | null)?.name === "AbortError") return "cancelled";
      // Any other share failure falls through to the clipboard.
    }
  }
  if (caps.clipboard) {
    try {
      await caps.clipboard.writeText(payload.url);
      return "copied";
    } catch {
      return "failed";
    }
  }
  return "failed";
}

/** The browser's capabilities, for shareOrCopy. Call only in an event handler. */
export function browserShareCapabilities(): ShareCapabilities {
  if (typeof navigator === "undefined") return {};
  return {
    share: typeof navigator.share === "function" ? (d) => navigator.share(d) : undefined,
    clipboard: navigator.clipboard ? { writeText: (t) => navigator.clipboard.writeText(t) } : undefined,
  };
}
