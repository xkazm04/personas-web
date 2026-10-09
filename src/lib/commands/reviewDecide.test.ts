import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUTO_APPROVE_NOTE } from "../review-display";
import { redactText } from "./redactText";
import { buildEnvelope } from "./envelope";
import type { InflightCommand } from "./commandReducer";
import { REVIEW_NOTES_MAX, reviewCommandOutcome, reviewDecideParams, reviewTargetDevice } from "./reviewDecide";

const T0 = Date.parse("2026-10-07T09:00:00.000Z");

const settled = (over: Partial<InflightCommand>): InflightCommand => ({
  id: "c1",
  verb: "review_decide",
  personaId: "p1",
  status: "completed",
  result: { reviewId: "r1", status: "approved", changed: true },
  error: null,
  requestedAt: T0,
  expiresAt: T0 + 60_000,
  ...over,
});

describe("review_decide (PHASE2-SPEC.md 1.6, 2.2; PLAN M20)", () => {
  it("params carry reviewId, decision, notes in the contract's key order; empty notes are null", () => {
    expect(JSON.stringify(reviewDecideParams("r1", "approved", ""))).toBe('{"reviewId":"r1","decision":"approved","notes":null}');
    expect(JSON.stringify(reviewDecideParams("r1", "rejected", "   "))).toBe('{"reviewId":"r1","decision":"rejected","notes":null}');
    expect(JSON.stringify(reviewDecideParams("r1", "rejected", undefined))).toBe('{"reviewId":"r1","decision":"rejected","notes":null}');
    expect(JSON.stringify(reviewDecideParams("r1", "rejected", "flaky is not green"))).toBe(
      '{"reviewId":"r1","decision":"rejected","notes":"flaky is not green"}',
    );
  });

  it("the signed envelope bytes for a review verdict are exact", () => {
    const envelope = buildEnvelope({
      id: "8f0c1b2a-3d4e-4f50-8a6b-7c8d9e0f1a2b",
      dev: "desk-1",
      type: "review_decide",
      persona: "persona-7",
      params: { ...reviewDecideParams("rev-42", "approved", "ship it") },
      iat: "2026-10-07T09:00:00.000Z",
      exp: "2026-10-07T09:01:00.000Z",
      ctl: "0c2b9a8f-7e6d-4c5b-8a49-3827160f5e4d",
    });
    expect(envelope).toBe(
      '{"v":1,"id":"8f0c1b2a-3d4e-4f50-8a6b-7c8d9e0f1a2b","dev":"desk-1","type":"review_decide","persona":"persona-7",' +
        '"params":{"reviewId":"rev-42","decision":"approved","notes":"ship it"},' +
        '"iat":"2026-10-07T09:00:00.000Z","exp":"2026-10-07T09:01:00.000Z","ctl":"0c2b9a8f-7e6d-4c5b-8a49-3827160f5e4d"}',
    );
  });

  it("notes over the contract's 2000 characters are refused, not cut", () => {
    expect(() => reviewDecideParams("r1", "approved", "a".repeat(REVIEW_NOTES_MAX))).not.toThrow();
    expect(() => reviewDecideParams("r1", "approved", "a".repeat(REVIEW_NOTES_MAX + 1))).toThrow(/notes_too_long/);
  });

  it("targets the review's desktop, else the persona's", () => {
    expect(reviewTargetDevice("dev-review", "dev-persona")).toBe("dev-review");
    expect(reviewTargetDevice(null, "dev-persona")).toBe("dev-persona");
    expect(reviewTargetDevice(undefined, null)).toBeNull();
  });

  it("only a completed command is a verdict; failed, refused, expired and an unknown command are failures with their reason", () => {
    expect(reviewCommandOutcome(settled({}))).toEqual({ ok: true });
    // Already decided on the desktop: completed, changed false. The verdict stands.
    expect(reviewCommandOutcome(settled({ result: { reviewId: "r1", status: "rejected", changed: false } }))).toEqual({ ok: true });
    expect(reviewCommandOutcome(settled({ status: "failed", error: "not_found" }))).toEqual({ ok: false, reason: "not_found" });
    expect(reviewCommandOutcome(settled({ status: "rejected", error: "controller_revoked" }))).toEqual({ ok: false, reason: "controller_revoked" });
    expect(reviewCommandOutcome(settled({ status: "expired", error: null }))).toEqual({ ok: false, reason: "expired" });
    expect(reviewCommandOutcome(null)).toEqual({ ok: false, reason: "unknown" });
  });
});

describe("review notes are masked before signing", () => {
  const fixture = JSON.parse(readFileSync(join(process.cwd(), "fixtures", "redact-text-v1.json"), "utf8")) as {
    cases: { name: string; input: string; expected: string }[];
  };
  const len = (s: string) => Array.from(s).length;

  it("a note carrying a fixture secret comes back masked", () => {
    const c = fixture.cases.find((x) => x.expected !== x.input && x.expected.includes("[redacted]"))!;
    const out = reviewDecideParams("r1", "approved", c.input).notes!;
    expect(out).toBe(c.expected);
    expect(out).toContain("[redacted]");
  });

  it("an ordinary note serializes exactly as before", () => {
    expect(JSON.stringify(reviewDecideParams("r1", "approved", "flaky is not green"))).toBe(
      '{"reviewId":"r1","decision":"approved","notes":"flaky is not green"}',
    );
  });

  it("a note at the cap that masking lengthens throws notes_too_long", () => {
    const tail = " DB_PASSWORD=hunter2";
    const note = "word ".repeat(Math.ceil((REVIEW_NOTES_MAX - tail.length) / 5)).slice(0, REVIEW_NOTES_MAX - tail.length) + tail;
    expect(len(note)).toBe(REVIEW_NOTES_MAX);
    expect(len(redactText(note))).toBeGreaterThan(REVIEW_NOTES_MAX);
    expect(() => reviewDecideParams("r1", "approved", note)).toThrow("notes_too_long");
  });

  it("the cap counts code points, not UTF-16 units", () => {
    const ok = Array.from({ length: REVIEW_NOTES_MAX }, (_, i) => (i % 2 === 0 ? "😀" : " ")).join("");
    expect(len(ok)).toBe(REVIEW_NOTES_MAX);
    expect(ok.length).toBeGreaterThan(REVIEW_NOTES_MAX);
    expect(redactText(ok)).toBe(ok);
    expect(reviewDecideParams("r1", "approved", ok).notes).toBe(ok);
    expect(() => reviewDecideParams("r1", "approved", ok + "x")).toThrow("notes_too_long");
  });

  it("a dense run at the cap is masked whole", () => {
    expect(reviewDecideParams("r1", "approved", "a".repeat(REVIEW_NOTES_MAX)).notes).toBe("[redacted]");
  });

  it("the system's auto-approve note is unchanged", () => {
    expect(reviewDecideParams("r1", "approved", AUTO_APPROVE_NOTE).notes).toBe(AUTO_APPROVE_NOTE);
  });
});
