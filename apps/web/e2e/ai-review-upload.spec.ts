import { expect, test } from "@playwright/test";

test.describe("ai review upload", () => {
  test("clicking the upload surface opens the native file chooser", async ({
                                                                              page,
                                                                            }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "Continue as Guest" }).click();
    await page.goto("/ai-review");
    await expect(page).toHaveURL(/\/ai-review$/);

    const chooserPromise = page.waitForEvent("filechooser", { timeout: 5_000 });
    await page.getByText("Choose file", { exact: true }).click();
    await chooserPromise;
  });
});
