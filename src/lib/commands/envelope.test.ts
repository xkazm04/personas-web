import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildEnvelope, envelopeTimes, fromBase64Url, toBase64Url, type EnvelopeFields } from "./envelope";
import { signWithKey } from "./signer";

/**
 * The shared test vector (fixtures/command-envelope-v1.json, identical in the
 * desktop repo): web must SIGN to these exact bytes, the desktop must verify
 * them. Ed25519 is deterministic, so a fixed seed gives a fixed signature.
 */
interface Fixture {
  seedHex: string;
  publicKey: string;
  envelope: string;
  signature: string;
  tamperedEnvelope: string;
}

const fixture = JSON.parse(readFileSync(join(process.cwd(), "fixtures", "command-envelope-v1.json"), "utf8")) as Fixture;

// PKCS#8 wrapper for a raw Ed25519 seed (RFC 8410), as in scripts/gen-command-envelope-fixture.mjs.
const PKCS8_PREFIX = "302e020100300506032b657004220420";
const hex = (h: string) => Uint8Array.from(h.match(/../g)!.map((b) => parseInt(b, 16)));

async function fixtureKeys() {
  const pkcs8 = new Uint8Array([...hex(PKCS8_PREFIX), ...hex(fixture.seedHex)]);
  const privateKey = await crypto.subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, false, ["sign"]);
  const publicKey = await crypto.subtle.importKey("raw", fromBase64Url(fixture.publicKey), { name: "Ed25519" }, true, ["verify"]);
  return { privateKey, publicKey };
}

describe("command envelope v1: the shared fixture", () => {
  it("buildEnvelope reproduces the fixture's envelope text byte for byte (key order is the contract)", () => {
    const parsed = JSON.parse(fixture.envelope) as EnvelopeFields & { v: number };
    // Feed the fields in a scrambled order: the output order must not depend on it.
    const scrambled: EnvelopeFields = {
      ctl: parsed.ctl,
      exp: parsed.exp,
      iat: parsed.iat,
      params: parsed.params,
      persona: parsed.persona,
      type: parsed.type,
      dev: parsed.dev,
      id: parsed.id,
    };
    expect(buildEnvelope(scrambled)).toBe(fixture.envelope);
  });

  it("signWithKey over the fixture envelope with the fixture seed gives exactly the fixture signature", async () => {
    const { privateKey } = await fixtureKeys();
    const signature = await signWithKey(privateKey, fixture.envelope);
    expect(signature).toBe(fixture.signature);
    expect(fromBase64Url(signature)).toHaveLength(64);
  });

  it("the fixture signature verifies against the fixture public key", async () => {
    const { publicKey } = await fixtureKeys();
    const ok = await crypto.subtle.verify({ name: "Ed25519" }, publicKey, fromBase64Url(fixture.signature), new TextEncoder().encode(fixture.envelope));
    expect(ok).toBe(true);
  });

  it("rejects the one-byte tampered envelope", async () => {
    const { publicKey } = await fixtureKeys();
    expect(fixture.tamperedEnvelope).not.toBe(fixture.envelope);
    const ok = await crypto.subtle.verify({ name: "Ed25519" }, publicKey, fromBase64Url(fixture.signature), new TextEncoder().encode(fixture.tamperedEnvelope));
    expect(ok).toBe(false);
  });
});

describe("envelope helpers", () => {
  it("envelopeTimes issues a 60 s window in toISOString form", () => {
    const { iat, exp } = envelopeTimes(Date.parse("2026-10-06T12:00:00.000Z"));
    expect(iat).toBe("2026-10-06T12:00:00.000Z");
    expect(exp).toBe("2026-10-06T12:01:00.000Z");
  });

  it("base64url round-trips without padding", () => {
    for (const n of [0, 1, 2, 3, 31, 32, 33, 64]) {
      const bytes = Uint8Array.from({ length: n }, (_, i) => (i * 37 + 250) % 256);
      const text = toBase64Url(bytes);
      expect(text).not.toMatch(/[+/=]/);
      expect(Array.from(fromBase64Url(text))).toEqual(Array.from(bytes));
    }
    expect(() => fromBase64Url("a+b")).toThrow();
  });
});
