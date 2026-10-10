import { describe, expect, it } from "vitest";
import { fromWireEventStatus } from "./eventWireStatus";

// Acceptance case 1 (challenge event-A): the desktop syncs its status string
// verbatim (../personas src-tauri/src/cloud/sync/rows.rs:413), so the web must
// read the desktop's vocabulary, not only its own six labels.
describe("fromWireEventStatus - the desktop vocabulary onto the web's", () => {
  it("reads both desktop success terminals as processed", () => {
    expect(fromWireEventStatus("delivered")).toBe("processed");
    expect(fromWireEventStatus("completed")).toBe("processed");
  });

  it("keeps skipped, the desktop's typed non-delivery", () => {
    expect(fromWireEventStatus("skipped")).toBe("skipped");
  });

  it("passes the shared statuses through unchanged", () => {
    for (const s of ["pending", "processing", "failed", "dead_letter", "discarded"] as const) {
      expect(fromWireEventStatus(s)).toBe(s);
    }
  });

  it("answers null for a string no desktop variant emits", () => {
    expect(fromWireEventStatus("exploded")).toBeNull();
  });
});
