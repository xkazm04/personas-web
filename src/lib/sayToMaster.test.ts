import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `api.sayToMaster` on each plane that sends (weekend item E): the command it
 * hands the plane (verb, persona, device, params), and the row the live plane
 * inserts for it. The plane's store is faked; nothing touches a network.
 */

const sendPersonaCommand = vi.fn(async () => ({ commandId: "cmd-1" }));
vi.mock("./commands/personaCommands", () => ({
  sendPersonaCommand,
  knownOwnerDevice: () => undefined,
}));
vi.mock("./supabase", () => ({ getSupabase: () => ({ from: () => ({}) }) }));

const { supabaseApi } = await import("./supabaseApi");
const { mockApi } = await import("./mockApi");

beforeEach(() => sendPersonaCommand.mockClear());

describe("supabaseApi.sayToMaster", () => {
  it("sends channel_say for the master persona, to its own device, with exactly { message } trimmed", async () => {
    const ack = await supabaseApi.sayToMaster({ personaId: "master-1", deviceId: "dev-1", message: "  keep the build green  " });
    expect(ack).toEqual({ commandId: "cmd-1" });
    expect(sendPersonaCommand).toHaveBeenCalledWith("channel_say", "master-1", { message: "keep the build green" }, { demo: false, deviceId: "dev-1" });
    const params = (sendPersonaCommand.mock.calls[0] as unknown[])[2];
    expect(JSON.stringify(params)).toBe('{"message":"keep the build green"}');
  });

  it("refuses an empty or over-long message before anything is sent", async () => {
    await expect(supabaseApi.sayToMaster({ personaId: "m", deviceId: "d", message: "   " })).rejects.toThrow("empty_message");
    await expect(supabaseApi.sayToMaster({ personaId: "m", deviceId: "d", message: "x".repeat(2001) })).rejects.toThrow("message_too_long");
    expect(sendPersonaCommand).not.toHaveBeenCalled();
  });
});

describe("mockApi.sayToMaster", () => {
  it("sends channel_say through the demo plane", async () => {
    await mockApi.sayToMaster({ personaId: "master-1", message: " hi " });
    const call = sendPersonaCommand.mock.calls[0] as unknown[];
    expect(call.slice(0, 3)).toEqual(["channel_say", "master-1", { message: "hi" }]);
    expect(call[3]).toMatchObject({ demo: true });
  });

  it("refuses an empty message", async () => {
    await expect(mockApi.sayToMaster({ personaId: "m", message: "" })).rejects.toThrow("empty_message");
  });
});
