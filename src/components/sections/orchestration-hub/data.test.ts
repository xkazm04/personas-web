import { describe, it, expect } from "vitest";
import { TRIGGERS } from "./data";

/**
 * The hub's trigger ids are the desktop's trigger kinds, spelled the way the
 * app stores them. Snapshot of `TriggerKind` from the desktop's ts-rs bindings
 * (`personas/src/lib/bindings/TriggerKind.ts`, last changed 5e696f7d77,
 * 2026-08-19). When the app adds or renames a kind, update this list and the
 * hub together.
 */
const DESKTOP_TRIGGER_KINDS = [
  "manual",
  "schedule",
  "polling",
  "webhook",
  "chain",
  "event_listener",
  "file_watcher",
  "clipboard",
  "app_focus",
  "composite",
] as const;

describe("orchestration hub trigger ids", () => {
  it("are exactly the desktop's TriggerKind vocabulary", () => {
    expect(TRIGGERS.map((t) => t.id).sort()).toEqual([...DESKTOP_TRIGGER_KINDS].sort());
  });
});
