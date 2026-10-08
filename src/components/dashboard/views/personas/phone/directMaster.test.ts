import { describe, expect, it } from "vitest";
import { mobileCopy } from "@/i18n/pending/mobile";
import { sayDisabledReason, sayRefusalText } from "./DirectMasterPanel";

const copy = mobileCopy.say;

describe("sayRefusalText: every desk and plane token has its own words", () => {
  const tokens = ["bad_params", "empty_message", "message_too_long", "not_found", "not_app_master", "internal_error", "controller_not_paired", "controller_revoked"] as const;

  it("maps each token to its copy, ignoring a detail after a colon", () => {
    for (const t of tokens) {
      expect(sayRefusalText(copy, t, false)).toBe(copy.errors[t].replace("{max}", "2000"));
      expect(sayRefusalText(copy, `${t}: detail`, false)).toBe(copy.errors[t].replace("{max}", "2000"));
    }
    expect(sayRefusalText(copy, null, true)).toBe(copy.errors.expired);
  });

  it("not_app_master explains that only a project charter holder takes directions", () => {
    expect(sayRefusalText(copy, "not_app_master", false)).toContain("project charter");
  });

  it("an unknown token shows as sent; none at all is the generic line", () => {
    expect(sayRefusalText(copy, "weird_thing", false)).toBe("Couldn't send: weird thing");
    expect(sayRefusalText(copy, null, false)).toBe(copy.errors.unknown);
  });
});

describe("sayDisabledReason: the gate the other signed verbs use", () => {
  it("is open online with a device, and in the demo without one", () => {
    expect(sayDisabledReason(copy, "online", false, "dev-1")).toBeNull();
    expect(sayDisabledReason(copy, "demo", false, null)).toBeNull();
  });

  it("explains offline, unpaired, never synced, the local API, and a persona with no device", () => {
    expect(sayDisabledReason(copy, "offline", false, "d")).toBe(copy.disabled.offline);
    expect(sayDisabledReason(copy, "online-unpaired", false, "d")).toBe(copy.disabled.unpaired);
    expect(sayDisabledReason(copy, "never-synced", false, "d")).toBe(copy.disabled.never);
    expect(sayDisabledReason(copy, "online", true, "d")).toBe(copy.disabled.desktop);
    expect(sayDisabledReason(copy, "online", false, null)).toBe(copy.disabled.noDevice);
    expect(sayDisabledReason(copy, null, false, "d")).toBe("");
  });
});
