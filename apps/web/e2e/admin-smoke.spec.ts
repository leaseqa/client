import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = "admin@leaseqa.dev";
const ADMIN_PASSWORD =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || "leaseqa-e2e-admin";

async function loginAsAdmin(page: Page, nextPath: string) {
  await page.goto(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
}

test.describe("admin smoke", () => {
  test("admin can create, edit, and delete a section from the manage workspace", async ({
    page,
  }) => {
    const slug = `e2e-section-${Date.now()}`;
    const originalName = `E2E Section ${Date.now()}`;
    const updatedName = `${originalName} Updated`;

    await loginAsAdmin(page, "/qa/manage");
    await expect(page.getByRole("heading", { name: "LeaseQA Admin" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Moderation" })).toBeVisible();
    await expect(page.locator("#users")).toContainText("admin@leaseqa.dev");

    await page.getByRole("button", { name: "New Section" }).click();
    await expect(page.getByRole("heading", { name: "Create New Section" })).toBeVisible();

    await page.locator('input[name="name"]').fill(slug);
    await page.locator('input[placeholder="Repairs & Habitability"]').fill(originalName);
    await page
      .locator('textarea[placeholder="Optional helper text for this section"]')
      .fill("Playwright smoke section");
    await page.getByRole("button", { name: "Create Section" }).click();

    const createdRow = page.locator(".manage-table-row", { hasText: originalName });
    await expect(createdRow).toBeVisible();

    await createdRow.locator('button[title="Edit"]').click();
    await expect(page.getByRole("heading", { name: "Edit section" })).toBeVisible();
    await page.locator('input[placeholder="Repairs & Habitability"]').fill(updatedName);
    await page
      .locator('textarea[placeholder="Optional helper text for this section"]')
      .fill("Updated by Playwright smoke");
    await page.getByRole("button", { name: "Save Changes" }).click();

    const updatedRow = page.locator(".manage-table-row", { hasText: updatedName });
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
    await expect(page.getByRole("heading", { name: "Ask one clear question." })).toBeVisible();

    await page.locator('input[placeholder*="Short question"]').fill(postTitle);
    await page.locator(".compose-form-editor .ql-editor").fill(
      "This is a smoke-test question created to verify the moderation surface.",
    );
    await page.getByRole("button", { name: "Post" }).click();

    await expect(page.getByRole("heading", { name: postTitle })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to questions" })).toBeVisible();
    await expect(
      page.locator('button[title="Pin post"], button[title="Unpin post"]').first(),
    ).toBeVisible();
    await expect(page.getByText("Status:")).toBeVisible();

    const resolvedLabel = page.locator(".post-status-options label", {
      hasText: "Resolved",
    });
    await resolvedLabel.click();
    await expect(
      page.locator(".post-status-options label.active", { hasText: "Resolved" }),
    ).toBeVisible();

    const openLabel = page.locator(".post-status-options label", { hasText: "Open" });
    await openLabel.click();
    await expect(
      page.locator(".post-status-options label.active", { hasText: "Open" }),
    ).toBeVisible();

    const answersCard = page.locator(".post-detail-card", { hasText: "Answers" });
    await answersCard.getByRole("button", { name: "Write an answer" }).click();
    await expect(answersCard.getByRole("button", { name: "Post answer" })).toBeVisible();
    await answersCard.getByRole("button", { name: "Cancel" }).click();

    const discussionCard = page.locator(".post-detail-card", {
      hasText: "Follow-up Discussion",
    });
    await discussionCard.getByRole("button", { name: "Write follow-up" }).click();
    await expect(
      discussionCard.getByRole("button", { name: "Post follow-up" }),
    ).toBeVisible();
    await discussionCard.getByRole("button", { name: "Cancel" }).click();
  });
});
