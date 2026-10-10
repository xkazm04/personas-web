import { afterEach, describe, expect, it, vi } from "vitest";
import { FETCH_TIMEOUT_MS } from "@/components/waitlist-modal/waitlistUtils";
import { submitWaitlist } from "./submitWaitlist";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => {
  vi.useRealTimers();
});

describe("submitWaitlist: the one POST /api/waitlist client for the phone landings", () => {
  it("refuses an invalid email without posting", async () => {
    const stub = vi.fn();
    expect(await submitWaitlist({ email: "a@b", platform: "macos" }, { fetch: stub })).toEqual({ kind: "invalid" });
    expect(stub).toHaveBeenCalledTimes(0);
  });

  it("posts exactly {email, platform} with the email trimmed", async () => {
    const stub = vi.fn(async (..._args: unknown[]) => json(200, { count: 1 }));
    expect(await submitWaitlist({ email: " visitor@example.com ", platform: "macos" }, { fetch: stub })).toEqual({ kind: "joined" });
    expect(stub).toHaveBeenCalledTimes(1);
    const [url, init] = stub.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/waitlist");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ email: "visitor@example.com", platform: "macos" });
    expect(Object.keys(JSON.parse(init.body as string))).toEqual(["email", "platform"]);
  });

  it("maps a 429 with no code to rate_limited", async () => {
    const r = await submitWaitlist({ email: "visitor@example.com", platform: "linux" }, { fetch: async () => json(429, {}) });
    expect(r).toEqual({ kind: "error", code: "rate_limited" });
  });

  it("maps 200 {duplicate:true} to duplicate", async () => {
    const r = await submitWaitlist({ email: "visitor@example.com", platform: "linux" }, { fetch: async () => json(200, { duplicate: true }) });
    expect(r).toEqual({ kind: "duplicate" });
  });

  it("reports a 503 store_unavailable once and returns its code", async () => {
    const report = vi.fn();
    const r = await submitWaitlist({ email: "visitor@example.com", platform: "windows" }, { fetch: async () => json(503, { code: "store_unavailable" }), report });
    expect(r).toEqual({ kind: "error", code: "store_unavailable" });
    expect(report).toHaveBeenCalledTimes(1);
  });

  it("times out a never-resolving fetch without reporting it", async () => {
    vi.useFakeTimers();
    const report = vi.fn();
    const pending = submitWaitlist({ email: "visitor@example.com", platform: "macos" }, { fetch: () => new Promise<Response>(() => {}), report });
    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS);
    expect(await pending).toEqual({ kind: "error", code: "timeout" });
    expect(report).not.toHaveBeenCalled();
  });

  it("is silent when the caller aborts first", async () => {
    const report = vi.fn();
    const controller = new AbortController();
    const pending = submitWaitlist({ email: "visitor@example.com", platform: "macos" }, { fetch: () => new Promise<Response>(() => {}), report, signal: controller.signal });
    controller.abort();
    expect(await pending).toEqual({ kind: "aborted" });
    expect(report).not.toHaveBeenCalled();
  });
});
