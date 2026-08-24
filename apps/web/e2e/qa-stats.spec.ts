import { expect, type Page, test } from "@playwright/test";

async function stubStatsError(page: Page, status: 401 | 403) {
  await page.route("**/api/stats/overview", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({
        error:
          status === 401
            ? { code: "UNAUTHORIZED", message: "Authentication required" }
            : {
              code: "FORBIDDEN",
              message: "You do not have permission to access this resource.",
            },
      }),
    });
  });
}

test.describe("qa stats", () => {
  test("a guest sees a sign-in prompt instead of a blank page", async ({
                                                                          page,
                                                                        }) => {
    await stubStatsError(page, 401);
    await page.goto("/qa/stats");
    await expect(page.locator(".qa-error-state")).toContainText(/sign in/i);
  });

  test("a signed-in non-admin sees an admin-only message instead of a blank page", async ({
                                                                                             page,
                                                                                           }) => {
    await stubStatsError(page, 403);
    await page.goto("/qa/stats");
    await expect(page.locator(".qa-error-state")).toContainText(/administrators/i);
  });
});
