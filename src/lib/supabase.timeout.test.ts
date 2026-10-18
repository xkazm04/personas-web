import { describe, it, expect, vi, afterEach } from "vitest";

import { timedFetch } from "./supabase";

/**
 * Both Supabase clients route every request through `timedFetch`, so a hung
 * upstream cannot hold an API route or a dashboard read open forever. The
 * bound must fire on its own, and the caller's `.abortSignal()` must still win.
 */

/** A fetch that never answers, but rejects the moment its signal aborts. */
const hangingFetch = vi.fn(
  (_input: RequestInfo | URL, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      if (signal?.aborted) return reject(signal.reason);
      signal?.addEventListener("abort", () => reject(signal.reason), { once: true });
    }),
) as unknown as typeof fetch;

afterEach(() => {
  vi.useRealTimers();
});

describe("timedFetch", () => {
  it("rejects a request that never resolves with a TimeoutError after the bound", async () => {
    vi.useFakeTimers();
    const pending = timedFetch(50, hangingFetch)("https://example.supabase.co/rest/v1/x");
    const assertion = expect(pending).rejects.toMatchObject({ name: "TimeoutError" });
    await vi.advanceTimersByTimeAsync(50);
    await assertion;
  });

  it("still aborts on the caller's own signal", async () => {
    const caller = new AbortController();
    const pending = timedFetch(10_000, hangingFetch)("https://example.supabase.co/rest/v1/x", {
      signal: caller.signal,
    });
    caller.abort(new DOMException("caller", "AbortError"));
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("aborts at once when the caller's signal is already aborted", async () => {
    const caller = new AbortController();
    caller.abort(new DOMException("caller", "AbortError"));
    await expect(
      timedFetch(10_000, hangingFetch)("https://example.supabase.co/rest/v1/x", { signal: caller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });

  it("passes a response through and leaves no timer behind", async () => {
    vi.useFakeTimers();
    const ok = vi.fn(async () => new Response("[]", { status: 200 })) as unknown as typeof fetch;
    const res = await timedFetch(50, ok)("https://example.supabase.co/rest/v1/x");
    expect(res.status).toBe(200);
    expect(vi.getTimerCount()).toBe(0);
  });
});
