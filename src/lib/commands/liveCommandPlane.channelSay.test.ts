import { describe, expect, it, vi } from "vitest";

/** The row a signed channel_say inserts (weekend item E): verb, persona, target device, params, envelope persona. */

const insert = vi.fn(async (_row: Record<string, unknown>) => ({ error: null }));
vi.mock("@/lib/supabase", () => ({ getSupabase: () => ({ from: () => ({ insert }) }) }));
vi.mock("./signer", () => ({
  loadController: async () => ({ controllerId: "ctl-1" }),
  signEnvelope: async () => "sig",
}));

const { sendLiveCommand } = await import("./liveCommandPlane");

describe("sendLiveCommand: channel_say", () => {
  it("inserts command_type channel_say for the master, to the persona's device, params exactly { message }", async () => {
    await sendLiveCommand({ id: "c1", verb: "channel_say", personaId: "master-1", deviceId: "dev-1", params: { message: "hi" }, nowMs: Date.parse("2026-10-08T10:00:00.000Z") });
    const row = insert.mock.calls[0][0];
    expect(row).toMatchObject({
      id: "c1",
      command_type: "channel_say",
      persona_id: "master-1",
      target_device_id: "dev-1",
      params: { message: "hi" },
      prompt: null,
      signature: "sig",
    });
    const envelope = JSON.parse(row.envelope as string);
    expect(envelope).toMatchObject({ type: "channel_say", persona: "master-1", dev: "dev-1", params: { message: "hi" } });
  });
});
