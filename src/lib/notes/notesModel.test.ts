import { describe, expect, it } from "vitest";
import {
  NO_PROJECT_KEY,
  buildNoteZones,
  compareInZone,
  isNoteStatus,
  mapNoteRow,
  noteTotals,
  SYNCED_NOTE_COLUMNS,
  type SyncedNoteRow,
  railOf,
  railPosition,
  type NoteStatus,
  type SyncedNote,
} from "./notesModel";

let seq = 0;
function note(over: Partial<SyncedNote> & { status?: NoteStatus } = {}): SyncedNote {
  seq++;
  return {
    id: `n${seq}`,
    deviceId: "dev",
    projectName: null,
    title: `Note ${seq}`,
    bodyMd: "",
    status: "draft",
    orderIndex: 0,
    dispatchTarget: null,
    resultSummary: null,
    openReviews: 0,
    unreadComments: 0,
    publishedAt: null,
    startedAt: null,
    completedAt: null,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    ...over,
  };
}

describe("isNoteStatus", () => {
  it("accepts the seven synced statuses and refuses archived and junk", () => {
    for (const s of ["draft", "published", "in_progress", "completed", "scoped", "cut", "shipped"]) {
      expect(isNoteStatus(s)).toBe(true);
    }
    expect(isNoteStatus("archived")).toBe(false);
    expect(isNoteStatus("")).toBe(false);
    expect(isNoteStatus(null)).toBe(false);
    expect(isNoteStatus(3)).toBe(false);
  });
});

describe("railOf / railPosition", () => {
  it("puts draft on both rails, plan statuses on plan, the rest on brainstorm", () => {
    expect(railOf("draft")).toBe("shared");
    expect(railOf("scoped")).toBe("plan");
    expect(railOf("cut")).toBe("plan");
    expect(railOf("shipped")).toBe("plan");
    expect(railOf("published")).toBe("brainstorm");
    expect(railOf("in_progress")).toBe("brainstorm");
    expect(railOf("completed")).toBe("brainstorm");
  });

  it("counts the step on the note's own rail", () => {
    expect(railPosition("draft")).toMatchObject({ rail: "shared", index: 0 });
    expect(railPosition("in_progress")).toMatchObject({ rail: "brainstorm", index: 2 });
    expect(railPosition("completed").index).toBe(3);
    expect(railPosition("cut")).toMatchObject({ rail: "plan", index: 2 });
    expect(railPosition("shipped").steps).toEqual(["draft", "scoped", "cut", "shipped"]);
  });
});

describe("compareInZone", () => {
  it("reads plan first, then drafts, then brainstorm, as the desktop Quest Log does", () => {
    const order: NoteStatus[] = ["completed", "draft", "published", "shipped", "scoped", "in_progress", "cut"];
    const sorted = order.map((status) => note({ status })).sort(compareInZone).map((n) => n.status);
    expect(sorted).toEqual(["scoped", "cut", "shipped", "draft", "published", "in_progress", "completed"]);
  });

  it("breaks a status tie by the pad's order index, then by title", () => {
    const a = note({ status: "scoped", orderIndex: 2, title: "A" });
    const b = note({ status: "scoped", orderIndex: 1, title: "Z" });
    const c = note({ status: "scoped", orderIndex: 1, title: "M" });
    expect([a, b, c].sort(compareInZone).map((n) => n.title)).toEqual(["M", "Z", "A"]);
  });
});

describe("buildNoteZones", () => {
  it("returns no zones for no notes", () => {
    expect(buildNoteZones([])).toEqual([]);
  });

  it("orders projects alphabetically, case-insensitively, with the no-project bucket last", () => {
    const zones = buildNoteZones([
      note({ projectName: null }),
      note({ projectName: "zeta" }),
      note({ projectName: "Alpha" }),
      note({ projectName: "beta" }),
      note({ projectName: "   " }),
    ]);
    expect(zones.map((z) => z.key)).toEqual(["Alpha", "beta", "zeta", NO_PROJECT_KEY]);
    expect(zones[3].name).toBeNull();
    expect(zones[3].notes).toHaveLength(2);
  });

  it("keeps a zone's seat however many goals or reviews it holds", () => {
    const busy = Array.from({ length: 6 }, () => note({ projectName: "Zoo", openReviews: 3 }));
    const zones = buildNoteZones([...busy, note({ projectName: "Ant" })]);
    expect(zones.map((z) => z.key)).toEqual(["Ant", "Zoo"]);
  });

  it("groups by trimmed name, sorts inside the zone and sums its counts", () => {
    const zones = buildNoteZones([
      note({ projectName: "Web ", status: "completed", openReviews: 1, unreadComments: 2 }),
      note({ projectName: "Web", status: "scoped", unreadComments: 1 }),
      note({ projectName: "Web", status: "draft", openReviews: 2 }),
    ]);
    expect(zones).toHaveLength(1);
    expect(zones[0].name).toBe("Web");
    expect(zones[0].notes.map((n) => n.status)).toEqual(["scoped", "draft", "completed"]);
    expect(zones[0].openReviews).toBe(3);
    expect(zones[0].unreadComments).toBe(3);
  });

  it("does not reorder its input", () => {
    const input = [note({ projectName: "B" }), note({ projectName: "A" })];
    const ids = input.map((n) => n.id);
    buildNoteZones(input);
    expect(input.map((n) => n.id)).toEqual(ids);
  });
});

describe("mapNoteRow", () => {
  const row: SyncedNoteRow = {
    id: "a",
    device_id: "dev-1",
    project_name: "Web",
    title: "Ship notes",
    body_md: null,
    status: "in_progress",
    order_index: null,
    dispatch_target: "athena_goals",
    result_summary: "   ",
    open_reviews: 2,
    unread_comments: -1,
    published_at: "2026-10-01T00:00:00Z",
    started_at: null,
    completed_at: null,
    created_at: "2026-09-30T00:00:00Z",
    updated_at: "2026-10-02T00:00:00Z",
  };

  it("camelCases a row and normalises the nullable columns", () => {
    expect(mapNoteRow(row)).toEqual({
      id: "a",
      deviceId: "dev-1",
      projectName: "Web",
      title: "Ship notes",
      bodyMd: "",
      status: "in_progress",
      orderIndex: 0,
      dispatchTarget: "athena_goals",
      resultSummary: null,
      openReviews: 2,
      unreadComments: 0,
      publishedAt: "2026-10-01T00:00:00Z",
      startedAt: null,
      completedAt: null,
      createdAt: "2026-09-30T00:00:00Z",
      updatedAt: "2026-10-02T00:00:00Z",
    });
  });

  it("drops a row whose status it cannot draw, and an unknown dispatch target", () => {
    expect(mapNoteRow({ ...row, status: "archived" })).toBeNull();
    expect(mapNoteRow({ ...row, dispatch_target: "mars" })?.dispatchTarget).toBeNull();
  });

  it("selects exactly the mapped columns", () => {
    expect(SYNCED_NOTE_COLUMNS.split(",").sort()).toEqual(Object.keys(row).sort());
  });
});

describe("noteTotals", () => {
  it("counts notes that need review separately from the reviews themselves", () => {
    const totals = noteTotals([
      note({ openReviews: 2, unreadComments: 1 }),
      note({ openReviews: 1 }),
      note({ unreadComments: 4 }),
    ]);
    expect(totals).toEqual({ notes: 3, needsReview: 2, openReviews: 3, unreadComments: 5 });
  });
});
