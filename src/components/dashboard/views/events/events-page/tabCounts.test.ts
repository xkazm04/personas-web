import { describe, it, expect } from "vitest";
import { tabCounts } from "./tabCounts";

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i }));
const base = { events: [], listNotServed: false, subscriptions: [], subscriptionsRead: true };

describe("tabCounts", () => {
  it("hides the events count when the list is not served and nothing is held", () => {
    expect(tabCounts({ ...base, listNotServed: true }).eventCount).toBeUndefined();
  });
  it("keeps held events when the list is not served", () => {
    expect(tabCounts({ ...base, listNotServed: true, events: rows(2) }).eventCount).toBe(2);
  });
  it("reads 0 when served and empty", () => {
    expect(tabCounts(base).eventCount).toBe(0);
  });
  it("hides the subscriptions count until a read has succeeded", () => {
    expect(tabCounts({ ...base, subscriptionsRead: false }).subscriptionCount).toBeUndefined();
    expect(tabCounts({ ...base, subscriptionsRead: false, subscriptions: rows(3) }).subscriptionCount).toBeUndefined();
  });
  it("shows the subscriptions count once read", () => {
    expect(tabCounts(base).subscriptionCount).toBe(0);
    expect(tabCounts({ ...base, subscriptions: rows(3) }).subscriptionCount).toBe(3);
  });
});
