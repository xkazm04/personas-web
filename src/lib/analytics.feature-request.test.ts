import { describe, it, expect, vi, beforeEach } from "vitest";

import { COOKIE_CONSENT_KEY } from "./constants";

/**
 * A feature request's text is what the visitor typed, and it already has a home:
 * the form POSTs it to /api/feature-requests. The analytics event only counts
 * that a request was sent. Before this, `trackFeatureRequest(text)` also shipped
 * the first 200 characters of the text to the metrics sink as an attribute - user
 * content in a measurement payload, on a second destination nobody reads it from.
 */

const count = vi.fn();
vi.mock("@sentry/nextjs", () => ({ metrics: { count: (...args: unknown[]) => count(...args) } }));

const { trackFeatureRequest } = await import("./analytics");

describe("trackFeatureRequest", () => {
  beforeEach(() => {
    count.mockClear();
    // The suite runs in node: give the consent check a window and a stored "all".
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", { getItem: (k: string) => (k === COOKIE_CONSENT_KEY ? "all" : null) });
  });

  it("counts the request and carries none of the typed text", () => {
    const typed = "Please add export to my-team@example.com every Friday";
    // The cast keeps the pre-fix call shape, so this one test ran on both arms.
    (trackFeatureRequest as (text?: string) => void)(typed);

    expect(count).toHaveBeenCalledTimes(1);
    const [name, , options] = count.mock.calls[0] as [string, number, { attributes?: Record<string, string> }];
    expect(name).toBe("feature_request");
    const values = Object.values(options?.attributes ?? {});
    expect(values.some((v) => typed.includes(v) || v.includes("example.com"))).toBe(false);
  });
});
