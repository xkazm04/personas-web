import { test, expect, type Page } from "@playwright/test";

/**
 * Chat from the phone, in demo (PHASE2-SPEC.md 5.2, 5.3, 6.2, 6.3; PLAN M18):
 * a pinned Athena row above the persona list opens Athena's chat, and a
 * persona's detail sheet has a Chat tab with the same panel (threads ->
 * transcript -> composer). The demo's simulated desktop answers chat_send
 * (mockCommandPlane: the command completes at 2 s with the user message
 * written, a persona turn is a run, the canned reply lands at 4 s). Demo mode
 * is in-memory, so every test enters through /demo and starts from the fixtures.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
    } catch {
      /* storage unavailable */
    }
  });
});

async function openDemo(page: Page, query = "") {
  await page.goto(`/demo${query}`);
  await page.waitForURL(/\/dashboard\/personas/);
  await expect(page.getByRole("heading", { name: "Your agents" })).toBeVisible();
  await expect(page.locator("li[data-persona-row]").first()).toBeVisible();
}

async function openAthena(page: Page) {
  await page.getByRole("button", { name: "Chat with Athena" }).click();
  const sheet = page.getByRole("dialog", { name: "Athena" });
  await expect(sheet.locator('[data-chat-panel="athena"]')).toBeVisible();
  return sheet;
}

/** Type into the composer and send; returns the moment Send was pressed. */
async function send(sheet: ReturnType<Page["getByRole"]>, text: string): Promise<number> {
  const field = sheet.locator("textarea[data-chat-composer]");
  await expect(field).toBeEnabled();
  await field.fill(text);
  const t0 = Date.now();
  await sheet.locator('[data-chat-action="send"]').click();
  return t0;
}

