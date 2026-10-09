import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { controllerName, pairingProof, parsePairFragment, proofMessage, takePairFragment } from "./pairing";

const PAIRING_ID = "9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d";
// 32 bytes 0x00..0x1f, base64url.
const SECRET = Buffer.from(Array.from({ length: 32 }, (_, i) => i)).toString("base64url");

describe("pairing fragment", () => {
  it("reads #pair=<uuid>.<32-byte base64url secret>", () => {
    expect(parsePairFragment(`#pair=${PAIRING_ID}.${SECRET}`)).toEqual({ pairingId: PAIRING_ID, secret: SECRET });
    expect(parsePairFragment(`pair=${PAIRING_ID.toUpperCase()}.${SECRET}`)?.pairingId).toBe(PAIRING_ID);
  });

  it("refuses anything else", () => {
    expect(parsePairFragment("")).toBeNull();
    expect(parsePairFragment("#section")).toBeNull();
    expect(parsePairFragment(`#pair=not-a-uuid.${SECRET}`)).toBeNull();
    expect(parsePairFragment(`#pair=${PAIRING_ID}.${SECRET.slice(0, 20)}`)).toBeNull();
    expect(parsePairFragment(`#pair=${PAIRING_ID}.${SECRET}&x=1`)).toBeNull();
    expect(parsePairFragment(`#pair=${PAIRING_ID}`)).toBeNull();
  });
});

describe("pairing proof", () => {
  it("is base64url HMAC-SHA256(secret bytes, pairing_id|controller_id|public_key)", async () => {
    const controllerId = "0c2b9a8f-7e6d-4c5b-8a49-3827160f5e4d";
    const publicKey = "ebVWLo_mVPlAeLES6KmLp5AfhTrmlb7X4OORC60ElmQ";
    const expected = createHmac("sha256", Buffer.from(SECRET, "base64url"))
      .update(`${PAIRING_ID}|${controllerId}|${publicKey}`)
      .digest("base64url");
    expect(proofMessage(PAIRING_ID, controllerId, publicKey)).toBe(`${PAIRING_ID}|${controllerId}|${publicKey}`);
    expect(await pairingProof(SECRET, PAIRING_ID, controllerId, publicKey)).toBe(expected);
  });
});

describe("controller name", () => {
  it("names the device and browser from the user agent", () => {
    expect(controllerName("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")).toBe("iPhone · Safari");
    expect(controllerName("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36")).toBe("Android · Chrome");
    expect(controllerName("curl/8")).toBe("Browser");
  });
});

describe("takePairFragment", () => {
  const nextState = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: {} };
  const fakeHistory = () => ({ state: nextState as unknown, replaceState: vi.fn() });
  const loc = (hash: string) => ({ hash, pathname: "/dashboard/settings", search: "?tab=phone" });

  it("scrubs a valid fragment once, with a state Next will sync, and returns it parsed", () => {
    const h = fakeHistory();
    const hash = `#pair=${PAIRING_ID}.${SECRET}`;
    expect(takePairFragment(loc(hash), h)).toEqual({ pairingId: PAIRING_ID, secret: SECRET });
    expect(h.replaceState).toHaveBeenCalledTimes(1);
    const [state, , url] = h.replaceState.mock.calls[0];
    expect(state ?? {}).not.toHaveProperty("__NA");
    expect(state ?? {}).not.toHaveProperty("_N");
    expect(url).toBe("/dashboard/settings?tab=phone");
  });

  it("scrubs a malformed #pair= and returns null", () => {
    const h = fakeHistory();
    expect(takePairFragment(loc("#pair=garbage"), h)).toBeNull();
    expect(h.replaceState).toHaveBeenCalledTimes(1);
  });

  it("leaves other hashes alone", () => {
    for (const hash of ["#section", ""]) {
      const h = fakeHistory();
      expect(takePairFragment(loc(hash), h)).toBeNull();
      expect(h.replaceState).not.toHaveBeenCalled();
    }
  });
});
