import {type Browser, expect, type Page, test} from "@playwright/test";

const ADMIN_EMAIL = "admin@leaseqa.dev";
const TENANT_EMAIL = "tenant@leaseqa.dev";
const ADMIN_LABEL = "Demo Admin";
const TEST_PASSWORD =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || "leaseqa-e2e-admin";

async function loginAsUser(page: Page, email: string, nextPath: string) {
  await page.goto(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", {name: "Sign In"}).click();
}

async function newLoggedInPage(
  browser: Browser,
  email: string,
  nextPath: string,
) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAsUser(page, email, nextPath);
  return {context, page};
}

async function createPostFromComposer(page: Page, title: string, details: string) {
  await page.locator('input[placeholder*="Short question"]').fill(title);
  await page.locator(".compose-form-editor .ql-editor").fill(details);
  await page.getByRole("button", {name: "Post"}).click();
  await expect(page).toHaveURL(/\/qa\?post=/, {timeout: 10_000});
  await expect(page.getByRole("heading", {name: title})).toBeVisible({
    timeout: 10_000,
  });
}

async function postRootFollowUp(page: Page, text: string) {
  const discussionCard = page.locator(".post-detail-card", {
    hasText: "Follow-up Discussion",
  });
  await discussionCard.getByRole("button", {name: "Write follow-up"}).click();
  await discussionCard.locator(".ql-editor").last().fill(text);
  const createResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/discussions") &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await discussionCard.getByRole("button", {name: "Post follow-up"}).click();
  await createResponse;
  return discussionCard;
}

async function postReply(
  page: Page,
  thread: ReturnType<Page["locator"]>,
  text: string,
) {
  await thread.locator(".post-discussion-reply-btn").click();
  await thread.locator(".ql-editor").last().fill(text);
  const createResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/discussions") &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await thread.locator(".post-editor-actions .post-btn.primary").click();
  await createResponse;
}

