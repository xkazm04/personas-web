import { describe, it, expect } from "vitest";
import { decodeFlow } from "./data";

// encodeFlow is browser-gated (typeof window), so build the hash directly the
// same way it does: base64( encodeURIComponent( JSON ) ).
const hash = (obj: unknown) => btoa(encodeURIComponent(JSON.stringify(obj)));

const validState = {
  nodes: [{ id: "n1" }, { id: "n2" }],
  wires: [{ from: "n1", to: "n2", label: "emits" }],
};

describe("decodeFlow", () => {
  it("decodes a well-formed flow", () => {
    const out = decodeFlow(hash(validState));
    expect(out).not.toBeNull();
    expect(out!.nodes.map((n) => n.id)).toEqual(["n1", "n2"]);
    expect(out!.wires).toHaveLength(1);
  });

  it("rejects un-decodable / non-array input", () => {
    expect(decodeFlow("@@@not-base64@@@")).toBeNull();
    expect(decodeFlow(hash({ nodes: "x", wires: [] }))).toBeNull();
    expect(decodeFlow(hash({ nodes: [], wires: "x" }))).toBeNull();
  });

  it("rejects malformed or duplicate node ids", () => {
    expect(decodeFlow(hash({ nodes: [{ id: "bad" }], wires: [] }))).toBeNull();
    expect(decodeFlow(hash({ nodes: [{ id: "n1" }, { id: "n1" }], wires: [] }))).toBeNull();
  });

  it("rejects wires that reference a phantom node id (the Wave-3 fix)", () => {
    const dangling = { nodes: [{ id: "n1" }], wires: [{ from: "n1", to: "n9", label: "x" }] };
    expect(decodeFlow(hash(dangling))).toBeNull();
  });

  it("rejects wires with a non-string from/to/label", () => {
    expect(
      decodeFlow(hash({ nodes: [{ id: "n1" }, { id: "n2" }], wires: [{ from: "n1", to: "n2", label: 5 }] })),
    ).toBeNull();
    expect(
      decodeFlow(hash({ nodes: [{ id: "n1" }, { id: "n2" }], wires: [{ from: 1, to: "n2", label: "x" }] })),
    ).toBeNull();
  });
});
