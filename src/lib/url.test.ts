import { describe, it, expect } from "vitest";
import { sanitizeExternalUrl } from "./url";

describe("sanitizeExternalUrl", () => {
  it("passes through absolute http(s) URLs unchanged", () => {
    expect(sanitizeExternalUrl("https://example.com/x?y=1")).toBe("https://example.com/x?y=1");
    expect(sanitizeExternalUrl("http://example.com")).toBe("http://example.com");
  });

  it("rejects dangerous schemes to '#'", () => {
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeExternalUrl("data:text/html,<script>")).toBe("#");
    expect(sanitizeExternalUrl("vbscript:msgbox")).toBe("#");
    expect(sanitizeExternalUrl("mailto:a@b.com")).toBe("#");
  });

  it("rejects relative/unparseable values to '#'", () => {
    expect(sanitizeExternalUrl("/relative/path")).toBe("#");
    expect(sanitizeExternalUrl("not a url")).toBe("#");
    expect(sanitizeExternalUrl("")).toBe("#");
  });
});
