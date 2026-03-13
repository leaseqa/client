import { expect, test, type Browser, type Page } from "@playwright/test";

const ADMIN_EMAIL = "admin@leaseqa.dev";
const TENANT_EMAIL = "tenant@leaseqa.dev";
const TEST_PASSWORD =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || "leaseqa-e2e-admin";
const SAMPLE_CLAUSE =
  "The landlord must return the security deposit within 30 days after the tenant moves out, minus any lawful deductions.";

async function loginAsUser(page: Page, email: string, nextPath: string) {
  await page.goto(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10_000 });
}

async function newLoggedInPage(
  browser: Browser,
  email: string,
  nextPath: string,
) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAsUser(page, email, nextPath);
  return { context, page };
}

async function createPostFromComposer(page: Page, title: string, details: string) {
  await page.locator('input[placeholder*="Short question"]').fill(title);
  await page.locator(".compose-form-editor .ql-editor").fill(details);
  await page.getByRole("button", { name: "Post" }).click();
  await expect(page).toHaveURL(/\/qa\?post=/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: title })).toBeVisible({
    timeout: 10_000,
  });
}

async function openNotifications(page: Page) {
  await page.getByLabel("Open notifications").click();
  await expect(page.getByText("Notifications")).toBeVisible();
}

function getNotificationsMenu(page: Page) {
  return page.locator(".dropdown-menu").filter({ hasText: "Notifications" }).last();
}

async function clearUnreadNotifications(page: Page) {
  await page.evaluate(async () => {
    while (true) {
      const listResponse = await fetch("/api/activity/notifications?limit=100", {
        credentials: "include",
      });
      if (!listResponse.ok) {
        return;
      }
      const payload = await listResponse.json();
      const ids = (payload.data || []).map((item: { _id: string }) => item._id);
      if (!ids.length) {
        return;
      }
      await fetch("/api/activity/notifications/read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    }
  });
}

test.describe("activity notifications", () => {
  test("tenant sees ai review and post activity in account history", async ({
    page,
  }) => {
    const postTitle = `Playwright activity post ${Date.now()}`;

    await loginAsUser(page, TENANT_EMAIL, "/ai-review");
    await expect(page).toHaveURL(/\/ai-review$/);

    await page.locator('textarea[name="sourceText"]').fill(SAMPLE_CLAUSE);
    const createSessionResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/rag/sessions") &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await page.getByRole("button", { name: "Analyze clause" }).click();
    await createSessionResponse;

    await page.goto("/account");
    await expect(page.locator(".account-activity-list")).toContainText("Created an AI review", {
      timeout: 10_000,
    });

    await page.goto("/qa?compose=1");
    await createPostFromComposer(
      page,
      postTitle,
      "This post verifies account activity for newly created questions.",
    );

    await page.goto("/account");
    await expect(page.locator(".account-activity-list")).toContainText(
      "Posted a new question",
      { timeout: 10_000 },
    );
    await expect(page.locator(".account-activity-list")).toContainText(postTitle);
  });

  test("tenant sees an unread answer notification and it clears after opening", async ({
    browser,
  }) => {
    const postTitle = `Playwright answer notification ${Date.now()}`;

    const { context: tenantContext, page: tenantPage } = await newLoggedInPage(
      browser,
      TENANT_EMAIL,
      "/qa?compose=1",
    );
    await clearUnreadNotifications(tenantPage);
    await createPostFromComposer(
      tenantPage,
      postTitle,
      "This post verifies answer notifications.",
    );
    const postUrl = tenantPage.url();

    const { context: adminContext, page: adminPage } = await newLoggedInPage(
      browser,
      ADMIN_EMAIL,
      new URL(postUrl).pathname + new URL(postUrl).search,
    );
    const answersCard = adminPage.locator(".post-detail-card", { hasText: "Answers" });
    await answersCard.getByRole("button", { name: "Write an answer" }).click();
    await answersCard.locator(".ql-editor").last().fill("Admin answer for notification coverage.");
    const createAnswerResponse = adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/answers") &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await answersCard.getByRole("button", { name: "Post answer" }).click();
    await createAnswerResponse;
    await expect(adminPage.getByText("Admin answer for notification coverage.")).toBeVisible();

    await tenantPage.goto("/account");
    await openNotifications(tenantPage);
    const notificationsMenu = getNotificationsMenu(tenantPage);
    const answerNotification = notificationsMenu
      .getByRole("button")
      .filter({ hasText: postTitle })
      .first();
    await expect(answerNotification).toBeVisible({
      timeout: 10_000,
    });
    await answerNotification.click();
    await expect(tenantPage).toHaveURL(/\/qa\?post=/);

    await tenantPage.goto("/account");
    await openNotifications(tenantPage);
    await expect(getNotificationsMenu(tenantPage).getByText("No new notifications")).toBeVisible();

    await adminContext.close();
    await tenantContext.close();
  });

  test("tenant sees a follow-up notification when someone replies to their thread", async ({
    browser,
  }) => {
    const postTitle = `Playwright discussion notification ${Date.now()}`;
    const tenantRoot = `Tenant root follow-up ${Date.now()}`;

    const { context: tenantContext, page: tenantPage } = await newLoggedInPage(
      browser,
      TENANT_EMAIL,
      "/qa?compose=1",
    );
    await clearUnreadNotifications(tenantPage);
    await createPostFromComposer(
      tenantPage,
      postTitle,
      "This post verifies discussion notifications.",
    );
    const discussionCard = tenantPage.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    await discussionCard.getByRole("button", { name: "Write follow-up" }).click();
    await discussionCard.locator(".ql-editor").last().fill(tenantRoot);
    const createDiscussionResponse = tenantPage.waitForResponse(
      (response) =>
        response.url().includes("/api/discussions") &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await discussionCard.getByRole("button", { name: "Post follow-up" }).click();
    await createDiscussionResponse;
    await expect(discussionCard.getByText(tenantRoot)).toBeVisible();
    const postUrl = tenantPage.url();

    const { context: adminContext, page: adminPage } = await newLoggedInPage(
      browser,
      ADMIN_EMAIL,
      new URL(postUrl).pathname + new URL(postUrl).search,
    );
    const adminDiscussionCard = adminPage.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    const tenantThread = adminDiscussionCard.locator(".post-discussion-item", {
      hasText: tenantRoot,
    });
    await tenantThread.locator(".post-discussion-reply-btn").click();
    await tenantThread.locator(".ql-editor").last().fill("Admin reply for notification coverage.");
    const replyResponse = adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/discussions") &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await tenantThread.locator(".post-editor-actions .post-btn.primary").click();
    await replyResponse;

    await tenantPage.goto("/account");
    await openNotifications(tenantPage);
    const discussionNotification = getNotificationsMenu(tenantPage)
      .getByRole("button")
      .filter({ hasText: postTitle })
      .first();
    await expect(discussionNotification).toBeVisible({
      timeout: 10_000,
    });

    await adminContext.close();
    await tenantContext.close();
  });
});