test.describe("discussion threads", () => {
  test("tenant can reply, edit, and delete their own follow-up while admin controls stay hidden", async ({
                                                                                                           browser,
                                                                                                         }) => {
    const postTitle = `Playwright discussion permissions ${Date.now()}`;
    const adminRoot = `Admin moderation note ${Date.now()}`;
    const tenantReply = `Tenant follow-up about the move-out inspection ${Date.now()}`;
    const tenantReplyUpdated = `${tenantReply} updated`;

    const {context: adminContext, page: adminPage} = await newLoggedInPage(
      browser,
      ADMIN_EMAIL,
      "/qa?compose=1",
    );

    await expect(
      adminPage.getByRole("heading", {name: "Ask one clear question."}),
    ).toBeVisible();
    await createPostFromComposer(
      adminPage,
      postTitle,
      "This post is created to verify discussion permissions and edit flows.",
    );
    await postRootFollowUp(adminPage, adminRoot);
    const adminPostUrl = new URL(adminPage.url());
    const postPath = `${adminPostUrl.pathname}${adminPostUrl.search}`;

    const {context: tenantContext, page: tenantPage} = await newLoggedInPage(
      browser,
      TENANT_EMAIL,
      postPath,
    );

    const discussionCard = tenantPage.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    const adminThread = discussionCard.locator(".post-discussion-item", {
      hasText: adminRoot,
    });

    await expect(adminThread).toBeVisible();
    await expect(adminThread.getByTitle("Edit discussion")).toHaveCount(0);
    await expect(adminThread.getByTitle("Delete discussion")).toHaveCount(0);

    await postReply(tenantPage, adminThread, tenantReply);

    const tenantReplyThread = adminThread.locator(
      ".post-discussion-replies .post-discussion-item.post-discussion-reply",
      {
        hasText: tenantReply,
      },
    );
    await expect(tenantReplyThread).toBeVisible();

    await tenantReplyThread.getByTitle("Edit discussion").click();
    await tenantReplyThread.locator(".ql-editor").last().fill(tenantReplyUpdated);
    const updateResponse = tenantPage.waitForResponse(
      (response) =>
        response.url().includes("/api/discussions/") &&
        response.request().method() === "PATCH" &&
        response.ok(),
    );
    await tenantReplyThread.getByRole("button", {name: "Save"}).click();
    await updateResponse;
    await expect(
      adminThread.locator(".post-discussion-replies .post-discussion-item.post-discussion-reply", {
        hasText: tenantReplyUpdated,
      }),
    ).toBeVisible();

    await tenantPage.reload();
    const discussionCardAfterEdit = tenantPage.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    const adminThreadAfterEdit = discussionCardAfterEdit.locator(".post-discussion-item", {
      hasText: adminRoot,
    });
    const editedReplyThread = adminThreadAfterEdit.locator(
      ".post-discussion-replies .post-discussion-item.post-discussion-reply",
      {
        hasText: tenantReplyUpdated,
      },
    );
    await expect(editedReplyThread).toBeVisible();

    const deleteResponse = tenantPage.waitForResponse(
      (response) =>
        response.url().includes("/api/discussions/") &&
        response.request().method() === "DELETE" &&
        response.ok(),
    );
    await editedReplyThread.getByTitle("Delete discussion").click();
    await deleteResponse;
    await tenantPage.reload();
    await expect(
      tenantPage.locator(".post-discussion-item", {hasText: tenantReplyUpdated}),
    ).toHaveCount(0);

    await tenantContext.close();
    await adminContext.close();
  });

  test("deep replies keep author labels and deleting a root discussion removes all descendants", async ({
                                                                                                          browser,
                                                                                                        }) => {
    const postTitle = `Playwright deep discussion ${Date.now()}`;
    const rootThread = `Security deposit root thread ${Date.now()}`;
    const tenantReply = `Tenant asks about the itemized list ${Date.now()}`;
    const adminNestedReply = `Admin clarifies the written statement deadline ${Date.now()}`;

    const {context: adminContext, page: adminPage} = await newLoggedInPage(
      browser,
      ADMIN_EMAIL,
      "/qa?compose=1",
    );

    await expect(
      adminPage.getByRole("heading", {name: "Ask one clear question."}),
    ).toBeVisible();
    await createPostFromComposer(
      adminPage,
      postTitle,
      "This post is created to verify deep discussion threading.",
    );
    const discussionCard = await postRootFollowUp(adminPage, rootThread);
    const adminPostUrl = new URL(adminPage.url());
    const postPath = `${adminPostUrl.pathname}${adminPostUrl.search}`;
    const rootThreadItem = discussionCard.locator(".post-discussion-item", {
      hasText: rootThread,
    });

    const {context: tenantContext, page: tenantPage} = await newLoggedInPage(
      browser,
      TENANT_EMAIL,
      postPath,
    );
    const tenantDiscussionCard = tenantPage.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    const tenantRootThread = tenantDiscussionCard.locator(".post-discussion-item", {
      hasText: rootThread,
    });
    await postReply(tenantPage, tenantRootThread, tenantReply);
    await expect(
      tenantRootThread.locator(".post-discussion-replies .post-discussion-item", {
        hasText: tenantReply,
      }),
    ).toBeVisible();
    await tenantPage.close();
    await tenantContext.close();

    await adminPage.reload();
    const discussionCardAfterTenantReply = adminPage.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    const rootThreadAfterTenantReply = discussionCardAfterTenantReply.locator(
      ".post-discussion-item",
      {
        hasText: rootThread,
      },
    );
    const tenantReplyThread = rootThreadAfterTenantReply.locator(
      ".post-discussion-replies .post-discussion-item.post-discussion-reply",
      {
        hasText: tenantReply,
      },
    );
    await postReply(adminPage, tenantReplyThread, adminNestedReply);
    await expect(
      tenantReplyThread.locator(
        ".post-discussion-replies .post-discussion-item.post-discussion-reply",
        {
          hasText: adminNestedReply,
        },
      ),
    ).toBeVisible();

    await adminPage.reload();
    const rootThreadAfterDeepReply = adminPage.locator(".post-discussion-item", {
      hasText: rootThread,
    });
    const tenantReplyThreadAfterReload = rootThreadAfterDeepReply.locator(
      ".post-discussion-replies .post-discussion-item.post-discussion-reply",
      {
        hasText: tenantReply,
      },
    );
    const nestedReplyThread = tenantReplyThreadAfterReload.locator(
      ".post-discussion-replies .post-discussion-item.post-discussion-reply",
      {
        hasText: adminNestedReply,
      },
    );
    await expect(nestedReplyThread.locator(".post-discussion-author")).toContainText(
      ADMIN_LABEL,
    );

    const rootThreadAfterReload = adminPage.locator(".post-discussion-item", {
      hasText: rootThread,
    });
    await rootThreadAfterReload
      .locator(':scope > .post-discussion-header button[title="Delete discussion"]')
      .click();
    await adminPage.reload();

    await expect(adminPage.locator(".post-discussion-item", {hasText: rootThread})).toHaveCount(
      0,
    );
    await expect(
      adminPage.locator(".post-discussion-item", {hasText: tenantReply}),
    ).toHaveCount(0);
    await expect(
      adminPage.locator(".post-discussion-item", {hasText: adminNestedReply}),
    ).toHaveCount(0);

    await adminContext.close();
  });
});
