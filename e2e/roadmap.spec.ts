import { test, expect } from "@playwright/test";
import { en } from "../src/i18n/en";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test.describe("Roadmap Page", () => {
  test("roadmap page renders with heading", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.locator("main")).toContainText("Roadmap");
  });

  test("shows progress bar with phase count", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.locator("main")).toContainText("phases");
  });

  // The current focus is the Core Platform area: dev mode, connectors and
  // installers, each an ARIA progressbar ("{label}: {pct}%"). The copy comes
  // from en.ts so a copy pass edits one place; the old literal "cloud" broke
  // when the cloud-execution bar was removed (073e38f).
  test("shows the core platform focus with a progress bar per workstream", async ({ page }) => {
    const r = en.roadmapSection;
    await page.goto("/roadmap");
    const heading = page.locator("main").getByRole("heading", { level: 3, name: r.areas.platform.title });
    await expect(heading).toBeVisible();
    // The card is the heading's nearest ancestor that holds progress bars, so
    // the bars below are asserted on THIS area, not anywhere on the page.
    const card = heading.locator("xpath=ancestor::div[.//*[@role='progressbar']][1]");
    await expect(card.getByText(r.areas.platform.caption, { exact: true })).toBeVisible();
    for (const label of [r.bars.devMode, r.bars.connectors, r.bars.installersUpdates]) {
      const name = new RegExp(`^${escapeRegExp(r.barAria.replace("{label}", label)).replace("\\{pct\\}", "\\d{1,3}")}$`);
      await expect(card.getByRole("progressbar", { name })).toHaveCount(1);
    }
  });

  test("displays roadmap area cards", async ({ page }) => {
    await page.goto("/roadmap");
    // The rebuilt roadmap renders area cards (AreaCardShell h3 = area.title);
    // the old "In Progress" status badge no longer exists.
    await expect(page.locator("main")).toContainText("Core Platform");
  });
});
