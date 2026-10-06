import { describe, expect, it } from "vitest";
import { safeHref } from "./safeHref";

describe("safeHref: which markdown link targets render as links", () => {
  it("keeps web, mail and same-site links", () => {
    expect(safeHref("https://docs.github.com/x")).toBe("https://docs.github.com/x");
    expect(safeHref(" HTTP://example.com ")).toBe("HTTP://example.com");
    expect(safeHref("mailto:ops@example.com")).toBe("mailto:ops@example.com");
    expect(safeHref("/guide/credentials")).toBe("/guide/credentials");
    expect(safeHref("#section")).toBe("#section");
  });

  it("drops script, data and protocol-relative targets", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref(" JavaScript:alert(1)")).toBeNull();
    expect(safeHref("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeHref("vbscript:x")).toBeNull();
    expect(safeHref("//evil.example")).toBeNull();
    expect(safeHref("/\\evil.example")).toBeNull();
    expect(safeHref("relative/path")).toBeNull();
  });
});
