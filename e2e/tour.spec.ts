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
  const STEP1 = "stable identity";
  const STEP2 = "real time";
  const STEP3 = "triggered ten ways";
  const STEP4 = "six pillars";
  const STEP5 = "Windows 11";

  test("launcher is present in the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
    await page.screenshot({ path: "test-results/tour/01-launcher.png" });
  });

  test("launching opens the spotlight + caption with step 1 narration", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();

    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await expect(caption).toContainText(STEP1);
    await page.screenshot({ path: "test-results/tour/02-step1.png" });
  });

  test("next / previous move between steps", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
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
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    await caption.getByRole("button", { name: "3 / 5" }).click();
    await expect(caption).toContainText(STEP3);
    await caption.getByRole("button", { name: "4 / 5" }).click();
    await expect(caption).toContainText(STEP4);
    await caption.getByRole("button", { name: "5 / 5" }).click();
    await expect(caption).toContainText(STEP5);
    await page.screenshot({ path: "test-results/tour/04-step5.png" });
  });

  test("play / pause toggles the auto-advance control", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
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
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    await expect(caption).toContainText(STEP1);
    // Step 1 is audio-driven now (advances on the clip's `ended`, ~15s), with
    // the dwell timer as a fallback — allow generous time for either path.
    await expect(caption).toContainText(STEP2, { timeout: 25_000 });
  });

  test("exit button closes the tour and restores the launcher", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });

    await expect(caption).toBeVisible();
    await caption.getByRole("button", { name: "Exit tour" }).click();
    await expect(caption).toBeHidden();
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
  });

  test("Escape key exits the tour", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
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
    await expect(caption).toContainText("persona matrix");
    await page.screenshot({ path: "test-results/tour/06-features-step1.png" });

    await caption.getByRole("button", { name: "Next step" }).click();
    await expect(caption).toContainText("memory layers");
    await page.screenshot({ path: "test-results/tour/07-features-step2.png" });
  });

  test("steps reach the Lab and Plugins (Dev Tools) beats", async ({ page }) => {
    await page.goto("/features");
    await page.getByRole("button", { name: LAUNCH }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    // design → memory → healing → observe → lab (the 5th beat).
    for (let i = 0; i < 4; i++) {
      await caption.getByRole("button", { name: "Next step" }).click();
    }
    await expect(caption).toContainText("in the arena");
    await page.screenshot({ path: "test-results/tour/14-features-lab.png" });

    await caption.getByRole("button", { name: "Next step" }).click();
    await expect(caption).toContainText("Dev Tools");
    await page.screenshot({ path: "test-results/tour/15-features-plugins.png" });
  });
});

test.describe("Guided tour — DOM manipulation", () => {
  const LAUNCH = "Take the tour";

  test("spotlight target gets data-tour-active while focused", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toContainText("stable identity");
    // Step 1 — the Tools diagram should carry the live marker.
    const tools = page.locator('[data-tour-diagram="tools"]');
    const agentMind = page.locator('[data-tour-diagram="agent-mind"]');
    await expect(tools).toHaveAttribute("data-tour-active", "true");

    await caption.getByRole("button", { name: "Next step" }).click();
    // Step 2 marker hops to the agent-mind diagram; the previous target is no
    // longer marked.
    await expect(agentMind).toHaveAttribute("data-tour-active", "true");
    await expect(tools).not.toHaveAttribute("data-tour-active", "true");

    await caption.getByRole("button", { name: "Exit tour" }).click();
    await expect(agentMind).not.toHaveAttribute("data-tour-active", "true");
  });
});

test.describe("Guided tour — deep link & seen memory", () => {
  const LAUNCH = "Take the tour";

  test("?tour=1 auto-starts the homepage tour", async ({ page }) => {
    await page.goto("/?tour=1");
    // The homepage tour opens with the intro pop-up; begin to reach the steps.
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await expect(caption).toContainText("stable identity");
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
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await expect(caption).toContainText("stable identity");
    await page.screenshot({ path: "test-results/tour/11-mobile-step1.png" });
  });
});

test.describe("Guided tour — bridge to /features", () => {
  const LAUNCH = "Take the tour";
  const CONTINUE = "Show me the features";

  test("finishing the homepage tour offers to continue into /features", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();

    // Step through all five homepage beats; the 5th "Next" reaches the bridge.
    for (let i = 0; i < 5; i++) {
      await caption.getByRole("button", { name: "Next step" }).click();
    }

    await expect(page.getByRole("button", { name: CONTINUE })).toBeVisible();
    await page.screenshot({ path: "test-results/tour/13-bridge.png" });
  });

  test("declining the bridge ends the tour", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    for (let i = 0; i < 5; i++) {
      await caption.getByRole("button", { name: "Next step" }).click();
    }
    await page.getByRole("button", { name: "Maybe later" }).click();
    await expect(page.getByRole("button", { name: CONTINUE })).toBeHidden();
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
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
    await expect(caption).toContainText("where we are now");
    await page.screenshot({ path: "test-results/tour/09-roadmap-step1.png" });

    await caption.getByRole("button", { name: "Next step" }).click();
    await expect(caption).toContainText("vote on the features");
    await page.screenshot({ path: "test-results/tour/10-roadmap-step2.png" });
  });
});

