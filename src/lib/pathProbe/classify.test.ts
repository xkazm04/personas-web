import { describe, expect, it } from "vitest";
import { DEVICE_FRESH_MS } from "@/lib/sync/reachability";
import {
  PROBE_DEVICE_FRESH_MS,
  classifyCommand,
  classifyDeepLinks,
  classifyDevices,
  classifyDirect,
  classifyMirrorPersonas,
  classifyPairing,
  classifyProxy,
  desktopUrlRefusal,
  errorToken,
  exitCodeFor,
  formatReport,
  personaIdsFromBody,
  supabaseUrlRefusal,
  type Obs,
  type PathState,
  type Verdict,
} from "./classify";

const ok = (body: unknown): Obs => ({ kind: "status", status: 200, body });
const envelope = (ids: string[]) => ({ success: true, data: ids.map((id) => ({ id, name: "n" })) });
const NOW = Date.parse("2026-10-07T12:00:00Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe("PROBE_DEVICE_FRESH_MS", () => {
  it("equals reachability's DEVICE_FRESH_MS", () => {
    expect(PROBE_DEVICE_FRESH_MS).toBe(DEVICE_FRESH_MS);
  });
});

describe("classifyDirect", () => {
  const healthy = { health: ok({ status: "ok" }), status: ok({ success: true, data: {} }), personas: ok(envelope(["a", "b"])) };

  it("ECONNREFUSED is blocked, never broken", () => {
    const r = classifyDirect({ ...healthy, health: { kind: "refused" } });
    expect(r.verdict.state).toBe("blocked");
    expect(r.verdict.reason).toContain("not listening");
    expect(r.ids).toBeNull();
  });

  it("a 200 health with status and personas is working and yields the ids", () => {
    const r = classifyDirect(healthy);
    expect(r.verdict).toMatchObject({ id: "desktop-api.direct", direction: "web->desktop", state: "working" });
    expect(r.ids).toEqual(["a", "b"]);
  });

  it("a refused key (401/403) is blocked", () => {
    expect(classifyDirect({ ...healthy, status: { kind: "status", status: 401 } }).verdict.state).toBe("blocked");
    expect(classifyDirect({ ...healthy, personas: { kind: "status", status: 403 } }).verdict.state).toBe("blocked");
  });

  it("a 500 or a timeout is broken", () => {
    expect(classifyDirect({ ...healthy, health: { kind: "status", status: 500 } }).verdict.state).toBe("broken");
    expect(classifyDirect({ ...healthy, health: { kind: "network", code: "timeout" } }).verdict.state).toBe("broken");
  });

  it("an envelope with success false is broken", () => {
    expect(classifyDirect({ ...healthy, status: ok({ success: false, error: "x" }) }).verdict.state).toBe("broken");
    expect(classifyDirect({ ...healthy, personas: ok({ success: false }) }).verdict.state).toBe("broken");
  });

  it("an unset key is blocked", () => {
    const r = classifyDirect({ ...healthy, status: { kind: "unset", name: "TEAM_API_KEY" } });
    expect(r.verdict).toMatchObject({ state: "blocked", reason: "/api/status: TEAM_API_KEY unset" });
  });
});

describe("personaIdsFromBody", () => {
  it("reads an envelope or a bare array, rejects anything else", () => {
    expect(personaIdsFromBody(envelope(["x"]))).toEqual(["x"]);
    expect(personaIdsFromBody([{ id: "y" }])).toEqual(["y"]);
    expect(personaIdsFromBody({ data: [] })).toBeNull();
    expect(personaIdsFromBody([{ name: "no id" }])).toBeNull();
    expect(personaIdsFromBody("html")).toBeNull();
  });
});

describe("classifyProxy", () => {
  it("a 401 is blocked", () => {
    expect(classifyProxy({ kind: "status", status: 401 }, ["a"]).state).toBe("blocked");
  });

  it("web not running is blocked", () => {
    expect(classifyProxy({ kind: "refused" }, ["a"])).toMatchObject({ state: "blocked", reason: "web not running" });
  });

  it("no session is blocked", () => {
    expect(classifyProxy({ kind: "no-session" }, ["a"])).toMatchObject({ state: "blocked", reason: "no session" });
  });

  it("503 orchestrator_not_configured / auth_unavailable is blocked, any other 503 broken", () => {
    expect(classifyProxy({ kind: "status", status: 503, body: { error: "orchestrator_not_configured" } }, ["a"]).state).toBe("blocked");
    expect(classifyProxy({ kind: "status", status: 503, body: { error: "auth_unavailable" } }, ["a"]).state).toBe("blocked");
    expect(classifyProxy({ kind: "status", status: 503, body: { error: "other" } }, ["a"]).state).toBe("broken");
  });

  it("a 500 or 502 is broken", () => {
    expect(classifyProxy({ kind: "status", status: 500 }, ["a"]).state).toBe("broken");
    expect(classifyProxy({ kind: "status", status: 502, body: { error: "upstream_unreachable" } }, ["a"]).state).toBe("broken");
  });

  it("ids that differ from the direct ids are broken, naming both counts", () => {
    const v = classifyProxy(ok(envelope(["a", "b", "c"])), ["a", "b"]);
    expect(v.state).toBe("broken");
    expect(v.reason).toContain("(3)");
    expect(v.reason).toContain("(2)");
  });

  it("ids equal to the direct ids are working, in any order", () => {
    expect(classifyProxy(ok(envelope(["b", "a"])), ["a", "b"]).state).toBe("working");
  });

  it("a 200 without the desktop to compare against is blocked", () => {
    expect(classifyProxy(ok(envelope(["a"])), null)).toMatchObject({
      state: "blocked",
      reason: "cannot compare without the desktop",
    });
  });
});

