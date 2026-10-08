// Generates fixtures/command-envelope-v1.json: the shared test vector for the signed remote-command
// envelope (docs/concepts/mobile-revival/PHASE2-SPEC.md section 3.3). The SAME file is committed in
// the desktop repo; web vitest must sign to these exact bytes and desktop cargo test must verify
// them (and reject the tampered variant). Ed25519 is deterministic, so a fixed seed gives fixed
// signatures. TEST KEY ONLY - never pair a real controller with it.
import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";

const b64url = (buf) => Buffer.from(buf).toString("base64url");

// 32-byte seed 0x01..0x20.
const seed = Buffer.from(Array.from({ length: 32 }, (_, i) => i + 1));
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), seed]);
const priv = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const pubRaw = createPublicKey(priv).export({ format: "der", type: "spki" }).subarray(-32);

// Key order is part of the contract: the signed form is this exact text.
const envelope = JSON.stringify({
  v: 1,
  id: "6f1d2c3b-4a59-4e68-9d7c-0b1a2c3d4e5f",
  dev: "test-device-0001",
  type: "pause_persona",
  persona: "persona-test-0001",
  params: {},
  iat: "2026-10-06T12:00:00.000Z",
  exp: "2026-10-06T12:01:00.000Z",
  ctl: "0c2b9a8f-7e6d-4c5b-8a49-3827160f5e4d",
});
const signature = sign(null, Buffer.from(envelope, "utf8"), priv);

// One byte changed: "pause_persona" -> "pausf_persona". Same signature must NOT verify.
const tampered = envelope.replace("pause_persona", "pausf_persona");
const pub = createPublicKey(priv);
if (!verify(null, Buffer.from(envelope, "utf8"), pub, signature)) throw new Error("self-check failed");
if (verify(null, Buffer.from(tampered, "utf8"), pub, signature)) throw new Error("tamper check failed");

const fixture = {
  $comment: "Shared test vector for the signed remote-command envelope v1 (PHASE2-SPEC.md 3.3). Identical copy in both repos. TEST KEY ONLY.",
  seedHex: seed.toString("hex"),
  publicKey: b64url(pubRaw),
  envelope,
  signature: b64url(signature),
  tamperedEnvelope: tampered,
};
mkdirSync("fixtures", { recursive: true });
writeFileSync("fixtures/command-envelope-v1.json", JSON.stringify(fixture, null, 2) + "\n");
console.log(JSON.stringify(fixture, null, 2));
