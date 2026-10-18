import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();

vi.mock("@/lib/server/env", () => ({ hasSupabaseEnv: () => true }));
vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => ({ from }),
  getSupabaseAdminOrRefusal: () => ({ from }),
}));

import { GET } from "./route";

function viewReturns(result: { data: unknown; error: unknown }) {
  const select = vi.fn().mockResolvedValue(result);
  from.mockReturnValue({ select });
  return select;
}

describe("GET /api/feature-boosts (Supabase)", () => {
  beforeEach(() => from.mockReset());

  it("reads per-feature totals from the grouped view, not the boosts table", async () => {
    const select = viewReturns({
      data: [
        { feature_id: "a", total: 40 },
        { feature_id: "b", total: 5 },
      ],
      error: null,
    });

    const res = await GET();

    expect(from).toHaveBeenCalledWith("feature_boost_totals");
    expect(from).not.toHaveBeenCalledWith("feature_boosts");
    expect(select).toHaveBeenCalledWith("feature_id, total");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ totals: { a: 40, b: 5 } });
  });

  it("returns 500 when the view read fails", async () => {
    viewReturns({ data: null, error: { message: "relation does not exist" } });

    const res = await GET();

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to read boosts" });
  });
});
