import { describe, expect, it } from "vitest";
import { registerSyncedBindings, WATCHED_TABLES } from "./syncedRealtimeBindings";

type Binding = { event: string; schema: string; table: string };

function register(): Binding[] {
  const bindings: Binding[] = [];
  const noop = () => {};
  registerSyncedBindings(
    { on: (_type, filter) => void bindings.push(filter) },
    { onTableChange: noop, onCommandUpdate: noop, onControllerUpdate: noop },
  );
  return bindings;
}

describe("synced realtime bindings (scan d4b90e7a F11)", () => {
  it("binds INSERT and UPDATE for every watched table", () => {
    const bindings = register();
    for (const table of WATCHED_TABLES) {
      const events = bindings.filter((b) => b.table === table).map((b) => b.event).sort();
      expect(events).toEqual(["INSERT", "UPDATE"]);
    }
  });

  it("never binds DELETE or '*'", () => {
    for (const b of register()) {
      expect(b.event).not.toBe("DELETE");
      expect(b.event).not.toBe("*");
    }
  });

  it("keeps the two command-plane UPDATE bindings", () => {
    const bindings = register();
    for (const table of ["pending_commands", "command_controllers"]) {
      expect(bindings.filter((b) => b.table === table)).toEqual([{ event: "UPDATE", schema: "public", table }]);
    }
  });
});
