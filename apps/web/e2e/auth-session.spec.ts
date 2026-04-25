import {expect, type Page, test} from "@playwright/test";

const TENANT_EMAIL = "tenant@leaseqa.dev";
const TEST_PASSWORD =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || "leaseqa-e2e-admin";

async function login(page: Page, email: string, password: string, nextPath = "/account") {
  await page.goto(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", {name: "Sign In"}).click();
}

test.describe("auth session", () => {
  test("new users can register, persist their session across refresh, and sign out", async ({
                                                                                              page,
                                                                                            }) => {
    const unique = Date.now();
    const email = `playwright-auth-${unique}@leaseqa.dev`;
    const username = `Playwright User ${unique}`;
    const password = "leaseqa-secret";

    await page.goto("/auth/register");
    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.getByRole("button", {name: "Sign Up"}).click();

    await expect(page.getByText("Account Created!")).toBeVisible();
    await page.getByRole("button", {name: "Go to Account"}).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator(".account-header-row").getByText(email)).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator(".account-header-row").getByText(email)).toBeVisible();

    await page.getByRole("button", {name: "Sign out"}).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("existing users can log in and keep their session after refresh", async ({
                                                                                  page,
                                                                                }) => {
    await login(page, TENANT_EMAIL, TEST_PASSWORD);

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator(".account-header-row").getByText(TENANT_EMAIL)).toBeVisible();

    await page.reload();
    await expect(page.locator(".account-header-row").getByText(TENANT_EMAIL)).toBeVisible();
  });
});
