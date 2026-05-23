import { test, expect } from "@playwright/test";

/**
 * Design coverage for the guided "Autopilot" tour.
 *
 * Engine + script: `src/contexts/TourContext.tsx`, `src/lib/tour-script.ts`.
 * Each stage of the tour build extends this spec. Screenshots are written to
 * `test-results/tour/` (gitignored) for visual review of the design surface.
 */
test.describe("Guided tour — stage 1 (homepage engine)", () => {
  const LAUNCH = "Take the tour";
  const STEP1 = "multi-agent AI pipelines";
  const STEP2 = "orchestrator route work";
  const STEP3 = "cloud execution";

  test("launcher is present in the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
    await page.screenshot({ path: "test-results/tour/01-launcher.png" });
  });

  test("launching opens the spotlight + caption with step 1 narration", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();

    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await expect(caption).toContainText(STEP1);
    await page.screenshot({ path: "test-results/tour/02-step1.png" });
  });

  test("next / previous move between steps", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    await caption.getByRole("button", { name: "Next step" }).click();
    await expect(caption).toContainText(STEP2);
    await page.screenshot({ path: "test-results/tour/03-step2.png" });

    await caption.getByRole("button", { name: "Previous step" }).click();
    await expect(caption).toContainText(STEP1);
  });

  test("progress dots jump to a step", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    await caption.getByRole("button", { name: "3 / 3" }).click();
    await expect(caption).toContainText(STEP3);
    await page.screenshot({ path: "test-results/tour/04-step3.png" });
  });

  test("play / pause toggles the auto-advance control", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    // The tour starts playing, so the control offers "Pause".
    const pause = caption.getByRole("button", { name: "Pause" });
    await expect(pause).toBeVisible();
    await pause.click();
    await expect(caption.getByRole("button", { name: "Play" })).toBeVisible();
  });

  test("auto-advance progresses to the next step on its own", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    await expect(caption).toContainText(STEP1);
    // Step 1 dwell is 7s — wait it out and confirm the engine advances.
    await expect(caption).toContainText(STEP2, { timeout: 12_000 });
  });

  test("exit button closes the tour and restores the launcher", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    await expect(caption).toBeVisible();
    await caption.getByRole("button", { name: "Exit tour" }).click();
    await expect(caption).toBeHidden();
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
  });

  test("Escape key exits the tour", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    await expect(caption).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(caption).toBeHidden();
  });
});

test.describe("Guided tour — stage 2 (/features)", () => {
  const LAUNCH = "Take the tour";

  test("launcher is rendered on /features", async ({ page }) => {
    await page.goto("/features");
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
    await page.screenshot({ path: "test-results/tour/05-features-launcher.png" });
  });

  test("launching plays the features narration", async ({ page }) => {
    await page.goto("/features");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await expect(caption).toContainText("executable agent");
    await page.screenshot({ path: "test-results/tour/06-features-step1.png" });

    await caption.getByRole("button", { name: "Next step" }).click();
    await expect(caption).toContainText("self-heal");
    await page.screenshot({ path: "test-results/tour/07-features-step2.png" });
  });
});

test.describe("Guided tour — DOM manipulation", () => {
  const LAUNCH = "Take the tour";

  test("spotlight target gets data-tour-active while focused", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toContainText("multi-agent AI pipelines");
    // Step 1 — #hero-heading should carry the live marker.
    await expect(page.locator("#hero-heading")).toHaveAttribute("data-tour-active", "true");

    await caption.getByRole("button", { name: "Next step" }).click();
    // Step 2 marker hops to #orchestration-hub-heading; the previous target
    // is no longer marked.
    await expect(page.locator("#orchestration-hub-heading")).toHaveAttribute("data-tour-active", "true");
    await expect(page.locator("#hero-heading")).not.toHaveAttribute("data-tour-active", "true");

    await caption.getByRole("button", { name: "Exit tour" }).click();
    await expect(page.locator("#orchestration-hub-heading")).not.toHaveAttribute("data-tour-active", "true");
  });
});

test.describe("Guided tour — deep link & seen memory", () => {
  const LAUNCH = "Take the tour";

  test("?tour=1 auto-starts the homepage tour", async ({ page }) => {
    await page.goto("/?tour=1");
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await expect(caption).toContainText("multi-agent AI pipelines");
    await page.screenshot({ path: "test-results/tour/12-deeplink.png" });
  });

  test("starting the tour persists the seen flag", async ({ page }) => {
    await page.goto("/");
    // Fresh visitor — no flag yet.
    const before = await page.evaluate(() => localStorage.getItem("personas-tour-seen"));
    expect(before).toBeNull();
    await page.getByRole("button", { name: LAUNCH }).click();
    const after = await page.evaluate(() => localStorage.getItem("personas-tour-seen"));
    expect(after).toBe("1");
  });
});

test.describe("Guided tour — mobile viewport", () => {
  const LAUNCH = "Take the tour";

  test("homepage tour runs on a 375 × 667 viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();

    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await expect(caption).toContainText("multi-agent AI pipelines");
    await page.screenshot({ path: "test-results/tour/11-mobile-step1.png" });
  });
});

test.describe("Guided tour — stage 2 (/roadmap)", () => {
  const LAUNCH = "Take the tour";

  test("launcher is rendered on /roadmap", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
    await page.screenshot({ path: "test-results/tour/08-roadmap-launcher.png" });
  });

  test("launching plays the roadmap narration", async ({ page }) => {
    await page.goto("/roadmap");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await expect(caption).toContainText("shipping now");
    await page.screenshot({ path: "test-results/tour/09-roadmap-step1.png" });

    await caption.getByRole("button", { name: "Next step" }).click();
    await expect(caption).toContainText("Vote");
    await page.screenshot({ path: "test-results/tour/10-roadmap-step2.png" });
  });
});
