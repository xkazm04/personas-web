import { describe, expect, it } from "vitest";
import type { InflightCommand } from "./commandReducer";
import { SAY_MAX_CHARS, channelSayOutcome, channelSayParams, sayLength } from "./channelSay";
import { redactText } from "./redactText";

/** Short ordinary words, single spaces, exactly n code points, no whitespace at either end. */
const words = (n: number): string => {
  const chars = Array.from("ship it now please ".repeat(Math.ceil(n / 19) + 1)).slice(0, n);
  if (chars[n - 1] === " ") chars[n - 1] = "s";
  return chars.join("");
};

const settled = (over: Partial<InflightCommand>): InflightCommand => ({
  id: "c1",
  verb: "channel_say",
  personaId: "p1",
  status: "completed",
  result: { messageId: "c1", changed: true },
  error: null,
  requestedAt: 0,
  expiresAt: 60_000,
  ...over,
});

describe("channel_say params", () => {
  it("trims the message", () => {
    expect(channelSayParams("  hello \n").message).toBe("hello");
  });

  it("serialises as exactly the one key", () => {
    expect(JSON.stringify(channelSayParams(" ship it "))).toBe('{"message":"ship it"}');
  });

  it("accepts 2000 code points and refuses 2001", () => {
    const ok = words(SAY_MAX_CHARS);
    expect(redactText(ok)).toBe(ok);
    expect(channelSayParams(ok).message).toBe(ok);
    expect(sayLength(channelSayParams(ok).message)).toBe(SAY_MAX_CHARS);
    expect(() => channelSayParams(words(SAY_MAX_CHARS + 1))).toThrow("message_too_long");
  });

  it("counts astral characters as one, so .length and the count differ", () => {
    const ok = "😀".repeat(SAY_MAX_CHARS);
    expect(ok.length).toBe(SAY_MAX_CHARS * 2);
    expect(sayLength(ok)).toBe(SAY_MAX_CHARS);
    expect(channelSayParams(ok).message).toBe(ok);
    expect(() => channelSayParams("😀".repeat(SAY_MAX_CHARS + 1))).toThrow("message_too_long");
  });

  it("counts after the trim", () => {
    const ok = words(SAY_MAX_CHARS);
    expect(redactText(ok)).toBe(ok);
    expect(channelSayParams(`  ${ok}  `).message).toBe(ok);
  });

  it("masks a key from the fixture and keeps the sentence", () => {
    const out = channelSayParams("Deploy failed. I used sk-proj-4f8Kq2Lx9Vb7Nm3Zt6Wy1Rc5Hd0Jg2Pa8Se4Uf for the call.").message;
    expect(out).not.toContain("sk-proj");
    expect(out).toContain("[redacted]");
    expect(out).toBe("Deploy failed. I used [redacted] for the call.");
  });

  it("still serialises a trimmed say as exactly the one key", () => {
    expect(JSON.stringify(channelSayParams(" ship it "))).toBe('{"message":"ship it"}');
  });

  it("refuses a say of exactly 2000 whose masking lengthens it", () => {
    const typed = `${words(SAY_MAX_CHARS - 20)} DB_PASSWORD=hunter2`;
    expect(sayLength(typed)).toBe(SAY_MAX_CHARS);
    expect(Array.from(redactText(typed)).length).toBeGreaterThan(SAY_MAX_CHARS);
    expect(() => channelSayParams(typed)).toThrow("message_too_long");
  });

  it("masks a dense run, as the desk does", () => {
    expect(channelSayParams("a".repeat(SAY_MAX_CHARS)).message).toBe("[redacted]");
  });

  it("refuses an empty or blank message", () => {
    expect(() => channelSayParams("")).toThrow("empty_message");
    expect(() => channelSayParams(" \n\t ")).toThrow("empty_message");
  });
});

describe("channel_say outcome", () => {
  it("completed is delivered, with changed", () => {
    expect(channelSayOutcome(settled({}))).toEqual({ ok: true, messageId: "c1", changed: true });
  });

  it("a re-delivery that wrote nothing is still delivered", () => {
    expect(channelSayOutcome(settled({ result: { messageId: "c1", changed: false } }))).toEqual({ ok: true, messageId: "c1", changed: false });
  });

  it("anything else is a failure carrying the desk's token", () => {
    expect(channelSayOutcome(settled({ status: "failed", result: null, error: "not_app_master" }))).toEqual({ ok: false, reason: "not_app_master" });
    expect(channelSayOutcome(settled({ status: "expired", result: null, error: null }))).toEqual({ ok: false, reason: "expired" });
    expect(channelSayOutcome(null)).toEqual({ ok: false, reason: "unknown" });
  });
});
