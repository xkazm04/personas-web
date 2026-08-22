import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit, rateLimitGuard } from "./rate-limit";

/**
 * These tests exist because the limiter shipped INVERTED: the waitlist route
 * branched on the negation of the shared predicate, so within every window the
 * first N requests were refused with 429 and every request past the limit was
 * admitted. There was no test over rate-limit.ts or any route handler, which is
 * why it survived review.
 *
 * The direction assertions below are the point. If someone flips the polarity
 * again — in the primitive or in the guard — these fail.
 */

// Buckets are module-level state keyed by `namespace:key`, so every test uses a
// unique namespace rather than trying to reset the shared Map.
let n = 0;
const freshNamespace = () => `test-${process.pid}-${n++}`;

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit direction", () => {
  it("ADMITS the first request and REFUSES the (limit+1)th", () => {
    const opts = { namespace: freshNamespace(), key: "1.2.3.4", limit: 3, windowMs: 60_000 };

    // The first request must be allowed. Under the inverted limiter this was
    // the request that got a 429.
    expect(checkRateLimit(opts).allowed).toBe(true);

    // Exactly `limit` requests fit in the window.
    expect(checkRateLimit(opts).allowed).toBe(true);
    expect(checkRateLimit(opts).allowed).toBe(true);

    // The (limit+1)th is refused — and stays refused. Under the inverted
    // limiter this was the request that got let through.
    expect(checkRateLimit(opts).allowed).toBe(false);
    expect(checkRateLimit(opts).allowed).toBe(false);
  });

  it("admits exactly `limit` requests, not limit-1 and not limit+1", () => {
    const opts = { namespace: freshNamespace(), key: "1.2.3.4", limit: 5, windowMs: 60_000 };
    const verdicts = Array.from({ length: 7 }, () => checkRateLimit(opts).allowed);
    expect(verdicts).toEqual([true, true, true, true, true, false, false]);
  });

  it("keys buckets separately per IP and per namespace", () => {
    const nsA = freshNamespace();
    const nsB = freshNamespace();
    const limit1 = { limit: 1, windowMs: 60_000 };

    expect(checkRateLimit({ namespace: nsA, key: "a", ...limit1 }).allowed).toBe(true);
    expect(checkRateLimit({ namespace: nsA, key: "a", ...limit1 }).allowed).toBe(false);

    // A different IP in the same namespace is unaffected...
    expect(checkRateLimit({ namespace: nsA, key: "b", ...limit1 }).allowed).toBe(true);
    // ...and so is the same IP in a different namespace (one route's budget
    // must not consume another's).
    expect(checkRateLimit({ namespace: nsB, key: "a", ...limit1 }).allowed).toBe(true);
  });

  it("refills the budget once the window has elapsed", () => {
    vi.useFakeTimers();
    const opts = { namespace: freshNamespace(), key: "1.2.3.4", limit: 2, windowMs: 60_000 };

    expect(checkRateLimit(opts).allowed).toBe(true);
    expect(checkRateLimit(opts).allowed).toBe(true);
    expect(checkRateLimit(opts).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(checkRateLimit(opts).allowed).toBe(true);
  });

  it("reports a retry instant that shrinks as the window drains", () => {
    vi.useFakeTimers();
    const opts = { namespace: freshNamespace(), key: "1.2.3.4", limit: 1, windowMs: 60_000 };

    const first = checkRateLimit(opts);
    expect(first.retryAfterSeconds).toBe(60);

    vi.advanceTimersByTime(30_000);
    const refused = checkRateLimit(opts);
    expect(refused.allowed).toBe(false);
    expect(refused.resetAt).toBe(first.resetAt);
    expect(refused.retryAfterSeconds).toBe(30);
  });

  it("never reports a Retry-After below 1 second", () => {
    vi.useFakeTimers();
    const opts = { namespace: freshNamespace(), key: "1.2.3.4", limit: 1, windowMs: 60_000 };

    checkRateLimit(opts);
    vi.advanceTimersByTime(59_999);
    expect(checkRateLimit(opts).retryAfterSeconds).toBe(1);
  });
});

describe("rateLimitGuard refusal contract", () => {
  it("returns null while within budget, so the handler proceeds", () => {
    const opts = { namespace: freshNamespace(), key: "1.2.3.4", limit: 2, windowMs: 60_000 };
    expect(rateLimitGuard(opts)).toBeNull();
    expect(rateLimitGuard(opts)).toBeNull();
  });

  it("returns one 429 shape for every route: status, code, and Retry-After", async () => {
    const opts = { namespace: freshNamespace(), key: "1.2.3.4", limit: 1, windowMs: 60_000 };
    expect(rateLimitGuard(opts)).toBeNull();

    const refusal = rateLimitGuard(opts);
    expect(refusal).not.toBeNull();
    expect(refusal!.status).toBe(429);

    // The stable machine-readable code the browser translates off. Never
    // reword it — see ApiErrorCode in src/lib/server/request.ts.
    await expect(refusal!.json()).resolves.toEqual({
      error: "Too many requests",
      code: "rate_limited",
    });

    // Retry-After is derived from the real window reset, not hardcoded.
    const retryAfter = refusal!.headers.get("Retry-After");
    expect(retryAfter).not.toBeNull();
    expect(Number(retryAfter)).toBeGreaterThan(0);
    expect(Number(retryAfter)).toBeLessThanOrEqual(60);
  });
});
