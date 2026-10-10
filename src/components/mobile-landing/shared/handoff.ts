/**
 * Phone -> computer handoff for the /m landings. Personas is a desktop app, so a phone visitor
 * cannot install it; these are the honest ways to carry the intent to their computer, all without
 * a backend: the native share sheet, the clipboard, and a calendar reminder file.
 *
 * A phone cannot know which computer its owner has, so the primary action is the same for everyone:
 * send the one link (phoneSendAction). The link is marked as a phone hand-off (handoffUrl), and the
 * computer's download section picks its own installer or waitlist (src/lib/handoff-arrival.ts).
 * A platform's waitlist stays on the phone as an explicit, secondary opt-in.
 *
 * Pure apart from shareOrCopy, which takes its browser capabilities as an argument so it is
 * testable. Callers create Dates in event handlers, never during render (React purity rule).
 */
import { handoffQuery, type HandoffSource } from "@/lib/handoff-arrival";
import { BUILD_ROUTES, type HandoffPlatform, type HandoffRoutes } from "./handoffMachine";

/**
 * The page a visitor should open on their computer: the site's download section. A phone landing
 * passes its `source`, which marks the link as a phone hand-off (two fixed tokens, before the hash);
 * without one (the dashboard's reachability notice) the link stays bare.
 */
export function handoffUrl(siteUrl: string, source?: HandoffSource): string {
  return `${siteUrl.replace(/\/+$/, "")}/${source ? handoffQuery(source) : ""}#download-section`;
}

export type PhoneSendAction = { kind: "share-link" } | { kind: "waitlist"; platform: HandoffPlatform };

export interface PhoneSendInput {
  /** The platform picked in the opt-in waitlist panel. */
  platform: HandoffPlatform;
  /** The typed email. It never decides the route: the waitlist machine validates it. */
  email?: string;
  /** Set only while the visitor has opened the "email me when it is ready" panel. */
  optIn?: "waitlist";
}

/**
 * What the phone's primary button does. Everyone sends the one link; only a visitor who opted into
 * the waitlist panel joins it, and only for a platform with no live installer.
 */
export function phoneSendAction(input: PhoneSendInput, routes: HandoffRoutes = BUILD_ROUTES): PhoneSendAction {
  if (input.optIn === "waitlist" && routes[input.platform] === "waitlist") return { kind: "waitlist", platform: input.platform };
  return { kind: "share-link" };
}

const ALL_PLATFORMS: HandoffPlatform[] = ["windows", "macos", "linux"];

/** The platforms the opt-in waitlist panel offers: those without a live installer, in display order. */
export function waitlistPlatforms(routes: HandoffRoutes = BUILD_ROUTES): HandoffPlatform[] {
  return ALL_PLATFORMS.filter((p) => routes[p] === "waitlist");
}

/** Every route "share": the machine as the one-link sender. */
export const SHARE_ROUTES: HandoffRoutes = { windows: "share", macos: "share", linux: "share" };

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
