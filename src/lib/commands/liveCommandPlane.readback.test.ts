import { describe, expect, it, vi } from "vitest";

/**
 * F8 (security read 78a9d144): the web never reads a command's params or
 * envelope back. The desk ignores the params column and, since personas
 * `693fc11e77`, clears both on every terminal channel_say write.
 */

const select = vi.fn((_columns: string) => ({ in: async () => ({ data: [], error: null }) }));
vi.mock("@/lib/supabase", () => ({ getSupabase: () => ({ from: () => ({ select }) }) }));

const { pollLiveCommands } = await import("./liveCommandPlane");

describe("pollLiveCommands: read-back columns", () => {
  it("selects exactly id, status, result and error_message", async () => {
    await pollLiveCommands(["c1"]);
    expect(select).toHaveBeenCalledWith("id,status,result,error_message");
  });
});
