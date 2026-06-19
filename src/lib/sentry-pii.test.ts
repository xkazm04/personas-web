import { describe, it, expect } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";
import { scrubPii, scrubEvent } from "./sentry-pii";

describe("scrubPii", () => {
  it("reduces UUIDs to a short correlation marker", () => {
    expect(scrubPii("exec 550e8400-e29b-41d4-a716-446655440000 done")).toBe("exec [id:550e84] done");
  });

  it("redacts bare emails", () => {
    expect(scrubPii("contact alice@example.com now")).toBe("contact [redacted-email] now");
  });

  it("leaves PII-free strings unchanged", () => {
    expect(scrubPii("execution completed in 1.8s")).toBe("execution completed in 1.8s");
  });
});

describe("scrubEvent depth cap (Wave-3 fix #2)", () => {
  it("redacts values nested past the scrub-depth cap instead of passing them through", () => {
    // 8 levels deep — past MAX_SCRUB_DEPTH (6). The old code returned the raw
    // subtree here, leaking the email; the fix returns "[redacted-depth]".
    const deep = { l1: { l2: { l3: { l4: { l5: { l6: { l7: { l8: { leak: "deep@leak.com" } } } } } } } } };
    const event = { contexts: { trace: deep } } as unknown as ErrorEvent;
    const out = JSON.stringify(scrubEvent(event));
    expect(out).toContain("[redacted-depth]");
    expect(out).not.toContain("deep@leak.com");
  });
});
