import { describe, expect, it } from "vitest";
import { matchDesktopShape } from "@/app/api/orchestrator/desktopShapes";
import type { ApiClient } from "./api";
import { ApiError } from "./api-error";
import { createDesktopApi, type DesktopFetcher } from "./desktopApi";

interface Call {
  path: string;
  method: string;
  params?: Record<string, string | undefined>;
  body?: unknown;
}

function setup(answers: Record<string, unknown>) {
  const calls: Call[] = [];
  const fetcher = (async (path: string, o?: { method?: string; params?: Record<string, string | undefined>; body?: unknown }) => {
    calls.push({ path, method: o?.method ?? "GET", params: o?.params, body: o?.body });
    const key = Object.keys(answers).find((k) => path === k || path.startsWith(k + "/")) ?? path;
    return answers[key];
  }) as DesktopFetcher;
  const base = { getSomethingElse: () => "base:getSomethingElse" } as unknown as ApiClient;
  return { calls, api: createDesktopApi(fetcher, base) };
}

const ok = <T,>(data: T) => ({ success: true, data });

const execRow = (over: Record<string, unknown> = {}) => ({
  id: "e1",
  persona_id: "p1",
  trigger_id: null,
  status: "completed",
  input_data: "in",
  output_data: "a\nb\nc",
  claude_session_id: "s1",
  model_used: "m",
  input_tokens: 3,
  output_tokens: 4,
  cost_usd: null,
  error_message: null,
  duration_ms: 12,
  retry_of_execution_id: null,
  retry_count: 0,
  started_at: "t0",
  completed_at: "t1",
  created_at: "t0",
  persona_name: "P",
  persona_icon: "i",
  persona_color: "#fff",
  ...over,
});

