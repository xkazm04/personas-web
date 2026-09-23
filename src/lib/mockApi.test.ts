import { describe, expect, it } from "vitest";
import { mockApi } from "./mockApi";

// demo-data-plane/network-faithful-mocks: a mock write mutates the in-session
// copy, so the next read (the review queue's 15s poll, the home page's fetch)
// sees it. Before this, updateEvent returned a patched copy and never wrote it
// back, so every committed review verdict snapped back to pending on the next poll.
describe("mockApi.updateEvent write-through", () => {
  it("a verdict survives the next listEvents read", async () => {
    const before = await mockApi.listEvents({ eventType: "manual_review" });
    const target = before.find((e) => e.status === "pending");
    expect(target).toBeDefined();
    const id = target!.id;

    const returned = await mockApi.updateEvent(id, { status: "processed" });
    expect(returned.status).toBe("processed");

    const after = await mockApi.listEvents({ eventType: "manual_review" });
    const row = after.find((e) => e.id === id);
    expect(row?.status).toBe("processed");
    expect(row?.processedAt).not.toBeNull();
  });

  it("reviewer notes sent as metadata are readable from the stored payload", async () => {
    const list = await mockApi.listEvents({ eventType: "manual_review" });
    const target = list.find((e) => e.status === "pending");
    expect(target).toBeDefined();
    await mockApi.updateEvent(target!.id, {
      status: "failed",
      metadata: JSON.stringify({ reviewerNotes: "unsafe" }),
    });
    const after = await mockApi.listEvents({ eventType: "manual_review" });
    const row = after.find((e) => e.id === target!.id)!;
    expect(row.status).toBe("failed");
    expect(JSON.parse(row.payload ?? "{}").reviewerNotes).toBe("unsafe");
  });

  it("the resolver sent as metadata is stored with the notes; other keys are not", async () => {
    const list = await mockApi.listEvents({ eventType: "manual_review" });
    const target = list.find((e) => e.status === "pending");
    expect(target).toBeDefined();
    await mockApi.updateEvent(target!.id, {
      status: "processed",
      metadata: JSON.stringify({ resolvedBy: "System", severity: "info" }),
    });
    const after = await mockApi.listEvents({ eventType: "manual_review" });
    const payload = JSON.parse(after.find((e) => e.id === target!.id)!.payload ?? "{}");
    expect(payload.resolvedBy).toBe("System");
    expect(payload.severity).toBe(JSON.parse(target!.payload ?? "{}").severity);
  });

  it("an unknown id still 404s and mutates nothing", async () => {
    const before = JSON.stringify(await mockApi.listEvents());
    await expect(mockApi.updateEvent("nope", { status: "processed" })).rejects.toMatchObject({ status: 404 });
    expect(JSON.stringify(await mockApi.listEvents())).toBe(before);
  });
});