describe("classifyDevices", () => {
  it("a stamp within DEVICE_FRESH_MS is working", () => {
    expect(classifyDevices(ok([{ last_seen_at: ago(30_000) }]), NOW).state).toBe("working");
  });

  it("a stamp older than DEVICE_FRESH_MS is broken 'mirror stale'", () => {
    const v = classifyDevices(ok([{ last_seen_at: ago(PROBE_DEVICE_FRESH_MS + 1000) }]), NOW);
    expect(v.state).toBe("broken");
    expect(v.reason).toMatch(/^mirror stale/);
  });

  it("the freshest of several devices decides", () => {
    expect(classifyDevices(ok([{ last_seen_at: ago(9e9) }, { last_seen_at: ago(1000) }]), NOW).state).toBe("working");
  });

  it("no rows is blocked; no session is blocked", () => {
    expect(classifyDevices(ok([]), NOW).state).toBe("blocked");
    expect(classifyDevices({ kind: "no-session" }, NOW).state).toBe("blocked");
  });
});

describe("classifyMirrorPersonas", () => {
  it("blocked when the desktop could not be read", () => {
    expect(classifyMirrorPersonas(ok([{ id: "a" }]), null)).toMatchObject({
      state: "blocked",
      reason: "cannot compare without the desktop",
    });
  });

  it("working when every desktop id is mirrored, extra mirror rows allowed", () => {
    expect(classifyMirrorPersonas(ok([{ id: "a" }, { id: "b" }, { id: "old" }]), ["a", "b"]).state).toBe("working");
  });

  it("broken when a desktop id is missing", () => {
    const v = classifyMirrorPersonas(ok([{ id: "a" }]), ["a", "b"]);
    expect(v).toMatchObject({ state: "broken", reason: "1 of 2 desktop ids missing from the mirror" });
  });
});

describe("classifyCommand", () => {
  it("a newest command that completed is working", () => {
    expect(classifyCommand("run_persona", ok([{ status: "completed" }]))).toMatchObject({
      id: "command-plane.run_persona",
      direction: "web->desktop->web",
      state: "working",
    });
  });

  it("a rejected 'replayed: ...' is broken with the token 'replayed'", () => {
    const v = classifyCommand("pause_persona", ok([{ status: "rejected", error_message: "replayed: nonce abc seen" }]));
    expect(v.state).toBe("broken");
    expect(v.reason).toBe("rejected replayed");
    expect(v.reason).not.toContain("nonce");
  });

  it("failed is broken with its token", () => {
    expect(classifyCommand("chat_send", ok([{ status: "failed", error_message: "persona_not_found" }])).reason).toBe(
      "failed persona_not_found",
    );
  });

  it("expired is broken 'desktop did not answer'", () => {
    expect(classifyCommand("resume_persona", ok([{ status: "expired" }]))).toMatchObject({
      state: "broken",
      reason: "desktop did not answer",
    });
  });

  it("no rows is blocked 'no command issued yet'", () => {
    expect(classifyCommand("review_decide", ok([]))).toMatchObject({ state: "blocked", reason: "no command issued yet" });
  });

  it("a still-pending newest row is blocked", () => {
    expect(classifyCommand("cancel_execution", ok([{ status: "pending" }])).state).toBe("blocked");
  });
});

describe("errorToken", () => {
  it("takes the text before ':'", () => {
    expect(errorToken("controller_revoked")).toBe("controller_revoked");
    expect(errorToken(" bad_signature : detail")).toBe("bad_signature");
    expect(errorToken(null)).toBe("no error message");
  });
});