test.describe("phone chat (demo)", () => {
  test("Athena: the pinned row opens her threads; New chat, send, the reply arrives within 6 s", async ({ page }) => {
    await openDemo(page);
    // Pinned above the personas.
    const athenaBox = await page.locator("[data-athena-row]").boundingBox();
    const firstPersona = await page.locator("li[data-persona-row]").first().boundingBox();
    expect(athenaBox!.y).toBeLessThan(firstPersona!.y);

    const sheet = await openAthena(page);
    await expect(sheet.locator("[data-chat-thread]")).toHaveCount(2);
    await expect(sheet.locator("[data-chat-thread]").first()).toContainText("Daily check-in");

    await sheet.getByRole("button", { name: "New chat" }).click();
    await expect(sheet.getByText(/^Ask Athena anything\./)).toBeVisible();
    const t0 = await send(sheet, "What should I focus on today?");

    // The message shows at once, with the turn's state under it.
    const mine = sheet.locator('[data-chat-message="user"]').filter({ hasText: "What should I focus on today?" });
    await expect(mine).toBeVisible();
    await expect(sheet.locator("[data-chat-turn]").first()).toHaveText(/Sending\.\.\.|Athena is thinking\.\.\./);

    const reply = sheet.locator('[data-chat-message="assistant"]').filter({ hasText: "What should I focus on today?" });
    await expect(reply).toBeVisible({ timeout: 6_000 });
    const elapsed = Date.now() - t0;
    test.info().annotations.push({ type: "athena-reply", description: `${elapsed} ms send -> reply` });
    expect(elapsed).toBeLessThan(6_000);
    // The turn is over: no status line, and the bubble is the synced message now.
    await expect(sheet.locator("[data-chat-turn]")).toHaveCount(0);
    await expect(sheet.locator('[data-chat-optimistic="true"]')).toHaveCount(0);
    await expect(mine).toHaveCount(1);

    // The new thread is in the list, newest first, and persists for the session.
    await sheet.getByRole("button", { name: "All chats" }).click();
    await expect(sheet.locator("[data-chat-thread]")).toHaveCount(3);
    await expect(sheet.locator("[data-chat-thread]").nth(1)).toContainText("What should I focus on today?");
  });

  test("Athena: replying in an existing thread keeps its history", async ({ page }) => {
    await openDemo(page);
    const sheet = await openAthena(page);
    await sheet.locator("[data-chat-thread]").first().click();
    await expect(sheet.locator('[data-chat-message="assistant"]').first()).toContainText("Two things need you this morning");
    const before = await sheet.locator("[data-chat-message]").count();
    await send(sheet, "Thanks, open the PR for me");
    await expect(sheet.locator('[data-chat-message="assistant"]').last()).toContainText("Thanks, open the PR for me", { timeout: 6_000 });
    await expect(sheet.locator("[data-chat-message]")).toHaveCount(before + 2);
  });

  test("persona Chat tab: threads, send, thinking while the run goes, then the reply", async ({ page }) => {
    const name = "PR Review Agent";
    await openDemo(page);
    await page.getByRole("button", { name: `Open ${name}` }).click();
    const sheet = page.getByRole("dialog", { name });
    await sheet.getByRole("tab", { name: "Chat" }).click();
    await expect(sheet.getByRole("tab", { name: "Chat" })).toHaveAttribute("aria-selected", "true");
    await expect(sheet.locator("[data-chat-thread]")).toHaveCount(2);

    await sheet.locator("[data-chat-thread]").first().click();
    await expect(sheet.locator('[data-chat-message="assistant"]').first()).toContainText("handleInvoicePaid");
    const t0 = await send(sheet, "Is the fix merged yet?");
    await expect(sheet.locator("[data-chat-turn]").first()).toHaveText(`${name} is thinking...`, { timeout: 4_000 });
    await expect(sheet.locator('[data-chat-message="assistant"]').last()).toContainText("Is the fix merged yet?", { timeout: 6_000 });
    expect(Date.now() - t0).toBeLessThan(6_000);
    await expect(sheet.locator("[data-chat-turn]")).toHaveCount(0);

    // The chat turn was a run: Activity has it.
    await sheet.getByRole("tab", { name: "Activity" }).click();
    await expect(sheet.locator("li[data-activity-run]").first()).toHaveAttribute("data-run-status", "completed");
  });

  test("a paused persona still chats (M21): the message sends and the demo reply arrives", async ({ page }) => {
    await openDemo(page);
    // The demo has one paused persona; its row offers Resume.
    const resume = page.getByRole("button", { name: /^Resume / }).first();
    const name = (await resume.getAttribute("aria-label"))!.replace(/^Resume /, "");
    await page.getByRole("button", { name: `Open ${name}` }).click();
    const sheet = page.getByRole("dialog", { name });
    await sheet.getByRole("tab", { name: "Chat" }).click();
    await sheet.getByRole("button", { name: "New chat" }).click();
    await expect(sheet.locator("[data-chat-composer-hint]")).toHaveCount(0);
    await send(sheet, "Are you still watching the queue?");
    await expect(sheet.locator('[data-chat-message="assistant"]').last()).toContainText("Are you still watching the queue?", { timeout: 6_000 });
    // Chatting did not resume it: the row still offers Resume.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: `Resume ${name}` })).toBeVisible();
  });

  test("?desktop=offline: threads still read, the composer is disabled with the reason", async ({ page }) => {
    await openDemo(page, "?desktop=offline");
    const sheet = await openAthena(page);
    await sheet.locator("[data-chat-thread]").first().click();
    await expect(sheet.locator('[data-chat-message="assistant"]').first()).toBeVisible();
    await expect(sheet.locator("textarea[data-chat-composer]")).toBeDisabled();
    await expect(sheet.locator('[data-chat-action="send"]')).toBeDisabled();
    await expect(sheet.locator("[data-chat-composer-hint]")).toHaveText(
      "Personas isn't running on your computer. Open it to chat from here.",
    );
  });

  test("touch targets are at least 44 px, and no horizontal scroll with a chat open", async ({ page }) => {
    const device = page.viewportSize()!.width;
    await openDemo(page);
    const sheet = await openAthena(page);
    for (const target of [
      page.getByRole("button", { name: "Chat with Athena" }),
      sheet.getByRole("button", { name: "New chat" }),
      sheet.locator("[data-chat-thread]").first(),
    ]) {
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await sheet.locator("[data-chat-thread]").first().click();
    for (const target of [sheet.getByRole("button", { name: "All chats" }), sheet.locator('[data-chat-action="send"]')]) {
      const box = (await target.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    await send(sheet, "A long message without spaces: " + "x".repeat(300));
    await expect(sheet.locator('[data-chat-message="assistant"]').last()).toContainText("A long message", { timeout: 6_000 });
    const widths = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const prev = body.style.overflowX;
      body.style.overflowX = "visible";
      const unclipped = doc.scrollWidth;
      body.style.overflowX = prev;
      return { scrollWidth: doc.scrollWidth, unclipped };
    });
    expect(widths.scrollWidth).toBeLessThanOrEqual(device);
    expect(widths.unclipped).toBeLessThanOrEqual(device);
    // Nothing inside the sheet overflows sideways either.
    const panel = await sheet.locator('[data-chat-panel="athena"]').evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(panel.scroll).toBeLessThanOrEqual(panel.client);
  });
});
