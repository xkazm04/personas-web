/**
 * Locations, not prose.
 *
 * `sentry-pii.test.ts` covers the aggressive path — the one that reduces a URL
 * to `scheme://host/…` because it cannot know what a human put in the rest of
 * the string. This spec covers the structural path: the redaction applied to
 * strings that ARE code coordinates (`error.stack` frames, `frame.filename` /
 * `abs_path` / `module`), where the path and the `:line:col` are the whole
 * point and only the personal parts may go.
 *
 * Every test here asserts in BOTH directions — the secret is absent AND the
 * coordinate survived. A redaction test that only checks absence passes
 * against `() => "[redacted]"`, which is not a redactor, it is a delete.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";

// The wrapper's whole contract is what it hands to the SDK, so the SDK is
// replaced by a recorder. `vi.hoisted` because the factory is hoisted above
// these imports.
const { captured } = vi.hoisted(() => ({ captured: [] as unknown[] }));
vi.mock("@sentry/nextjs", () => ({
  captureException: (error: unknown) => {
    captured.push(error);
    return "event-id";
  },
}));

import {
  captureExceptionScrubbed,
  redactLocation,
  redactStack,
  scrubEvent,
  scrubPii,
} from "./sentry-pii";

const UUID = "550e8400-e29b-41d4-a716-446655440000";
const USER = "jkowalski";

beforeEach(() => {
  captured.length = 0;
});

describe("redactLocation — removes the secrets", () => {
  it("drops a query string carrying a token, keeping path and position", () => {
    const out = redactLocation(
      "https://app.example.com/_next/static/chunks/main-4f2a.js?token=sk_live_9f8e7d:1234:56",
    );
    expect(out).not.toContain("sk_live_9f8e7d");
    expect(out).not.toContain("token");
    expect(out).not.toContain("?");
    // ...and the frame is still a frame:
    expect(out).toBe(
      "https://app.example.com/_next/static/chunks/main-4f2a.js:1234:56",
    );
  });

  it("drops a query string carrying an identifier, keeping path and position", () => {
    const out = redactLocation(`https://app.example.com/app.js?id=${UUID}:12:7`);
    expect(out).not.toContain(UUID);
    expect(out).not.toContain("550e84"); // not even a prefix of it
    expect(out).toContain("/app.js");
    expect(out.endsWith(":12:7")).toBe(true);
  });

  it("drops a fragment, keeping path and position", () => {
    const out = redactLocation(
      "https://app.example.com/app.js#access_token=secret-value:9:1",
    );
    expect(out).not.toContain("secret-value");
    expect(out).not.toContain("#");
    expect(out).toBe("https://app.example.com/app.js:9:1");
  });

  it("strips userinfo, keeping host, path and position", () => {
    const out = redactLocation(
      "https://deploy:hunter2@cdn.example.com/assets/app.js:1:2",
    );
    expect(out).not.toContain("deploy");
    expect(out).not.toContain("hunter2");
    expect(out).not.toContain("@");
    expect(out).toBe("https://cdn.example.com/assets/app.js:1:2");
  });

  it("removes the username from a Windows home directory, keeping the rest", () => {
    const out = redactLocation(`C:\\Users\\${USER}\\proj\\src\\lib\\api.ts:88:13`);
    expect(out).not.toContain(USER);
    // The rest of the path is the diagnostic value and must survive intact.
    expect(out).toBe("C:\\Users\\[redacted-user]\\proj\\src\\lib\\api.ts:88:13");
  });

  it("removes the username from POSIX and file:// home directories", () => {
    expect(redactLocation(`/Users/${USER}/proj/src/app/page.tsx:4:9`)).toBe(
      "/Users/[redacted-user]/proj/src/app/page.tsx:4:9",
    );
    expect(redactLocation(`/home/${USER}/proj/src/app/page.tsx:4:9`)).toBe(
      "/home/[redacted-user]/proj/src/app/page.tsx:4:9",
    );
    expect(redactLocation(`file:///Users/${USER}/proj/x.ts:1:1`)).toBe(
      "file:///Users/[redacted-user]/proj/x.ts:1:1",
    );
    // What a file:// URL looks like on Windows.
    expect(redactLocation(`file:///C:/Users/${USER}/proj/x.ts:1:1`)).toBe(
      "file:///C:/Users/[redacted-user]/proj/x.ts:1:1",
    );
    // A bundler scheme is a build coordinate too, not a public route.
    expect(redactLocation(`webpack:///Users/${USER}/proj/x.ts:2:3`)).toBe(
      "webpack:///Users/[redacted-user]/proj/x.ts:2:3",
    );
  });

  it("turns a UUID inside a path segment into a marker, not a survivor", () => {
    const out = redactLocation(
      `https://api.example.com/v1/personas/${UUID}/bundle.js:3:4`,
    );
    expect(out).not.toContain(UUID);
    expect(out).not.toContain("550e84");
    expect(out).toMatch(/\[id:[0-9a-f]{12}\]/);
    expect(out).toContain("https://api.example.com/v1/personas/");
    expect(out).toContain("/bundle.js:3:4");
  });

  it("redacts an email embedded in a path", () => {
    const out = redactLocation(`/home/${USER}/mail/alice@example.com/x.ts:1:2`);
    expect(out).not.toContain("alice@example.com");
    expect(out).not.toContain(USER);
    expect(out).toContain("[redacted-email]");
    expect(out).toContain("/mail/");
    expect(out.endsWith("/x.ts:1:2")).toBe(true);
  });
});

describe("redactLocation — preserves the coordinates", () => {
  it("leaves a clean bundle location byte-for-byte alone", () => {
    const clean = "https://app.example.com/_next/static/chunks/page-8ab1.js:12:34";
    expect(redactLocation(clean)).toBe(clean);
  });

  it("does not mistake a port for a position", () => {
    const dev = "http://localhost:3000/_next/static/chunks/main.js:5:6";
    expect(redactLocation(dev)).toBe(dev);
    expect(redactLocation("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("does not mistake a web route called /home for a home directory", () => {
    // The home-directory rule is anchored at a filesystem root; on http(s) a
    // `/home/...` path is a route on a public site and must survive.
    const route = "https://app.example.com/home/dashboard.js:1:2";
    expect(redactLocation(route)).toBe(route);
  });

  it("leaves relative module ids and node-internal frames alone", () => {
    expect(redactLocation("./src/lib/sentry-pii.ts:10:2")).toBe(
      "./src/lib/sentry-pii.ts:10:2",
    );
    expect(redactLocation("node:internal/process/task_queues:95:5")).toBe(
      "node:internal/process/task_queues:95:5",
    );
    expect(redactLocation("webpack-internal:///./src/lib/api.ts:44:11")).toBe(
      "webpack-internal:///./src/lib/api.ts:44:11",
    );
  });

  it("survives the degenerate inputs without throwing", () => {
    expect(redactLocation("")).toBe("");
    expect(redactLocation("<anonymous>")).toBe("<anonymous>");
    // A pathological length is bounded rather than fed to the regex passes.
    const long = `https://app.example.com/${"a".repeat(5000)}.js:1:2`;
    const out = redactLocation(long);
    expect(out).toContain("[truncated]");
    expect(out.endsWith(":1:2")).toBe(true);
    expect(out.length).toBeLessThan(2200);
  });
});

describe("redactStack — prose header, structural frames", () => {
  const stack = [
    `Error: fetch failed for ${UUID} at https://api.example.com/v1/personas?token=sk_live_abc (user alice@example.com)`,
    "    at fetchPersonas (https://app.example.com/_next/static/chunks/app.js?token=sk_live_zzz:1234:56)",
    `    at Object.<anonymous> (C:\\Users\\${USER}\\proj\\src\\lib\\api.ts:88:13)`,
    "    at processTicksAndRejections (node:internal/process/task_queues:95:5)",
  ].join("\n");

  it("puts the header on the aggressive path", () => {
    const [header] = redactStack(stack).split("\n");
    expect(header).not.toContain(UUID);
    expect(header).not.toContain("sk_live_abc");
    expect(header).not.toContain("alice@example.com");
    // Aggressive means aggressive: the URL in prose is down to scheme + host.
    expect(header).not.toContain("/v1/personas");
    expect(header).toContain("https://api.example.com/");
  });

  it("keeps every frame's path and position while removing its secrets", () => {
    const lines = redactStack(stack).split("\n");
    expect(lines[1]).toBe(
      "    at fetchPersonas (https://app.example.com/_next/static/chunks/app.js:1234:56)",
    );
    expect(lines[2]).toBe(
      "    at Object.<anonymous> (C:\\Users\\[redacted-user]\\proj\\src\\lib\\api.ts:88:13)",
    );
    // Untouched: no secret in it, and it is a grouping input.
    expect(lines[3]).toBe(
      "    at processTicksAndRejections (node:internal/process/task_queues:95:5)",
    );
  });

  it("handles the Firefox/Safari `fn@location` frame shape", () => {
    const ff = [
      `fetchPersonas@https://app.example.com/app.js?token=sk_live_q:12:34`,
      `render@file:///Users/${USER}/proj/src/app/page.tsx:4:9`,
    ].join("\n");
    const lines = redactStack(ff).split("\n");
    expect(lines[0]).toBe(
      "fetchPersonas@https://app.example.com/app.js:12:34",
    );
    expect(lines[1]).toBe(
      "render@file:///Users/[redacted-user]/proj/src/app/page.tsx:4:9",
    );
  });

  it("treats a line it cannot classify as prose, not as a frame", () => {
    // The safe direction: an appended `Caused by:` line is a message, so it
    // goes back to the aggressive path rather than keeping its URL path.
    const out = redactStack(
      `Error: outer\n    at a (https://app.example.com/x.js:1:2)\nCaused by: Error: inner https://api.example.com/v1/secret?token=abc`,
    );
    expect(out).toContain("https://app.example.com/x.js:1:2"); // frame kept
    expect(out).not.toContain("/v1/secret"); // prose collapsed
    expect(out).not.toContain("token=abc");
  });

  it("does not mistake a message beginning with 'at ' for a frame", () => {
    const out = redactStack("Error: at least one of alice@example.com failed");
    expect(out).toContain("[redacted-email]");
    expect(out).not.toContain("alice@example.com");
  });

  it("keeps the bounds the whole-string scrub used to provide", () => {
    // `error.stack` is writable, so both the line length and the line count are
    // caller-shaped. A frame line past the string cap drops to the aggressive
    // path (which truncates); a stack past the line cap is cut with a marker.
    const huge = `    at f (https://app.example.com/${"a".repeat(9000)}.js:1:2)`;
    const started = Date.now();
    const bounded = redactStack(`Error: x\n${huge}`);
    expect(Date.now() - started).toBeLessThan(2000);
    expect(bounded.length).toBeLessThan(4200);

    const many = ["Error: x", ...Array.from({ length: 500 }, (_, i) => `    at f${i} (https://app.example.com/a.js:1:2)`)].join("\n");
    const cut = redactStack(many);
    expect(cut.split("\n").length).toBeLessThanOrEqual(201);
    expect(cut).toContain("more lines");
  });
});

describe("scrubEvent — frame locations structural, everything else unchanged", () => {
  const eventWithFrames = () =>
    ({
      exception: {
        values: [
          {
            value: `failed for ${UUID}`,
            stacktrace: {
              frames: [
                {
                  function: "fetchPersonas",
                  module: "./src/lib/api",
                  filename: "https://app.example.com/app.js?token=sk_live_abc",
                  abs_path: `file:///Users/${USER}/proj/src/lib/api.ts`,
                  lineno: 1234,
                  colno: 56,
                  in_app: true,
                  vars: { who: "alice@example.com", note: `run ${UUID}` },
                },
              ],
            },
          },
        ],
      },
    }) as unknown as ErrorEvent;

  const firstFrame = (event: ErrorEvent) =>
    event.exception!.values![0]!.stacktrace!.frames![0]!;

  it("leaves function, lineno, colno and in_app exactly as the SDK produced them", () => {
    // The regression guard for the whole change: these are the grouping inputs
    // and they carry nothing personal, so a scrub that touches them is a bug.
    const frame = firstFrame(scrubEvent(eventWithFrames()));
    expect(frame.function).toBe("fetchPersonas");
    expect(frame.lineno).toBe(1234);
    expect(frame.colno).toBe(56);
    expect(frame.in_app).toBe(true);
  });

  it("redacts filename, abs_path and module structurally", () => {
    const frame = firstFrame(scrubEvent(eventWithFrames()));
    expect(frame.filename).toBe("https://app.example.com/app.js");
    expect(frame.abs_path).toBe("file:///Users/[redacted-user]/proj/src/lib/api.ts");
    expect(frame.module).toBe("./src/lib/api");
    expect(JSON.stringify(frame)).not.toContain("sk_live_abc");
    expect(JSON.stringify(frame)).not.toContain(USER);
  });

  it("keeps frame vars on the aggressive path", () => {
    const frame = firstFrame(scrubEvent(eventWithFrames()));
    const vars = JSON.stringify(frame.vars);
    expect(vars).not.toContain("alice@example.com");
    expect(vars).not.toContain(UUID);
    expect(vars).toContain("[redacted-email]");
  });
});

describe("captureExceptionScrubbed — end to end through the wrapper", () => {
  it("scrubs the message aggressively and the stack structurally", () => {
    const error = new Error(
      `fetch failed for ${UUID} (alice@example.com) via https://api.example.com/v1/personas?token=sk_live_abc`,
    );
    error.name = "FetchError";
    error.stack = [
      `FetchError: ${error.message}`,
      "    at fetchPersonas (https://app.example.com/_next/static/chunks/app.js?token=sk_live_zzz:1234:56)",
      `    at Object.<anonymous> (C:\\Users\\${USER}\\proj\\src\\lib\\api.ts:88:13)`,
    ].join("\n");

    expect(captureExceptionScrubbed(error)).toBe("event-id");
    expect(captured).toHaveLength(1);
    const sent = captured[0] as Error;

    expect(sent.name).toBe("FetchError");
    expect(sent.message).not.toContain(UUID);
    expect(sent.message).not.toContain("alice@example.com");
    expect(sent.message).not.toContain("token=sk_live_abc");
    expect(sent.message).not.toContain("/v1/personas");

    const sentStack = sent.stack ?? "";
    expect(sentStack).not.toContain("sk_live_zzz");
    expect(sentStack).not.toContain(USER);
    // The point of the change: the frames still say where the code was.
    expect(sentStack).toContain("/_next/static/chunks/app.js:1234:56");
    expect(sentStack).toContain("\\proj\\src\\lib\\api.ts:88:13");
    expect(sentStack).toContain("fetchPersonas");
  });

  it("still scrubs a raw string capture aggressively", () => {
    captureExceptionScrubbed(`boom https://api.example.com/v1/x?token=abc`);
    expect(captured[0]).not.toContain("token=abc");
    expect(captured[0]).not.toContain("/v1/x");
  });
});

describe("the aggressive path is not weakened by any of the above", () => {
  it("still reduces a URL in prose to scheme + host, path and all", () => {
    const out = scrubPii("GET https://api.example.com/v1/personas?token=secret now");
    expect(out).not.toContain("token=secret");
    expect(out).not.toContain("/v1/personas");
    expect(out).toBe("GET https://api.example.com/… now");
  });

  it("does not give a message the structural treatment", () => {
    // A stack-shaped string that arrives as a MESSAGE is still prose.
    const out = scrubPii(
      "at fetchPersonas (https://app.example.com/app.js?token=sk_live_abc:1:2)",
    );
    expect(out).not.toContain("sk_live_abc");
    expect(out).not.toContain("/app.js");
  });
});