describe("classifyPairing", () => {
  const active = { status: "active", revoked_at: null, activated_at: "2026-10-06T10:00:00Z", created_at: "2026-10-06T09:59:00Z" };
  const none = ok([]);

  it("no controller is blocked", () => {
    expect(classifyPairing(ok([]), none).state).toBe("blocked");
  });

  it("an active controller and no refusal is working", () => {
    expect(classifyPairing(ok([active]), none).state).toBe("working");
  });

  it("only revoked controllers is broken", () => {
    expect(classifyPairing(ok([{ ...active, status: "revoked", revoked_at: "2026-10-06T11:00:00Z" }]), none).state).toBe("broken");
  });

  it("a newer signed command refused controller_not_paired is broken", () => {
    const refused = ok([{ error_message: "controller_not_paired", requested_at: "2026-10-07T08:00:00Z" }]);
    expect(classifyPairing(ok([active]), refused)).toMatchObject({ state: "broken", reason: "newer signed command refused controller_not_paired" });
  });

  it("a refusal older than the activation does not count, nor does another token", () => {
    const old = ok([
      { error_message: "controller_revoked", requested_at: "2026-10-05T08:00:00Z" },
      { error_message: "bad_signature", requested_at: "2026-10-07T08:00:00Z" },
    ]);
    expect(classifyPairing(ok([active]), old).state).toBe("working");
  });
});

describe("classifyDeepLinks", () => {
  it("persona and execution links are broken 'no handler' whatever the registry says", () => {
    for (const scheme of ["registered", "absent", "not-windows"] as const) {
      const rows = classifyDeepLinks(scheme).filter((v) => v.id === "deep-links.persona" || v.id === "deep-links.execution");
      expect(rows).toHaveLength(2);
      expect(rows.every((v) => v.state === "broken" && v.reason === "no handler")).toBe(true);
    }
  });

  it("handled routes follow the scheme registration", () => {
    const reg = classifyDeepLinks("registered").find((v) => v.id === "deep-links.pair");
    const abs = classifyDeepLinks("absent").find((v) => v.id === "deep-links.pair");
    expect(reg?.state).toBe("working");
    expect(abs?.state).toBe("blocked");
  });
});

describe("exitCodeFor", () => {
  const v = (...states: PathState[]): Verdict[] =>
    states.map((state, i) => ({ id: `p${i}`, direction: "both", state, reason: "" }));

  it.each([
    [["working"], 0],
    [["retired"], 0],
    [["working", "retired"], 0],
    [[], 0],
    [["broken"], 1],
    [["working", "broken"], 1],
    [["blocked", "broken"], 1],
    [["retired", "broken", "blocked", "working"], 1],
    [["blocked"], 3],
    [["working", "blocked"], 3],
    [["retired", "blocked"], 3],
  ] as [PathState[], number][])("%j -> %i", (states, code) => {
    expect(exitCodeFor(v(...states))).toBe(code);
  });
});

describe("config refusals", () => {
  it("PROBE_DESKTOP_URL must be loopback", () => {
    expect(desktopUrlRefusal("http://127.0.0.1:9420")).toBeNull();
    expect(desktopUrlRefusal("http://localhost:9420")).toBeNull();
    expect(desktopUrlRefusal("http://[::1]:9420")).toBeNull();
    expect(desktopUrlRefusal("http://192.168.1.5:9420")).toBe("PROBE_DESKTOP_URL is not a loopback URL");
    expect(desktopUrlRefusal("http://127.0.0.1.evil.com")).not.toBeNull();
    expect(desktopUrlRefusal("nope")).not.toBeNull();
  });

  it("NEXT_PUBLIC_SUPABASE_URL must be pvfw or local; unset is allowed", () => {
    expect(supabaseUrlRefusal("https://pvfwabc.supabase.co")).toBeNull();
    expect(supabaseUrlRefusal("http://127.0.0.1:54321")).toBeNull();
    expect(supabaseUrlRefusal("http://localhost:54321")).toBeNull();
    expect(supabaseUrlRefusal(undefined)).toBeNull();
    expect(supabaseUrlRefusal("https://prodxyz.supabase.co")).toBe(
      "NEXT_PUBLIC_SUPABASE_URL host is not the pvfw test project or localhost",
    );
    expect(supabaseUrlRefusal("https://x.pvfw.evil.com")).not.toBeNull();
  });
});

describe("formatReport", () => {
  it("aligns columns and ends with the summary", () => {
    const out = formatReport([
      { id: "a", direction: "both", state: "working", reason: "r1" },
      { id: "longer-id", direction: "web->desktop", state: "blocked", reason: "r2" },
    ]).split("\n");
    expect(out).toHaveLength(3);
    expect(out[0].indexOf("working")).toBe(out[1].indexOf("blocked"));
    expect(out[2]).toBe("2 paths: 1 working, 0 broken, 1 blocked, 0 retired (exit 3)");
  });
});
