import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import type { ErrorEvent, Breadcrumb } from "@sentry/nextjs";
import {
  correlationMarker,
  safeScrubBreadcrumb,
  safeScrubEvent,
  scrubEvent,
  scrubPii,
  sha256,
} from "./sentry-pii";
import { baseSentryConfig } from "./sentry";

const UUID = "550e8400-e29b-41d4-a716-446655440000";
// Same first 6 characters as UUID — the old `match.slice(0, 6)` marker mapped
// both of these to the identical "[id:550e84]".
const SIBLING_UUID = "550e8400-e29b-41d4-a716-446655440099";

const hex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

describe("sha256 (the marker's primitive)", () => {
  it("matches the published FIPS-180-4 vectors", () => {
    expect(hex(sha256(new TextEncoder().encode("")))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(hex(sha256(new TextEncoder().encode("abc")))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("agrees with node:crypto across the block/padding boundaries", () => {
    // 55/56 and 63/64/65 are where the length-padding block splits.
    for (const len of [0, 1, 8, 54, 55, 56, 63, 64, 65, 119, 120, 200]) {
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = (i * 37 + 11) & 0xff;
      expect(hex(sha256(bytes))).toBe(
        createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
      );
    }
  });
});

describe("correlationMarker (Wave-4 fix: keyed derivative, not a substring)", () => {
  it("never emits any run of the identifier it stands in for", () => {
    const marker = correlationMarker(UUID);
    const stripped = UUID.replace(/-/g, "");
    for (let i = 0; i + 4 <= stripped.length; i++) {
      expect(marker).not.toContain(stripped.slice(i, i + 4));
    }
    expect(marker).not.toContain(UUID);
  });

  it("separates identifiers that share a prefix", () => {
    // The regression that matters: a prefix marker collapses these two into one
    // record AND discloses the shared prefix. A keyed hash does neither.
    expect(correlationMarker(UUID)).not.toBe(correlationMarker(SIBLING_UUID));
  });

  it("is stable within the session so correlation survives", () => {
    expect(correlationMarker(UUID)).toBe(correlationMarker(UUID));
    expect(correlationMarker(UUID)).toBe(correlationMarker(`${UUID}`));
  });

  it("is shaped as a short opaque token", () => {
    expect(correlationMarker(UUID)).toMatch(/^\[id:[0-9a-f]{12}\]$/);
  });
});

describe("scrubPii", () => {
  it("replaces a UUID with a marker that carries none of the UUID", () => {
    const out = scrubPii(`exec ${UUID} done`);
    expect(out).not.toContain(UUID);
    expect(out).not.toContain("550e84"); // the old prefix marker
    expect(out).toMatch(/^exec \[id:[0-9a-f]{12}\] done$/);
  });

  it("redacts bare emails", () => {
    expect(scrubPii("contact alice@example.com now")).toBe("contact [redacted-email] now");
  });

  it("leaves PII-free strings unchanged", () => {
    expect(scrubPii("execution completed in 1.8s")).toBe("execution completed in 1.8s");
  });

  it("reduces URLs to scheme + host", () => {
    const out = scrubPii("GET https://api.example.com/v1/personas?token=secret now");
    expect(out).not.toContain("token=secret");
    expect(out).toContain("https://api.example.com/");
  });

  it("does not let a UUID inside a URL truncate the URL redaction", () => {
    // Regression: the marker ends in `]`, and URL_RE stops at `]`. With the
    // UUID pass first, everything after the marker — query string included —
    // survived the URL pass.
    const out = scrubPii(`GET https://api.example.com/v1/personas/${UUID}?token=secret now`);
    expect(out).not.toContain("token=secret");
    expect(out).not.toContain(UUID);
    expect(out).not.toContain("550e84");
  });

  it("caps string length without leaving a half identifier at the cut", () => {
    // The cut lands mid-email; a truncated "vict" tail would still be a partial
    // disclosure, so the trailing token is dropped.
    const filler = "x".repeat(2040);
    const out = scrubPii(`${filler} victim@example.com tail`);
    expect(out).toContain("[truncated]");
    expect(out.length).toBeLessThan(2100);
    expect(out).not.toContain("victim");
    expect(out).not.toContain("@example.com");
  });
});

describe("scrubEvent", () => {
  it("replaces an opaque (non-UUID) user id instead of passing it through", () => {
    const event = { user: { id: "auth0|9f8e7d6c", email: "u@example.com" } } as unknown as ErrorEvent;
    const out = JSON.stringify(scrubEvent(event));
    expect(out).not.toContain("auth0");
    expect(out).not.toContain("9f8e7d6c");
    expect(out).not.toContain("u@example.com");
    expect(out).toMatch(/\[id:[0-9a-f]{12}\]/);
  });

  it("scrubs identifiers out of message, exception value, contexts, extra and tags", () => {
    const event = {
      message: `run ${UUID}`,
      exception: { values: [{ value: `failed for ${UUID}`, stacktrace: { frames: [{ vars: { who: "a@b.com" } }] } }] },
      contexts: { persona: { id: UUID } },
      extra: { note: `see ${UUID}` },
      tags: { persona_id: UUID, scope: "test" },
      breadcrumbs: [{ message: `crumb ${UUID}`, data: { email: "a@b.com", note: `x ${UUID}` } }],
    } as unknown as ErrorEvent;
    const out = JSON.stringify(scrubEvent(event));
    expect(out).not.toContain(UUID);
    expect(out).not.toContain("550e84");
    expect(out).not.toContain("a@b.com");
    expect(out).toContain("test"); // non-PII tag survives
  });
});

describe("scrubEvent bounds (Wave-3 fix #2 + Wave-4 caps)", () => {
  it("redacts values nested past the scrub-depth cap instead of passing them through", () => {
    // 8 levels deep — past MAX_SCRUB_DEPTH (6). The old code returned the raw
    // subtree here, leaking the email; the fix returns "[redacted-depth]".
    const deep = { l1: { l2: { l3: { l4: { l5: { l6: { l7: { l8: { leak: "deep@leak.com" } } } } } } } } };
    const event = { contexts: { trace: deep } } as unknown as ErrorEvent;
    const out = JSON.stringify(scrubEvent(event));
    expect(out).toContain("[redacted-depth]");
    expect(out).not.toContain("deep@leak.com");
  });

  it("names a cycle instead of walking an infinite structure to the depth cap", () => {
    const node: Record<string, unknown> = { label: "root" };
    node.self = node;
    const event = { extra: { node } } as unknown as ErrorEvent;
    const out = JSON.stringify(scrubEvent(event));
    expect(out).toContain("[redacted-cycle]");
    expect(out).not.toContain("[redacted-depth]");
  });

  it("still scrubs a repeated (non-cyclic) sibling reference", () => {
    // A DAG is not a cycle: the second reference must be scrubbed, not skipped.
    const shared = { who: "dag@leak.com" };
    const event = { extra: { a: shared, b: shared } } as unknown as ErrorEvent;
    const out = JSON.stringify(scrubEvent(event));
    expect(out).not.toContain("dag@leak.com");
    expect(out.match(/\[redacted-email\]/g)).toHaveLength(2);
  });

  it("caps object breadth and array length", () => {
    const wide: Record<string, string> = {};
    for (let i = 0; i < 300; i++) wide[`k${i}`] = "v";
    const event = { extra: { wide, list: Array.from({ length: 400 }, () => "leak@x.com") } } as unknown as ErrorEvent;
    const scrubbed = scrubEvent(event) as unknown as { extra: { wide: Record<string, unknown>; list: unknown[] } };
    expect(Object.keys(scrubbed.extra.wide).length).toBeLessThanOrEqual(65);
    expect(scrubbed.extra.list.length).toBeLessThanOrEqual(101);
    expect(JSON.stringify(scrubbed)).not.toContain("leak@x.com");
  });

  it("stops on the total node budget for a wide AND deep payload", () => {
    const build = (depth: number): unknown => {
      if (depth === 0) return "leaf";
      const out: Record<string, unknown> = {};
      for (let i = 0; i < 10; i++) out[`k${i}`] = build(depth - 1);
      return out;
    };
    const event = { extra: { tree: build(6) } } as unknown as ErrorEvent;
    const started = Date.now();
    const out = JSON.stringify(scrubEvent(event));
    expect(out).toContain("[redacted-budget]");
    expect(Date.now() - started).toBeLessThan(2000);
  });
});

describe("fail-closed hooks (Wave-4 fix: a throwing scrubber must not send the original)", () => {
  const hostileEvent = () => {
    const event = { message: `run ${UUID}` } as unknown as ErrorEvent;
    Object.defineProperty(event, "extra", {
      enumerable: true,
      get() {
        throw new Error("hostile getter");
      },
    });
    return event;
  };

  it("replaces a throwing event with a payload-free skeleton", () => {
    const event = hostileEvent();
    const result = safeScrubEvent(event);
    // Compared as a boolean: passing the hostile object to expect() makes the
    // matcher serialize it, which re-triggers the throwing getter.
    expect(result === event).toBe(false);
    const out = JSON.stringify(result);
    expect(out).not.toContain(UUID);
    expect(out).not.toContain("hostile getter");
    expect(out).toContain("scrub_failed");
  });

  it("drops a throwing breadcrumb rather than forwarding it", () => {
    const breadcrumb = { message: `crumb ${UUID}` } as unknown as Breadcrumb;
    Object.defineProperty(breadcrumb, "data", {
      enumerable: true,
      get() {
        throw new Error("hostile getter");
      },
    });
    expect(safeScrubBreadcrumb(breadcrumb)).toBeNull();
  });

  it("wires the fail-closed wrappers into Sentry.init, not the bare scrubbers", () => {
    // End-to-end guarantee: the try/catch only protects the boundary if these
    // are the functions actually handed to the SDK.
    expect(baseSentryConfig.beforeSend).toBe(safeScrubEvent);
    expect(baseSentryConfig.beforeBreadcrumb).toBe(safeScrubBreadcrumb);
    expect(baseSentryConfig.sendDefaultPii).toBe(false);
  });
});
