import { describe, expect, it, vi } from "vitest";
import { buildReminderIcs, handoffUrl, nextLocalTime, shareOrCopy } from "./handoff";

describe("handoffUrl", () => {
  it("points at the desktop download section of the site, without a doubled slash", () => {
    expect(handoffUrl("https://personas.so")).toBe("https://personas.so/#download-section");
    expect(handoffUrl("https://personas.so/")).toBe("https://personas.so/#download-section");
  });
});

describe("nextLocalTime", () => {
  it("returns today at the hour when it is still ahead", () => {
    const now = new Date(2026, 9, 6, 7, 30);
    expect(nextLocalTime(now, 9)).toEqual(new Date(2026, 9, 6, 9, 0));
  });
  it("rolls to tomorrow once the hour has passed", () => {
    const now = new Date(2026, 9, 6, 9, 0);
    expect(nextLocalTime(now, 9)).toEqual(new Date(2026, 9, 7, 9, 0));
  });
});

describe("buildReminderIcs", () => {
  const ics = buildReminderIcs({
    start: new Date(Date.UTC(2026, 9, 7, 7, 0)),
    minutes: 15,
    title: "Install Personas, on your computer",
    description: "Open this on your computer; it is a desktop app.\nThree steps, a few minutes.",
    url: "https://personas.so/#download-section",
    uid: "abc123@personas.so",
    stamp: new Date(Date.UTC(2026, 9, 6, 12, 0)),
  });

  it("is a single VEVENT with UTC times and CRLF line ends", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("\r\nDTSTART:20261007T070000Z\r\n");
    expect(ics).toContain("\r\nDTEND:20261007T071500Z\r\n");
    expect(ics).toContain("\r\nDTSTAMP:20261006T120000Z\r\n");
    expect(ics).toContain("\r\nUID:abc123@personas.so\r\n");
    expect(ics.replace(/\r\n/g, "").includes("\n")).toBe(false);
  });

  it("escapes text per RFC 5545 (newline, comma, semicolon)", () => {
    // Readers unfold (CRLF + one space) before parsing; assert on the unfolded text.
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain("SUMMARY:Install Personas\\, on your computer");
    expect(unfolded).toContain("DESCRIPTION:Open this on your computer\\; it is a desktop app.\\nThree steps\\, a few minutes.");
  });

  it("folds lines longer than 75 octets", () => {
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});

describe("shareOrCopy", () => {
  const payload = { url: "https://personas.so/#download-section", title: "Personas", text: "Open on your computer" };

  it("uses the native share sheet when there is one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    expect(await shareOrCopy(payload, { share, clipboard: undefined })).toBe("shared");
    expect(share).toHaveBeenCalledWith(payload);
  });

  it("treats a dismissed share sheet as cancelled, not as a failure to copy", async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error("x"), { name: "AbortError" }));
    const writeText = vi.fn();
    expect(await shareOrCopy(payload, { share, clipboard: { writeText } })).toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to the clipboard without a share sheet", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareOrCopy(payload, { share: undefined, clipboard: { writeText } })).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(payload.url);
  });

  it("reports failed when neither works, so the UI can show the link to copy by hand", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    expect(await shareOrCopy(payload, { share: undefined, clipboard: { writeText } })).toBe("failed");
  });
});
