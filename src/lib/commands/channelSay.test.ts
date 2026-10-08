import { describe, expect, it } from "vitest";
import type { InflightCommand } from "./commandReducer";
import { SAY_MAX_CHARS, channelSayOutcome, channelSayParams, sayLength } from "./channelSay";

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
    expect(channelSayParams("a".repeat(SAY_MAX_CHARS)).message).toHaveLength(SAY_MAX_CHARS);
    expect(() => channelSayParams("a".repeat(SAY_MAX_CHARS + 1))).toThrow("message_too_long");
  });

  it("counts astral characters as one, so .length and the count differ", () => {
    const ok = "😀".repeat(SAY_MAX_CHARS);
    expect(ok.length).toBe(SAY_MAX_CHARS * 2);
    expect(sayLength(ok)).toBe(SAY_MAX_CHARS);
    expect(channelSayParams(ok).message).toBe(ok);
    expect(() => channelSayParams("😀".repeat(SAY_MAX_CHARS + 1))).toThrow("message_too_long");
  });

  it("counts after the trim", () => {
    expect(channelSayParams(`  ${"a".repeat(SAY_MAX_CHARS)}  `).message).toHaveLength(SAY_MAX_CHARS);
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