describe("createDesktopApi", () => {
  it("delegates methods it does not override to base", () => {
    const { api } = setup({});
    expect((api as unknown as { getSomethingElse(): string }).getSomethingElse()).toBe("base:getSomethingElse");
  });

  it("refuses listEvents with the proxy's 501 body and never calls the fetcher", async () => {
    const { api, calls } = setup({});
    const err = await api.listEvents().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(501);
    expect(JSON.parse((err as ApiError).body)).toEqual({ error: "not_on_desktop", method: "GET", path: "/api/events" });
    expect(calls).toEqual([]);
  });

  it("keeps the listEvents override and the shape table in step", () => {
    expect(matchDesktopShape("GET", ["api", "events"])).toMatchObject({ served: "not_on_desktop" });
  });

  it("refuses the subscription reads with the 501 body and never calls the fetcher", async () => {
    const { api, calls } = setup({});
    const all = await api.listAllSubscriptions().catch((e: unknown) => e);
    expect(all).toBeInstanceOf(ApiError);
    expect((all as ApiError).status).toBe(501);
    expect(JSON.parse((all as ApiError).body)).toEqual({
      error: "not_on_desktop",
      method: "GET",
      path: "/api/personas/:id/subscriptions",
    });
    const one = await api.listSubscriptions("p1").catch((e: unknown) => e);
    expect(one).toBeInstanceOf(ApiError);
    expect((one as ApiError).status).toBe(501);
    expect(JSON.parse((one as ApiError).body)).toEqual({
      error: "not_on_desktop",
      method: "GET",
      path: "/api/personas/p1/subscriptions",
    });
    expect(calls).toEqual([]);
  });

  it("keeps the subscription overrides and the shape table in step", () => {
    expect(matchDesktopShape("GET", ["api", "personas", "p1", "subscriptions"])).toMatchObject({ served: "not_on_desktop" });
  });

  it("lists personas, blanking what the desktop does not send", async () => {
    const { api, calls } = setup({
      "/api/personas": ok([{ id: "p1", name: "N", description: "d", enabled: true, icon: "x", color: "#111" }]),
    });
    const [p] = await api.listPersonas();
    expect(calls).toEqual([{ path: "/api/personas", method: "GET", params: undefined, body: undefined }]);
    expect(p).toMatchObject({
      id: "p1", name: "N", description: "d", enabled: true, icon: "x", color: "#111",
      projectId: "", systemPrompt: "", structuredPrompt: null, maxConcurrent: 0, timeoutMs: 0,
      modelProfile: null, maxBudgetUsd: null, maxTurns: null, designContext: null, groupId: null,
      createdAt: "", updatedAt: "",
    });
  });

  it("gets a persona with its system prompt and no icon or color", async () => {
    const { api, calls } = setup({
      "/api/personas": ok({ id: "p1", name: "N", description: null, enabled: false, system_prompt: "sp" }),
    });
    const p = await api.getPersona("p1");
    expect(calls[0].path).toBe("/api/personas/p1");
    expect(p).toMatchObject({ systemPrompt: "sp", description: null, icon: null, color: null, enabled: false });
  });

  it("sends persona_id, status and limit, and maps rows", async () => {
    const { api, calls } = setup({
      "/api/executions": ok([execRow({ status: "incomplete" }), execRow({ id: "e2", status: "pending" })]),
    });
    const rows = await api.listExecutions({ personaId: "p1", status: "failed", limit: 5 });
    expect(calls[0].params).toEqual({ persona_id: "p1", status: "failed", limit: "5" });
    expect(rows.map((r) => r.status)).toEqual(["failed", "queued"]);
    expect(rows[0]).toMatchObject({ personaId: "p1", inputTokens: 3, costUsd: 0, createdAt: "t0", useCaseId: null });
  });

  it("applies offset on the web side by asking for limit+offset", async () => {
    const { api, calls } = setup({
      "/api/executions": ok([execRow({ id: "a" }), execRow({ id: "b" }), execRow({ id: "c" })]),
    });
    const rows = await api.listExecutions({ limit: 2, offset: 1 });
    expect(calls[0].params).toMatchObject({ limit: "3" });
    expect(calls[0].params).not.toHaveProperty("offset");
    expect(rows.map((r) => r.id)).toEqual(["b", "c"]);
  });

  it("gets an execution detail, applying the cursor without forwarding it", async () => {
    const { api, calls } = setup({ "/api/executions": ok(execRow({ status: "incomplete" })) });
    const d = await api.getExecution("e1", 1);
    expect(calls[0]).toMatchObject({ path: "/api/executions/e1", method: "GET", params: undefined });
    expect(d).toEqual({ executionId: "e1", status: "failed", outputLines: 3, output: ["b", "c"], durationMs: 12, sessionId: "s1", totalCostUsd: undefined });
  });

  it("executes with a body, cancels and reads status by unwrapping", async () => {
    const status = { workers: [], workerCounts: { total: 1, idle: 1, executing: 0 }, queueLength: 0, activeExecutions: [], hasClaudeToken: true, oauth: { connected: false, scopes: [], expiresAt: null } };
    const { api, calls } = setup({
      "/api/execute": ok({ executionId: "e9", status: "queued" }),
      "/api/executions": ok({ executionId: "e9", status: "cancelled" }),
      "/api/status": ok(status),
    });
    expect(await api.executePersona("p1", "go")).toEqual({ executionId: "e9", status: "queued" });
    expect(await api.cancelExecution("e9")).toEqual({ executionId: "e9", status: "cancelled" });
    expect(await api.getStatus()).toEqual(status);
    expect(calls[0]).toMatchObject({ path: "/api/execute", method: "POST", body: { personaId: "p1", prompt: "go" } });
    expect(calls[1]).toMatchObject({ path: "/api/executions/e9/cancel", method: "POST" });
    expect(calls[2]).toMatchObject({ path: "/api/status", method: "GET" });
  });

  it("throws ApiError 502 on success:false or a missing data", async () => {
    const failed = setup({ "/api/personas": { success: false, error: "boom", code: "E1" } });
    await expect(failed.api.listPersonas()).rejects.toMatchObject({ status: 502, body: "boom (E1)" });
    await expect(failed.api.listPersonas()).rejects.toBeInstanceOf(ApiError);
    const empty = setup({ "/api/status": { success: true } });
    await expect(empty.api.getStatus()).rejects.toMatchObject({ status: 502 });
  });

  it("composes getHealth from the raw /health and /api/status", async () => {
    const { api, calls } = setup({
      "/health": { status: "ok", service: "x", timestamp: 77 },
      "/api/status": ok({ workerCounts: { total: 2, idle: 1, executing: 1 }, hasClaudeToken: true }),
    });
    expect(await api.getHealth()).toEqual({ status: "ok", timestamp: 77, workers: { total: 2, idle: 1, executing: 1 }, hasSubscription: true });
    expect(calls.map((c) => c.path).sort()).toEqual(["/api/status", "/health"]);
  });

  it("only sends shapes the desktop serves", async () => {
    const { api, calls } = setup({
      "/api/personas": ok([]),
      "/api/executions": ok(execRow()),
      "/api/execute": ok({}),
      "/api/status": ok({ workerCounts: {}, hasClaudeToken: false }),
      "/health": { status: "ok", timestamp: 1 },
    });
    await api.listPersonas();
    await api.getPersona("p1");
    await api.getExecution("e1");
    await api.executePersona("p1", "x");
    await api.cancelExecution("e1");
    await api.getStatus();
    await api.getHealth();
    for (const c of calls) {
      expect(matchDesktopShape(c.method, c.path.split("/").filter(Boolean)), `${c.method} ${c.path}`).toMatchObject({ served: "desktop" });
    }
    const list = setup({ "/api/executions": ok([]) });
    await list.api.listExecutions({ offset: 2 });
    expect(matchDesktopShape("GET", list.calls[0].path.split("/").filter(Boolean))).toMatchObject({ served: "desktop" });
  });
});
