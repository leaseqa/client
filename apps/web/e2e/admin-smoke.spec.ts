import {expect, type Page, test} from "@playwright/test";

const ADMIN_EMAIL = "admin@leaseqa.dev";
const ADMIN_PASSWORD =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || "leaseqa-e2e-admin";

async function loginAsAdmin(page: Page, nextPath: string) {
  await page.goto(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", {name: "Sign In"}).click();
}

async function createPostFromComposer(page: Page, title: string, details: string) {
  await page.locator('input[placeholder*="Short question"]').fill(title);
  await page.locator(".compose-form-editor .ql-editor").fill(details);
  await page.getByRole("button", {name: "Post"}).click();
  await expect(page.getByRole("heading", {name: title})).toBeVisible();
}

test.describe("admin smoke", () => {
  test("admin can create, edit, and delete a section from the manage workspace", async ({
                                                                                          page,
                                                                                        }) => {
    const slug = `e2e-section-${Date.now()}`;
    const originalName = `E2E Section ${Date.now()}`;
    const updatedName = `${originalName} Updated`;

    await loginAsAdmin(page, "/qa/manage");
    await expect(page.getByRole("heading", {name: "LeaseQA Admin"})).toBeVisible();
    await expect(page.getByRole("link", {name: "Open Moderation"})).toBeVisible();
    await expect(page.locator("#users")).toContainText("admin@leaseqa.dev");

    await page.getByRole("button", {name: "New Section"}).click();
    await expect(page.getByRole("heading", {name: "Create New Section"})).toBeVisible();

    await page.locator('input[name="name"]').fill(slug);
    await page.locator('input[placeholder="Repairs & Habitability"]').fill(originalName);
    await page
      .locator('textarea[placeholder="Optional helper text for this section"]')
      .fill("Playwright smoke section");
    await page.getByRole("button", {name: "Create Section"}).click();

    const createdRow = page.locator(".manage-table-row", {hasText: originalName});
    await expect(createdRow).toBeVisible();

    await createdRow.locator('button[title="Edit"]').click();
    await expect(page.getByRole("heading", {name: "Edit section"})).toBeVisible();
    await page.locator('input[placeholder="Repairs & Habitability"]').fill(updatedName);
    await page
      .locator('textarea[placeholder="Optional helper text for this section"]')
      .fill("Updated by Playwright smoke");
    await page.getByRole("button", {name: "Save Changes"}).click();

    const updatedRow = page.locator(".manage-table-row", {hasText: updatedName});
    await expect(updatedRow).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await updatedRow.locator('button[title="Delete"]').click();
    await expect(updatedRow).toHaveCount(0);
  });

  test("admin can create a post and open the moderation surface", async ({
                                                                           page,
                                                                         }) => {
    const postTitle = `Playwright admin smoke ${Date.now()}`;

    await loginAsAdmin(page, "/qa?compose=1");
    await expect(page.getByRole("heading", {name: "Ask one clear question."})).toBeVisible();

    await createPostFromComposer(
      page,
      postTitle,
      "This is a smoke-test question created to verify the moderation surface.",
    );
    await expect(page.getByRole("button", {name: "Back to questions"})).toBeVisible();
    await expect(
      page.locator('button[title="Pin post"], button[title="Unpin post"]').first(),
    ).toBeVisible();
    await expect(page.getByText("Status:")).toBeVisible();

    const resolvedLabel = page.locator(".post-status-options label", {
      hasText: "Resolved",
    });
    await resolvedLabel.click();
    await expect(
      page.locator(".post-status-options label.active", {hasText: "Resolved"}),
    ).toBeVisible();

    const openLabel = page.locator(".post-status-options label", {hasText: "Open"});
    await openLabel.click();
    await expect(
      page.locator(".post-status-options label.active", {hasText: "Open"}),
    ).toBeVisible();

    const answersCard = page.locator(".post-detail-card", {hasText: "Answers"});
    await answersCard.getByRole("button", {name: "Write an answer"}).click();
    await expect(answersCard.getByRole("button", {name: "Post answer"})).toBeVisible();
    await answersCard.getByRole("button", {name: "Cancel"}).click();

    const discussionCard = page.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    await discussionCard.getByRole("button", {name: "Write follow-up"}).click();
    await expect(
      discussionCard.getByRole("button", {name: "Post follow-up"}),
    ).toBeVisible();
    await discussionCard.getByRole("button", {name: "Cancel"}).click();
  });

  test("discussion threads persist multiple roots and nested replies after reload", async ({
                                                                                             page,
                                                                                           }) => {
    const postTitle = `Playwright discussion thread ${Date.now()}`;
    const rootThreadA = `Need clarification on move-out date ${Date.now()}`;
    const nestedReply = `Landlord should confirm the inspection window ${Date.now()}`;
    const rootThreadB = `Can they deduct for ordinary wear and tear ${Date.now()}`;

    await loginAsAdmin(page, "/qa?compose=1");
    await expect(page.getByRole("heading", {name: "Ask one clear question."})).toBeVisible();
    await createPostFromComposer(
      page,
      postTitle,
      "This post is created to verify multiple discussion threads survive a reload.",
    );

    const discussionCard = page.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });

    await discussionCard.getByRole("button", {name: "Write follow-up"}).click();
    await discussionCard.locator(".ql-editor").last().fill(rootThreadA);
    await discussionCard.getByRole("button", {name: "Post follow-up"}).click();

    const firstThread = discussionCard.locator(".post-discussion-item", {
      hasText: rootThreadA,
    });
    await expect(firstThread).toBeVisible();

    await firstThread.locator(".post-discussion-reply-btn").click();
    await firstThread.locator(".ql-editor").last().fill(nestedReply);
    await firstThread.locator(".post-editor-actions .post-btn.primary").click();
    await expect(firstThread.locator(".post-discussion-replies")).toContainText(nestedReply);

    await discussionCard.getByRole("button", {name: "Write follow-up"}).click();
    await discussionCard.locator(".ql-editor").last().fill(rootThreadB);
    await discussionCard.getByRole("button", {name: "Post follow-up"}).click();

    const secondThread = discussionCard.locator(".post-discussion-item", {
      hasText: rootThreadB,
    });
    await expect(secondThread).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", {name: postTitle})).toBeVisible();

    const discussionCardAfterReload = page.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    const firstThreadAfterReload = discussionCardAfterReload.locator(".post-discussion-item", {
      hasText: rootThreadA,
    });
    const secondThreadAfterReload = discussionCardAfterReload.locator(".post-discussion-item", {
      hasText: rootThreadB,
    });

    await expect(firstThreadAfterReload).toContainText(rootThreadA);
    await expect(firstThreadAfterReload.locator(".post-discussion-replies")).toContainText(
      nestedReply,
    );
    await expect(secondThreadAfterReload).toContainText(rootThreadB);
    await expect(
      discussionCardAfterReload.locator(".post-discussions-list > .post-discussion-item"),
    ).toHaveCount(2);
  });
});
