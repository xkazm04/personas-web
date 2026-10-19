import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * GET /api/votes and GET /api/feature-comments are public and anonymous. They
 * used to select every row of their table on every request, with no rate
 * limit. These specs hold them to a read whose cost does not grow with the
 * table, counts that stay right past PostgREST's 1000-row cap, and a 429.
 */

type Row = Record<string, unknown>;

interface Query {
  table: string;
  head: boolean;
  filters: [string, unknown][];
  limit?: number;
}

/** A Supabase stand-in that answers like PostgREST, including its 1000-row cap. */
function fakeSupabase(tables: Record<string, Row[]>) {
  const queries: Query[] = [];
  const from = (table: string) => {
    const q: Query = { table, head: false, filters: [] };
    let order: { col: string; ascending: boolean } | undefined;
    const builder = {
      select(_cols: string, opts?: { head?: boolean }) {
        q.head = !!opts?.head;
        queries.push(q);
        return builder;
      },
      eq(col: string, value: unknown) {
        q.filters.push([col, value]);
        return builder;
      },
      order(col: string, opts: { ascending: boolean }) {
        order = { col, ascending: opts.ascending };
        return builder;
      },
      limit(n: number) {
        q.limit = n;
        return builder;
      },
      then(resolve: (v: unknown) => void) {
        let rows = (tables[table] ?? []).filter((r) => q.filters.every(([c, v]) => r[c] === v));
        if (q.head) return resolve({ data: null, count: rows.length, error: null });
        if (order) {
          const { col, ascending } = order;
          rows = [...rows].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : 1) * (ascending ? 1 : -1));
        }
        resolve({ data: rows.slice(0, Math.min(q.limit ?? Infinity, 1000)), error: null });
      },
    };
    return builder;
  };
  return { client: { from }, queries };
}

let fake: ReturnType<typeof fakeSupabase>;
vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdminOrRefusal: async () => fake.client,
}));

const VOTER = "v_3f9a2c7e1b4d8f60";

function votes(featureId: string, n: number, voter = (i: number) => `v_${String(i).padStart(16, "0")}`): Row[] {
  return Array.from({ length: n }, (_, i) => ({ feature_id: featureId, voter_id: voter(i), email: "x@example.com" }));
}

/** One distinct client per test: the limiter keys an untrusted caller by its headers. */
const client = (name: string) => ({ "user-agent": `publicReads-${name}` });

describe("public vote and comment reads", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://ref.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("counts votes in the database, right past 1000 rows, and reads only the caller's own", async () => {
    fake = fakeSupabase({
      feature_votes: [...votes("macos", 1500), ...votes("dashboard", 3), { feature_id: "dashboard", voter_id: VOTER }],
      shipped_features: [],
    });
    const { GET } = await import("./route");
    const res = await GET(new NextRequest(`https://personas.so/api/votes?voterId=${VOTER}`, { headers: client("counts") }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ counts: { macos: 1500, dashboard: 4 }, userVotes: ["dashboard"], shipped: [] });

    const voteReads = fake.queries.filter((q) => q.table === "feature_votes");
    for (const q of voteReads) {
      expect(q.head || q.filters.some(([c]) => c === "voter_id"), JSON.stringify(q)).toBe(true);
    }
  });

  it("reads no rows for a caller with no valid voter id", async () => {
    fake = fakeSupabase({ feature_votes: votes("macos", 2), shipped_features: [] });
    const { GET } = await import("./route");
    const res = await GET(new NextRequest("https://personas.so/api/votes", { headers: client("anon") }));
    expect(await res.json()).toMatchObject({ counts: { macos: 2 }, userVotes: [] });
    expect(fake.queries.filter((q) => q.table === "feature_votes").every((q) => q.head)).toBe(true);
  });

  it("refuses the 61st vote read in a minute with 429, without spending the voting budget", async () => {
    fake = fakeSupabase({ feature_votes: [], shipped_features: [] });
    const { GET } = await import("./route");
    const { rateLimit } = await import("./rate-limit");
    const headers = client("votes-429");
    for (let i = 0; i < 60; i++) {
      expect((await GET(new NextRequest("https://personas.so/api/votes", { headers }))).status).toBe(200);
    }
    expect((await GET(new NextRequest("https://personas.so/api/votes", { headers }))).status).toBe(429);
    // The POST's bucket is untouched by the reads.
    const { getClientIp } = await import("@/lib/server/request");
    expect(rateLimit(getClientIp(new NextRequest("https://personas.so/api/votes", { headers })))).toBeNull();
  });

  it("serves the newest 500 comments, oldest first", async () => {
    const rows: Row[] = Array.from({ length: 600 }, (_, i) => ({
      id: `c${i}`,
      feature_id: "dashboard",
      parent_id: null,
      author: "Ada",
      text: `comment ${i}`,
      created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
    }));
    fake = fakeSupabase({ feature_comments: rows });
    const { GET } = await import("@/app/api/feature-comments/route");
    const res = await GET(new NextRequest("https://personas.so/api/feature-comments", { headers: client("comments") }));
    const { comments } = (await res.json()) as { comments: { id: string }[] };
    expect(comments).toHaveLength(500);
    expect(comments[0].id).toBe("c100");
    expect(comments[499].id).toBe("c599");
    expect(fake.queries[0].limit).toBe(500);
  });

  it("refuses the 61st comment read in a minute with 429", async () => {
    fake = fakeSupabase({ feature_comments: [] });
    const { GET } = await import("@/app/api/feature-comments/route");
    const headers = client("comments-429");
    for (let i = 0; i < 60; i++) {
      expect((await GET(new NextRequest("https://personas.so/api/feature-comments", { headers }))).status).toBe(200);
    }
    expect((await GET(new NextRequest("https://personas.so/api/feature-comments", { headers }))).status).toBe(429);
  });
});
