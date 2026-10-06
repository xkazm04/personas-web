import { describe, it, expect } from "vitest";
import { scenarios } from "./data";
import { parseClock } from "./timeline-utils";

/**
 * Every chat message carries the clock it was said at, so a message that names
 * how long the run took ("ready in 90 seconds") contradicts the transcript
 * unless it matches that clock. The timestamp is the clock: a line may not
 * claim more elapsed seconds than the moment it appears at.
 */
const ELAPSED_SECONDS = /\b(\d+)\s*(?:s|secs?|seconds?)\b/gi;

describe("chat messages agree with their own timestamps", () => {
  it.each(scenarios)("$id: no message states more elapsed seconds than its clock", (s) => {
    for (const msg of [...s.workflow.messages, ...s.agent.messages]) {
      const clock = parseClock(msg.timestamp);
      for (const m of msg.text.matchAll(ELAPSED_SECONDS)) {
        expect(Number(m[1]), `"${msg.text}" at ${msg.timestamp}`).toBeLessThanOrEqual(clock);
      }
    }
  });
});
