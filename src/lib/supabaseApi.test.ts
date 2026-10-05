import { describe, it, expect, vi, beforeEach } from "vitest";

// A minimal stand-in for the supabase query builder: every chain method returns
// the builder, and awaiting it resolves to the row set the test staged.
let stagedRows: unknown[] = [];

function builder() {
  const b: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "limit", "in", "gte"]) {
    b[m] = () => b;
  }
  b.then = (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
    resolve({ data: stagedRows, error: null });
  return b;
}

vi.mock("./supabase", () => ({
  getSupabase: () => ({ from: () => builder() }),
}));

const { supabaseApi } = await import("./supabaseApi");

function runningRow(lines: string[]) {
  return {
    id: "exec-1",
    status: "running",
    output_data: lines.join("\n"),
    duration_ms: null,
    claude_session_id: null,
    cost_usd: null,
  };
}

describe("supabaseApi.getExecution offset contract (D5)", () => {
  beforeEach(() => {
    stagedRows = [];
  });

  it("returns only the lines past the caller's offset, with the total in outputLines", async () => {
    stagedRows = [runningRow(["a", "b", "c", "d"])];
    const res = await supabaseApi.getExecution("exec-1", 3);
    expect(res.output).toEqual(["d"]);
    expect(res.outputLines).toBe(4);
  });

  it("a poller advancing its cursor by output.length sees each line exactly once", async () => {
    // Mirrors useExecutionPolling: append data.output, advance offset by its length.
    const seen: string[] = [];
    let offset = 0;

    stagedRows = [runningRow(["l1", "l2"])];
    let res = await supabaseApi.getExecution("exec-1", offset);
    seen.push(...res.output);
    offset += res.output.length;

    // The desktop writer re-syncs the full buffer, grown by one line.
    stagedRows = [runningRow(["l1", "l2", "l3"])];
    res = await supabaseApi.getExecution("exec-1", offset);
    seen.push(...res.output);
    offset += res.output.length;

    // No new output between polls.
    res = await supabaseApi.getExecution("exec-1", offset);
    seen.push(...res.output);

    expect(seen).toEqual(["l1", "l2", "l3"]);
  });

  it("returns the whole buffer when no offset is given", async () => {
    stagedRows = [runningRow(["a", "b"])];
    const res = await supabaseApi.getExecution("exec-1");
    expect(res.output).toEqual(["a", "b"]);
    expect(res.outputLines).toBe(2);
  });
});
