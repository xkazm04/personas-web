import { test, expect } from "@playwright/test";

test.describe("User Guide", () => {
  test("landing page navbar has Guide link that navigates to /guide", async ({ page }) => {
    await page.goto("/");
    // Desktop navbar should have a "Guide" link
    const guideLink = page.locator("nav a[href='/guide']").first();
    await expect(guideLink).toBeVisible();
    await guideLink.click();
    await expect(page).toHaveURL("/guide");
  });

  test("guide hub page renders with categories and search", async ({ page }) => {
    await page.goto("/guide");
    // Page heading
    await expect(page.locator("h1")).toContainText("Guide");
    // Search input exists
    await expect(page.locator("input[placeholder*='Search']").first()).toBeVisible();
    // At least 10 category cards rendered (one per category)
    const categoryLinks = page.locator("a[href^='/guide/']");
    await expect(categoryLinks.first()).toBeVisible();
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test("guide sidebar is visible on desktop and lists categories", async ({ page }) => {
    await page.goto("/guide");
    // Sidebar should show category names
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText("Getting Started");
    await expect(sidebar).toContainText("Credentials");
    await expect(sidebar).toContainText("Agents");
    await expect(sidebar).toContainText("Triggers");
    await expect(sidebar).toContainText("Pipelines");
  });

  test("clicking a sidebar category expands topics", async ({ page }) => {
    await page.goto("/guide");
    // Click "Getting Started" category in sidebar
    const sidebar = page.locator("aside").first();
    const categoryBtn = sidebar.locator("button", { hasText: "Getting Started" });
    await categoryBtn.click();
    // After expanding, topic links should appear
    const topicLink = sidebar.locator("a[href*='/guide/getting-started/']").first();
    await expect(topicLink).toBeVisible();
  });

  test("clicking a category card navigates to category page", async ({ page }) => {
    await page.goto("/guide");
    // Click on the first category card in the main content (not sidebar)
    const mainContent = page.locator("main");
    const categoryCard = mainContent.locator("a[href='/guide/getting-started']").first();
    await expect(categoryCard).toBeVisible();
    await categoryCard.click();
    await expect(page).toHaveURL("/guide/getting-started");
    // Category page should show the category name
    await expect(page.locator("h1")).toContainText("Getting Started");
  });

  test("category page lists topic cards", async ({ page }) => {
    await page.goto("/guide/getting-started");
    await expect(page.locator("h1")).toContainText("Getting Started");
    // Should show topic cards — at least the first topic
    await expect(page.locator("h3", { hasText: "Installing Personas" })).toBeVisible();
    // Back link exists
    await expect(page.locator("a", { hasText: "Back to Guide" })).toBeVisible();
  });

  test("clicking a topic card navigates to topic detail page", async ({ page }) => {
    await page.goto("/guide/getting-started");
    // Click on "Installing Personas" topic
    const topicCard = page.locator("a[href*='/installing-personas']").first();
    await expect(topicCard).toBeVisible();
    await topicCard.click();
    await expect(page).toHaveURL("/guide/getting-started/installing-personas");
  });

  test("topic detail page renders markdown content", async ({ page }) => {
    await page.goto("/guide/getting-started/installing-personas");
    // Breadcrumb navigation inside main content area (not the top Navbar)
    const mainContent = page.locator("main");
    await expect(mainContent).toContainText("Guide");
    await expect(mainContent).toContainText("Getting Started");
    // Article should render the markdown content
    const article = page.locator("article");
    await expect(article).toBeVisible();
    // H2 from markdown content
    await expect(article.locator("h2", { hasText: "Installing Personas" })).toBeVisible();
    // Content text should be present
    await expect(article).toContainText("Getting Personas on your computer");
    // Key Points section
    await expect(article).toContainText("Key Points");
    // Tip blockquote
    await expect(article).toContainText("Tip:");
  });

  test("topic detail page has prev/next navigation", async ({ page }) => {
    await page.goto("/guide/getting-started/installing-personas");
    // First topic should have "Next" navigation at the bottom
    const mainContent = page.locator("main");
    await expect(mainContent.locator("text=Next")).toBeVisible();
    // The next topic link should point to the second topic
    await expect(mainContent.locator("a[href*='/creating-your-first-agent']").last()).toBeVisible();
  });

  test("clicking next topic navigates to the next topic", async ({ page }) => {
    await page.goto("/guide/getting-started/installing-personas");
    // Click the "Next" navigation
    const nextLink = page.locator("a[href*='/creating-your-first-agent']").last();
    await expect(nextLink).toBeVisible();
    await nextLink.click();
    await expect(page).toHaveURL("/guide/getting-started/creating-your-first-agent");
    await expect(page.locator("article")).toContainText("Creating Your First Agent");
  });

  test("sidebar topic link navigates directly to topic", async ({ page }) => {
    await page.goto("/guide");
    const sidebar = page.locator("aside").first();
    // Expand Getting Started
    await sidebar.locator("button", { hasText: "Getting Started" }).click();
    // Click on a specific topic
    const topicLink = sidebar.locator("a[href*='/installing-personas']");
    await expect(topicLink).toBeVisible();
    await topicLink.click();
    await expect(page).toHaveURL("/guide/getting-started/installing-personas");
    await expect(page.locator("article")).toContainText("Installing Personas");
  });

  test("guide search filters topics across categories", async ({ page }) => {
    await page.goto("/guide");
    // Type in the search box
    const searchInput = page.locator("main input[type='text']").first();
    await searchInput.fill("credential");
    // Should show matching results (from credentials category)
    await expect(page.locator("main")).toContainText("Credentials");
    // Should show a result related to credentials
    await expect(page.locator("main")).toContainText("credential");
  });

  test("different category page renders correctly", async ({ page }) => {
    await page.goto("/guide/triggers");
    await expect(page.locator("h1")).toContainText("Triggers");
    await expect(page.locator("h3", { hasText: "How Triggers Work" })).toBeVisible();
  });

  test("different topic renders its own content", async ({ page }) => {
    await page.goto("/guide/credentials/how-personas-keeps-your-data-safe");
    const article = page.locator("article");
    await expect(article).toBeVisible();
    // Should show credential/security content, not getting-started content
    await expect(article).toContainText("encrypt");
  });
});
