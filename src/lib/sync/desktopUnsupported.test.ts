import { describe, expect, it, vi } from "vitest";
import { matchDesktopShape } from "@/app/api/orchestrator/desktopShapes";
import { ApiError } from "@/lib/api-error";
import { api as dispatchApi, type ApiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { createDesktopApi, type DesktopFetcher } from "@/lib/desktopApi";
import { DESKTOP_UNSUPPORTED_ACTIONS, desktopUnsupported } from "./desktopUnsupported";
import { verdictsEnabled, type ReachabilityTier } from "./reachability";

/**
 * The data-source env is unset under vitest, so `api` dispatches to `realApi`:
 * the `base` `createDesktopApi` falls through to in production. The fetcher
 * stands in for the desktop proxy and must never run.
 */
function setup() {
  const fetcher = vi.fn(() => {
    throw new Error("the desktop fetcher must not be called");
  }) as unknown as DesktopFetcher & ReturnType<typeof vi.fn>;
  // A Proxy spreads to nothing, so name the methods the desktop plane falls through on.
  const base = {
    pausePersona: dispatchApi.pausePersona,
    resumePersona: dispatchApi.resumePersona,
    sendChatMessage: dispatchApi.sendChatMessage,
    decideReview: dispatchApi.decideReview,
  } as unknown as ApiClient;
  return { fetcher, api: createDesktopApi(fetcher, base), realApi: dispatchApi };
}

describe("DESKTOP_UNSUPPORTED_ACTIONS is pinned to the code", () => {
  it("pause, resume and chatSend reject with a 501 and send no request", async () => {
    const { api, fetcher } = setup();
    const calls = {
      pause: () => api.pausePersona("p1"),
      resume: () => api.resumePersona("p1"),
      chatSend: () => api.sendChatMessage({} as Parameters<ApiClient["sendChatMessage"]>[0]),
    } as const;
    for (const action of ["pause", "resume", "chatSend"] as const) {
      expect(DESKTOP_UNSUPPORTED_ACTIONS).toContain(action);
      const err = await calls[action]().then(
        () => null,
        (e: unknown) => e,
      );
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(501);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("the review verdict is a not_on_desktop shape", async () => {
    const { realApi } = setup();
    expect(DESKTOP_UNSUPPORTED_ACTIONS).toContain("reviewVerdict");
    useAuthStore.setState({ initialized: true, isDemo: false });
    const seen: { path: string; method?: string }[] = [];
    // Capture what decideReview sends by running it against a stub global fetch.
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      seen.push({ path: String(input), method: init?.method });
      return new Response("{}", { status: 200 });
    });
    try {
      await realApi.decideReview({ reviewId: "r1", decision: "approved", resolvedBy: "me" } as Parameters<ApiClient["decideReview"]>[0]).catch(() => {});
    } finally {
      fetchSpy.mockRestore();
    }
    expect(seen).toHaveLength(1);
    const path = new URL(seen[0].path, "http://x").pathname.replace(/^\/api\/orchestrator/, "");
    const shape = matchDesktopShape(seen[0].method ?? "GET", path.split("/").filter(Boolean));
    expect(shape?.served).toBe("not_on_desktop");
  });

  it("run and cancel are served, so they are not in the table", () => {
    expect(DESKTOP_UNSUPPORTED_ACTIONS).not.toContain("executePersona");
    expect(DESKTOP_UNSUPPORTED_ACTIONS).not.toContain("cancelExecution");
    expect(DESKTOP_UNSUPPORTED_ACTIONS).not.toContain("run");
    expect(DESKTOP_UNSUPPORTED_ACTIONS).not.toContain("cancel");
  });
});

describe("desktopUnsupported", () => {
  const tiers: ReachabilityTier[] = ["demo", "no-account", "never-synced", "offline", "online-unpaired", "online"];

  it("is true only for every listed action on the online desktop plane", () => {
    for (const action of DESKTOP_UNSUPPORTED_ACTIONS) {
      expect(tiers.filter((t) => desktopUnsupported(action, t, true))).toEqual(["online"]);
      expect(tiers.some((t) => desktopUnsupported(action, t, false))).toBe(false);
      expect(desktopUnsupported(action, null, true)).toBe(false);
    }
  });

  it("turns review verdicts off on the online desktop plane and leaves the rest as before", () => {
    expect(verdictsEnabled("online", false, true)).toBe(false);
    expect(verdictsEnabled("offline", false, true)).toBe(true);
    expect(verdictsEnabled(null, false, true)).toBe(true);
    expect(verdictsEnabled("online", false)).toBe(true);
    expect(verdictsEnabled("online", true)).toBe(true);
  });
});
