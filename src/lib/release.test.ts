import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ALLOWED_DOWNLOAD_HOSTS,
  DOWNLOAD_PLAN,
  PULSE_FROM_CHANGELOG,
  SITE_VERSION,
  ctaHref,
  downloadPlan,
  isFreshRelease,
  latestRelease,
  rejectionMessage,
  releasePulseDate,
  resolveDownloadUrl,
  siteVersion,
} from "@/lib/release";

/**
 * One release authority. "Is a download live" is decided once, by
 * `resolveDownloadUrl`, and both `/api/download` (server) and every CTA
 * (client, through `downloadPlan`) read that answer, so a URL the route refuses
 * can never render "Download for Windows".
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const SRC_ROOT = path.join(REPO_ROOT, "src");
const SELF = path.relative(REPO_ROOT, fileURLToPath(import.meta.url)).replaceAll("\\", "/");
const RELEASE_MODULE = "src/lib/release.ts";

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const SOURCES = walk(SRC_ROOT)
  .map((abs) => ({ rel: path.relative(REPO_ROOT, abs).replaceAll("\\", "/"), text: readFileSync(abs, "utf8") }))
  .filter((f) => f.rel !== SELF);

const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

const VALID = "https://github.com/personas-ai/personas/releases/download/v1.1.0/Personas-Setup.exe";

describe("resolveDownloadUrl", () => {
  it("accepts an https release URL on an allowed host, unchanged", () => {
    expect(resolveDownloadUrl(VALID)).toEqual({ live: true, url: VALID });
  });

  it("names the reason for every rejection", () => {
    expect(resolveDownloadUrl("https://evil.example/p.exe")).toMatchObject({ live: false, reason: "host" });
    expect(resolveDownloadUrl("http://github.com/x")).toMatchObject({ live: false, reason: "protocol" });
    expect(resolveDownloadUrl("not a url")).toMatchObject({ live: false, reason: "parse" });
    expect(resolveDownloadUrl(undefined)).toMatchObject({ live: false, reason: "unset" });
    expect(resolveDownloadUrl("")).toMatchObject({ live: false, reason: "unset" });
    // The route reports misconfiguration, never an intentionally empty env.
    expect(rejectionMessage(resolveDownloadUrl(undefined))).toBeNull();
    expect(rejectionMessage(resolveDownloadUrl(VALID))).toBeNull();
    expect(rejectionMessage(resolveDownloadUrl("https://evil.example/p.exe"))).toContain("evil.example");
  });

  it("GUARD: each of the six currently-allowed hosts over https is live", () => {
    const hosts = [
      "github.com",
      "objects.githubusercontent.com",
      "release-assets.githubusercontent.com",
      "personas.app",
      "downloads.personas.app",
      "cdn.personas.app",
    ];
    expect([...ALLOWED_DOWNLOAD_HOSTS].sort()).toEqual([...hosts].sort());
    for (const host of hosts) {
      expect(resolveDownloadUrl(`https://${host}/Personas-Setup.exe`).live, host).toBe(true);
    }
  });
});

describe("downloadPlan", () => {
  it("a URL the server rejects never renders as a download", () => {
    const plan = downloadPlan("https://evil.example/p.exe");
    expect(plan.platforms).toEqual({ windows: "waitlist", macos: "waitlist", linux: "waitlist" });
    expect(plan.primary.kind).toBe("waitlist");
    expect(ctaHref(plan)).toBe("#download-section");
    // Server and client agree on every input: one rule.
    for (const raw of [VALID, "https://evil.example/p.exe", "http://github.com/x", "not a url", undefined, ""]) {
      expect(downloadPlan(raw).live, String(raw)).toBe(resolveDownloadUrl(raw).live);
    }
  });

  it("a valid URL makes Windows the live download and leaves macOS/Linux on the waitlist", () => {
    const plan = downloadPlan(VALID);
    expect(plan.primary).toEqual({ kind: "download", href: "/api/download", platform: "windows" });
    expect(plan.platforms).toEqual({ windows: "download", macos: "waitlist", linux: "waitlist" });
    expect(ctaHref(plan)).toBe("/api/download");
  });

  it("GUARD: with the env unset the plan is the waitlist (today's production behaviour)", () => {
    expect(downloadPlan(undefined).primary.kind).toBe("waitlist");
    // The test process has no NEXT_PUBLIC_DOWNLOAD_URL either.
    expect(DOWNLOAD_PLAN.primary.kind).toBe("waitlist");
  });
});

describe("latestRelease / isFreshRelease", () => {
  it("picks the latest by date, order-independent; skips unparseable dates; empty -> null", () => {
    const releases = [
      { version: "0.9.0", date: "2026-01-01" },
      { version: "1.1.0", date: "2026-08-07" },
      { version: "1.0.0", date: "2026-08-04" },
    ];
    expect(latestRelease(releases)?.version).toBe("1.1.0");
    expect(latestRelease([...releases].reverse())?.version).toBe("1.1.0");
    expect(latestRelease([{ version: "9.9.9", date: "someday" }, ...releases])?.version).toBe("1.1.0");
    expect(latestRelease([])).toBeNull();
  });

  it("a release is fresh for seven days", () => {
    expect(isFreshRelease("2026-08-07", Date.parse("2026-08-10T00:00:00Z"))).toBe(true);
    expect(isFreshRelease("2026-08-07", Date.parse("2026-08-20T00:00:00Z"))).toBe(false);
    expect(isFreshRelease("", Date.parse("2026-08-10T00:00:00Z"))).toBe(false);
    expect(isFreshRelease("garbage", Date.parse("2026-08-10T00:00:00Z"))).toBe(false);
  });

  it("GUARD: the release pulse stays env-driven; the changelog date sits behind an off flag", () => {
    expect(PULSE_FROM_CHANGELOG).toBe(false);
    const latest = { version: "1.1.0", date: "2026-08-07" };
    // Env empty + flag off: no pulse date, exactly as today.
    expect(releasePulseDate("", latest)).toBe("");
    expect(releasePulseDate("2026-09-01", latest)).toBe("2026-09-01");
    expect(releasePulseDate("", latest, true)).toBe("2026-08-07");
    expect(releasePulseDate("", null, true)).toBe("");
  });
});

describe("the displayed version (owner decision: unchanged)", () => {
  it("GUARD: hero and download badge render the site version, not the desktop changelog's", () => {
    expect(siteVersion(undefined)).toBe("0.1.0");
    expect(siteVersion("0.1.0")).toBe("0.1.0");
    expect(SITE_VERSION).toBe(process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0");
    // What feeds it is still the website's own package.json version.
    expect(read("next.config.ts")).toMatch(/NEXT_PUBLIC_APP_VERSION:\s*pkg\.version/);
    // Both surfaces render exactly that value.
    expect(read("src/components/sections/hero/CommandCenterIllustration.tsx")).toContain("{SITE_VERSION}");
    expect(read("src/components/sections/DownloadCTA.tsx")).toContain("v{SITE_VERSION}");
    // The release authority does not pull the changelog into every chunk that asks "is it live".
    expect(read(RELEASE_MODULE)).not.toMatch(/(from|import\()\s*["']@\/data\/changelog["']/);
  });
});

describe("one authority (source scans)", () => {
  it("only src/lib/release.ts reads the release env vars", () => {
    const offenders = SOURCES.filter(
      (f) =>
        f.rel !== RELEASE_MODULE &&
        /NEXT_PUBLIC_(DOWNLOAD_URL|APP_VERSION|RELEASE_DATE)\b/.test(f.text),
    ).map((f) => f.rel);
    expect(offenders).toEqual([]);
  });

  it("the host allowlist lives once, and /api/download uses it", () => {
    const holders = SOURCES.filter((f) => f.text.includes("objects.githubusercontent.com")).map((f) => f.rel);
    expect(holders).toEqual([RELEASE_MODULE]);
    expect(read("src/app/api/download/route.ts")).toMatch(
      /import\s*\{[^}]*\bresolveDownloadUrl\b[^}]*\}\s*from\s*["']@\/lib\/release["']/,
    );
  });

  it("every client 'download live' site reads the plan instead of the raw env", () => {
    for (const rel of [
      "src/components/sections/DownloadCTA.tsx",
      "src/components/sections/HeroClient.tsx",
      "src/components/sections/pricing/index.tsx",
      "src/components/Navbar.tsx",
    ]) {
      expect(read(rel), rel).toMatch(/import\s*\{[^}]*\bDOWNLOAD_PLAN\b[^}]*\}\s*from\s*["']@\/lib\/release["']/);
    }
  });
});
