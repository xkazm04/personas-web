import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";
import { getClientIp } from "./request";

const mk = (ip: string | null, headers: Record<string, string> = {}) =>
  ({ ip, headers: new Headers(headers) }) as unknown as NextRequest;

const savedVercel = process.env.VERCEL;
const savedTrust = process.env.TRUST_PROXY;

beforeEach(() => {
  delete process.env.VERCEL;
  delete process.env.TRUST_PROXY;
});
afterEach(() => {
  if (savedVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = savedVercel;
  if (savedTrust === undefined) delete process.env.TRUST_PROXY;
  else process.env.TRUST_PROXY = savedTrust;
});

describe("getClientIp trust ladder", () => {
  it("prefers the platform req.ip over any header", () => {
    expect(getClientIp(mk("9.9.9.9", { "x-forwarded-for": "1.2.3.4" }))).toBe("9.9.9.9");
  });

  it("does NOT trust x-vercel-forwarded-for off-platform (the Wave-3 fix)", () => {
    expect(getClientIp(mk(null, { "x-vercel-forwarded-for": "6.6.6.6" }))).not.toBe("6.6.6.6");
  });

  it("trusts x-vercel-forwarded-for when VERCEL=1 (first hop)", () => {
    process.env.VERCEL = "1";
    expect(getClientIp(mk(null, { "x-vercel-forwarded-for": "6.6.6.6, 7.7.7.7" }))).toBe("6.6.6.6");
  });

  it("trusts x-real-ip / x-forwarded-for only under TRUST_PROXY", () => {
    expect(getClientIp(mk(null, { "x-real-ip": "5.5.5.5" }))).not.toBe("5.5.5.5");
    process.env.TRUST_PROXY = "true";
    expect(getClientIp(mk(null, { "x-real-ip": "5.5.5.5" }))).toBe("5.5.5.5");
    expect(getClientIp(mk(null, { "x-forwarded-for": "4.4.4.4, 8.8.8.8" }))).toBe("4.4.4.4");
  });

  it("falls back to a stable per-client fingerprint, or 'unknown' with no signals", () => {
    expect(getClientIp(mk(null, {}))).toBe("unknown");
    expect(getClientIp(mk(null, { "user-agent": "UA/1.0", "accept-language": "en" }))).toMatch(
      /^fp:[0-9a-f]{16}$/,
    );
  });
});
