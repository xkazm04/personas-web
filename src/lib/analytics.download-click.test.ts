import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { downloadPlan } from "./release";

/**
 * Every "Download" CTA reports its click through the one tracker, with the
 * same `download_click` shape plus a `placement`, so the funnel can tell the
 * hero, the pricing offer and the download section apart. Before this, only
 * DownloadCTA called `trackDownloadClick`; the hero and pricing buttons - the
 * two most-seen download CTAs - fired nothing.
 */

const count = vi.fn();
vi.mock("@sentry/nextjs", () => ({ metrics: { count: (...args: unknown[]) => count(...args) } }));

const { downloadClickAttributes, trackDownloadClick } = await import("./analytics");

const LIVE = downloadPlan("https://github.com/personas/releases/download/v1/setup.exe");
const WAITLIST = downloadPlan(undefined);

describe("downloadClickAttributes", () => {
  it("a live installer reports the installer's platform and the placement", () => {
    expect(downloadClickAttributes(LIVE, "hero", "macos")).toEqual({
      platform: "windows",
      placement: "hero",
      outcome: "installer",
    });
  });

  it("with no installer the CTA leads to the waitlist, reported for the visitor's own platform", () => {
    expect(downloadClickAttributes(WAITLIST, "pricing", "linux")).toEqual({
      platform: "linux",
      placement: "pricing",
      outcome: "waitlist",
    });
  });

  it("the navbar reports its installer click as the navbar placement", () => {
    expect(downloadClickAttributes(LIVE, "navbar", "windows")).toEqual({
      platform: "windows",
      placement: "navbar",
      outcome: "installer",
    });
  });

  it("carries nothing but platform, placement and outcome (no PII can ride along)", () => {
    expect(Object.keys(downloadClickAttributes(LIVE, "download-cta", "windows")).sort()).toEqual([
      "outcome",
      "placement",
      "platform",
    ]);
  });
});

describe("trackDownloadClick", () => {
  beforeEach(() => {
    count.mockClear();
    // Consent granted: the event is emitted immediately instead of queued.
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", { getItem: () => "all" });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("emits download_click with the placement", () => {
    trackDownloadClick(LIVE, "pricing", "windows");
    expect(count).toHaveBeenCalledWith("download_click", 1, {
      attributes: { platform: "windows", placement: "pricing", outcome: "installer" },
    });
  });
});

describe("every download CTA reports its placement", () => {
  const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

  it.each([
    ["src/components/sections/HeroClient.tsx", "hero"],
    ["src/components/sections/pricing/index.tsx", "pricing"],
    ["src/components/sections/DownloadCTA.tsx", "download-cta"],
  ])("%s calls trackDownloadClick with placement %s", (rel, placement) => {
    expect(read(rel)).toMatch(new RegExp(`trackDownloadClick\\(DOWNLOAD_PLAN,\\s*"${placement}"`));
  });

  it("the navbar reports download_click on its live-installer branch, before leaving the page", () => {
    // The navbar picks per platform: an installer when the plan says this
    // platform downloads (a full-page navigation), otherwise the waitlist modal,
    // which reports itself as waitlist_open { entry_point: "navbar" }. Only the
    // installer branch was silent. It must report BEFORE location.assign, and
    // with the visitor's key - on this branch that key IS the installer's platform.
    const src = read("src/components/Navbar.tsx");
    const branch = src.match(/if \(DOWNLOAD_PLAN\.platforms\[key\] === "download"\) \{([\s\S]*?)\n {4}\}/);
    expect(branch, "the live-installer branch").not.toBeNull();
    const body = branch![1];
    const track = body.indexOf('trackDownloadClick(DOWNLOAD_PLAN, "navbar", key)');
    const leave = body.indexOf("window.location.assign(DOWNLOAD_ENDPOINT)");
    expect(track, "trackDownloadClick in the installer branch").toBeGreaterThanOrEqual(0);
    expect(leave).toBeGreaterThan(track);
  });
});