test.describe("Guided tour — intro pop-up (Athena)", () => {
  const LAUNCH = "Take the tour";
  const INTRO = "Meet Athena, your guide";

  test("launching shows the intro before any step", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    const intro = page.getByRole("dialog", { name: INTRO });
    await expect(intro).toBeVisible();
    await expect(intro).toContainText("Athena");
    // Steps haven't started — the caption isn't mounted yet.
    await expect(page.getByRole("dialog", { name: LAUNCH })).toBeHidden();
    await page.screenshot({ path: "test-results/tour/00-intro.png" });
  });

  test("Begin starts the steps", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    await expect(page.getByRole("dialog", { name: LAUNCH })).toContainText("stable identity");
  });

  test("Skip exits without starting", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Skip" }).click();
    await expect(page.getByRole("dialog", { name: INTRO })).toBeHidden();
    await expect(page.getByRole("dialog", { name: LAUNCH })).toBeHidden();
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
  });
});

test.describe("Guided tour — no-strand backstops", () => {
  const LAUNCH = "Take the tour";
  const STEP1 = "stable identity";
  const STEP2 = "real time";

  /**
   * A clip that loads and then stalls fires neither `ended` nor `error`, and
   * `ended` is the only thing that advances an audio-bearing step — so before
   * the watchdog in `useTourAudio` this left the visitor under the scrim with no
   * way forward. Held requests reproduce exactly that: the media element never
   * completes and never errors.
   *
   * Step 1's ceiling is `max(clip duration, dwellMs = 12s) + STALL_SLACK_MS =
   * 20s`; the duration is never known here, so the dwell floor applies.
   */
  test("a stalled narration clip still advances the tour", async ({ page }) => {
    test.setTimeout(90_000);
    // Hold every narration request open forever — never fulfil, never abort.
    await page.route("**/tour/*.mp3", () => {
      /* deliberately unresolved: the clip loads forever */
    });

    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();

    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toContainText(STEP1);
    // No `ended`, no `error` — only the stall ceiling can move this on.
    await expect(caption).toContainText(STEP2, { timeout: 40_000 });
  });

  /**
   * A step whose spotlight anchor never resolves must not leave a dimmed page
   * highlighting nothing (or still highlighting the previous step). The declared
   * policy is "keep the caption, drop the scrim": the cutout — which carries the
   * `0 0 0 100vmax` scrim in its own box-shadow — fades to opacity 0 while the
   * caption keeps running.
   */
  test("a missing spotlight anchor drops the scrim and keeps the caption", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();

    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toContainText(STEP1);

    const cutout = page.locator(".tour-cutout-pulse");
    // Sanity: with a real anchor the scrim is up.
    await expect(cutout).toHaveCSS("opacity", "1");

    // Remove every spotlight anchor, then step on — nothing can resolve.
    await page.evaluate(() => {
      document
        .querySelectorAll("[data-tour-diagram]")
        .forEach((el) => el.removeAttribute("data-tour-diagram"));
    });
    await caption.getByRole("button", { name: "Next step" }).click();

    await expect(cutout).toHaveCSS("opacity", "0", { timeout: 15_000 });
    await expect(caption).toBeVisible();
  });
});

test.describe("Guided tour — dialog focus trap", () => {
  const LAUNCH = "Take the tour";
  const STEP1 = "stable identity";

  /**
   * The caption card declares `role="dialog"` + `aria-modal="true"`. Before the
   * shared `useDialogFocusTrap` was applied to it, Tab walked straight out of
   * the card into the page behind the scrim — controls a keyboard user cannot
   * see and, under the dim overlay, cannot use.
   */
  test("Tab stays inside the caption card", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();

    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toContainText(STEP1);
    // Initial focus lands on the card's designated control, not <body>.
    await expect(caption.locator("[data-tour-focus]")).toBeFocused();

    const focusIsInsideDialog = () =>
      page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));

    // More presses than the card has focusable controls, so the cycle wraps.
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press("Tab");
      expect(await focusIsInsideDialog()).toBe(true);
    }
    // ...and backwards over the first element, too.
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Shift+Tab");
      expect(await focusIsInsideDialog()).toBe(true);
    }
  });

  test("Escape still exits (the trap does not swallow or double-fire it)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await expect(caption).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(caption).toBeHidden();
    await expect(page.getByRole("button", { name: LAUNCH })).toBeVisible();
  });

  /**
   * The launcher unmounts while the tour runs, so the node captured when the
   * trap opened is detached by the time it closes; the trap falls back to the
   * `[data-tour-launcher]` selector rather than dropping focus on `<body>`.
   */
  test("closing the tour returns focus to the launcher", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: LAUNCH }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    const caption = page.getByRole("dialog", { name: LAUNCH });
    await caption.getByRole("button", { name: "Exit tour" }).click();

    await expect(page.getByRole("button", { name: LAUNCH })).toBeFocused();
  });
});
