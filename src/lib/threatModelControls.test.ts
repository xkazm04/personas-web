import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server";
import * as votesRoute from "@/app/api/votes/route";
import * as featureBoostsRoute from "@/app/api/feature-boosts/route";
import * as featureCommentsRoute from "@/app/api/feature-comments/route";
import * as featureRequestsRoute from "@/app/api/feature-requests/route";
import * as waitlistRoute from "@/app/api/waitlist/route";

/**
 * Turns the Controls column of docs/threat-model.md § Routes into behaviour.
 *
 * threatModelAuthGate.test.ts proves the session-gated rows refuse callers.
 * The anonymous rows have no caller gate; what stands between the internet and
 * the admin (service_role) client behind votes, feature-boosts,
 * feature-comments and waitlist is the controls their row names. So:
 *   - a row naming an IP rate limit really answers 429, with Retry-After,
 *     once one IP exceeds its budget;
 *   - a row naming an allowlist really refuses an id outside it with 400.
 * Every refusal here happens before the handler reaches any store, so nothing
 * is read or written. A row that names a control without a harness below
 * fails "has a harness" until one is added.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const THREAT_MODEL = readFileSync(path.join(REPO_ROOT, "docs", "threat-model.md"), "utf8");

/** Route key and Controls cell of each `## Routes` row. */
function controlRows(): { route: string; controls: string }[] {
  const section = THREAT_MODEL.split(/^## Routes\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const rows: { route: string; controls: string }[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = /^\|\s*`([^`]+)`\s*\|[^|]*\|[^|]*\|[^|]*\|([^|]*)\|/.exec(line);
    if (m) rows.push({ route: m[1], controls: m[2] });
  }
  return rows;
}

type Handler = (req: NextRequest) => Promise<Response>;

/** A POST/GET the route rejects after its limiter, so no store is touched. */
interface RateHarness {
  module: object;
  method: "GET" | "POST";
  body?: unknown;
}

/** A request valid in every field but the allowlisted one. */
interface AllowlistHarness {
  module: object;
  body: unknown;
  /** What the 400 must say, so it is the allowlist refusing and not another check. */
  expectBody: Record<string, unknown>;
}

const VOTER = "voter_threat_model_0001";
const BOGUS_FEATURE = "not-a-real-feature-id";

const RATE_LIMITED: Record<string, RateHarness[]> = {
  votes: [{ module: votesRoute, method: "POST", body: {} }],
  "feature-boosts": [{ module: featureBoostsRoute, method: "POST", body: {} }],
  "feature-comments": [{ module: featureCommentsRoute, method: "POST", body: {} }],
  "feature-requests": [{ module: featureRequestsRoute, method: "POST", body: {} }],
  waitlist: [{ module: waitlistRoute, method: "POST", body: {} }],
};

const ALLOWLISTED: Record<string, AllowlistHarness> = {
  votes: {
    module: votesRoute,
    body: { featureId: BOGUS_FEATURE, voterId: VOTER },
    expectBody: { error: "Invalid feature ID" },
  },
  "feature-boosts": {
    module: featureBoostsRoute,
    body: { featureId: BOGUS_FEATURE, voterId: VOTER, weight: 5, tierValue: 5 },
    expectBody: { error: "Invalid feature ID" },
  },
  "feature-comments": {
    module: featureCommentsRoute,
    body: { featureId: BOGUS_FEATURE, parentId: null, text: "hello", author: "anon" },
    expectBody: { error: "Invalid feature ID" },
  },
  waitlist: {
    module: waitlistRoute,
    body: { email: "someone@example.com", platform: "beos" },
    expectBody: { code: "invalid_platform" },
  },
};

const rows = controlRows();
const rateRows = rows.filter((r) => /rate limit/i.test(r.controls));
const allowRows = rows.filter((r) => /allowlist|ALLOWED_/i.test(r.controls));

describe("docs/threat-model.md § Routes controls have harnesses", () => {
  it("finds rows naming rate limits and allowlists", () => {
    expect(rateRows.length).toBeGreaterThan(0);
    expect(allowRows.length).toBeGreaterThan(0);
  });

  it("has a rate-limit harness for every row naming one", () => {
    expect(rateRows.map((r) => r.route).sort()).toEqual(Object.keys(RATE_LIMITED).sort());
  });

  it("has an allowlist harness for every row naming one", () => {
    expect(allowRows.map((r) => r.route).sort()).toEqual(Object.keys(ALLOWLISTED).sort());
  });
});

describe("anonymous routes enforce the controls their row names", () => {
  const saved: Record<string, string | undefined> = {};
  const ENV: Record<string, string | undefined> = {
    // Lets each case pick its own client IP, so limiter buckets never collide.
    TRUST_PROXY: "true",
    NEXT_PUBLIC_SUPABASE_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
  };

  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) {
      saved[k] = process.env[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  let ipSeq = 0;
  const freshIp = () => `203.0.113.${++ipSeq}`;

  const call = (module: object, method: string, ip: string, body?: unknown) => {
    const handler = (module as Record<string, Handler>)[method];
    const req = new NextRequest(`https://personas.so/api/threat-model`, {
      method,
      headers: { "x-real-ip": ip, "content-type": "application/json" },
      body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
    });
    return handler(req);
  };

  const rateCases = Object.entries(RATE_LIMITED).flatMap(([route, hs]) =>
    hs.map((h): [string, string, RateHarness] => [route, h.method, h]),
  );

  it.each(rateCases)("%s %s: one IP over budget gets 429 with Retry-After", async (route, method, h) => {
    const ip = freshIp();
    const first = await call(h.module, method, ip, h.body);
    expect(first.status, `${method} ${route}: the first request must not be refused`).not.toBe(429);

    let refused = null as Response | null;
    for (let i = 0; i < 200 && !refused; i++) {
      const res = await call(h.module, method, ip, h.body);
      if (res.status === 429) refused = res;
    }
    expect(refused, `${method} ${route}: no 429 within 200 requests from one IP`).not.toBeNull();
    expect(Number(refused!.headers.get("Retry-After"))).toBeGreaterThan(0);

    // The budget is per IP: a different caller is still served.
    const other = await call(h.module, method, freshIp(), h.body);
    expect(other.status).not.toBe(429);
  });

  it.each(Object.entries(ALLOWLISTED))("%s POST: an id outside the allowlist gets 400", async (route, h) => {
    const res = await call(h.module, "POST", freshIp(), h.body);
    expect(res.status, `${route}: allowlist refusal`).toBe(400);
    expect(await res.json()).toMatchObject(h.expectBody);
  });
});
