import { expect, type Page, test } from "@playwright/test";

// Deployment smoke coverage for the routes a renter can reach without an
// account. Task 1 of the refresh made the public shell render while session
// restoration is still in flight, so these also guard against a regression
// where a slow or failing session call blanks the page.

const SESSION_ROUTE = "**/api/auth/session";

async function stubSession(
  page: Page,
  mode: "authenticated" | "unauthorized" | "delayed" | "failed",
) {
  await page.route(SESSION_ROUTE, async (route) => {
    if (mode === "authenticated") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            _id: "smoke-user",
            username: "Smoke Tester",
            email: "smoke@leaseqa.dev",
            role: "tenant",
          },
        }),
      });
      return;
    }
    if (mode === "unauthorized") {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "no session" } }),
      });
      return;
    }
    if (mode === "delayed") {
      // Long enough that the assertions below run while the request is still
      // outstanding, which is the case Task 1 fixed.
      await new Promise((resolve) => setTimeout(resolve, 4000));
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "no session" } }),
      });
      return;
    }
    await route.abort("failed");
  });
}

/** The shell must be present and the body must not be blank. */
async function expectShellRendered(page: Page) {
  await expect(page.locator("header.site-header")).toBeVisible();
  // The wordmark splits across two block-level spans, so the accessible name
  // computes as "Lease QA" with a separating space rather than "LeaseQA".
  await expect(page.getByRole("link", { name: /Lease\s*QA/i }).first()).toBeVisible();
  const text = await page.locator("body").innerText();
  expect(text.trim().length).toBeGreaterThan(40);
}

const SESSION_MODES = ["authenticated", "unauthorized", "delayed", "failed"] as const;

test.describe("public routes", () => {
  for (const mode of SESSION_MODES) {
    test(`the homepage renders its hero with a ${mode} session response`, async ({
      page,
    }) => {
      await stubSession(page, mode);
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: /Understand your lease/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Review My Lease" }),
      ).toBeVisible();
      await expectShellRendered(page);
    });
  }

  for (const mode of SESSION_MODES) {
    test(`the login route renders its form with a ${mode} session response`, async ({
      page,
    }) => {
      await stubSession(page, mode);
      await page.goto("/auth/login");
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
      await expectShellRendered(page);
    });
  }

  test("a guest reaching AI review is sent to login rather than a blank page", async ({
    page,
  }) => {
    await stubSession(page, "unauthorized");
    await page.goto("/ai-review");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expectShellRendered(page);
  });

  test("AI review renders its source picker for an authenticated renter", async ({
    page,
  }) => {
    await stubSession(page, "authenticated");
    await page.goto("/ai-review");
    await expect(page.getByRole("tab", { name: "Upload File" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Paste Text" })).toBeVisible();
    await expectShellRendered(page);
  });

  test("the header exposes both menu triggers on a public route", async ({
    page,
  }) => {
    await stubSession(page, "unauthorized");
    await page.goto("/");
    await expect(page.getByLabel("Open notifications")).toBeVisible();
    await expect(page.getByLabel("Open profile menu")).toBeVisible();
  });

  test("the footer states the legal boundary exactly once", async ({ page }) => {
    await stubSession(page, "unauthorized");
    await page.goto("/");
    const body = await page.locator("body").innerText();
    const occurrences = body.match(/not legal advice/gi) || [];
    expect(occurrences).toHaveLength(1);
  });
});

test.describe("accessible names", () => {
  test("the sign-in fields are programmatically labelled", async ({ page }) => {
    await stubSession(page, "unauthorized");
    await page.goto("/auth/login");
    // Reached by label, not by name= — this is what a screen reader follows.
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("the registration fields are programmatically labelled", async ({ page }) => {
    await stubSession(page, "unauthorized");
    await page.goto("/auth/register");
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  });

  test("no interactive control on a public route is left unnamed", async ({ page }) => {
    await stubSession(page, "unauthorized");
    for (const route of ["/", "/auth/login", "/auth/register", "/info"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle").catch(() => {});
      const unnamed = await page.evaluate(() => {
        const out: string[] = [];
        document
          .querySelectorAll("button,a,input:not([type=hidden]),select,textarea")
          .forEach((el) => {
            if (el.closest("nextjs-portal")) return;
            const box = el.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) return;
            const labels = (el as HTMLInputElement).labels;
            const name = (
              el.getAttribute("aria-label") ||
              el.getAttribute("title") ||
              (labels && labels.length
                ? Array.from(labels).map((l) => l.textContent).join(" ")
                : "") ||
              el.textContent ||
              el.getAttribute("placeholder") ||
              ""
            ).trim();
            if (!name) {
              out.push(`${el.tagName.toLowerCase()}.${el.getAttribute("class") || ""}`);
            }
          });
        return out;
      });
      expect(unnamed, `unnamed controls on ${route}`).toEqual([]);
    }
  });

  test("exactly one element claims to be the current page in the drawer", async ({
    page,
  }) => {
    await stubSession(page, "unauthorized");
    await page.setViewportSize({ width: 390, height: 844 });
    // /qa/resources is the case that broke: "Ask" matched by prefix and
    // "Resources" matched exactly, so both carried aria-current="page".
    await page.goto("/qa/resources");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator(".navbar-toggler").first().click();
    const drawerCurrent = page.locator(
      '.offcanvas [aria-current="page"], .offcanvas-body [aria-current="page"]',
    );
    await expect(drawerCurrent).toHaveCount(1);
  });

  test("a route renders exactly one top-level heading", async ({ page }) => {
    await stubSession(page, "unauthorized");
    for (const route of ["/", "/auth/login", "/info"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle").catch(() => {});
      await expect(page.locator("h1"), `h1 count on ${route}`).toHaveCount(1);
    }
  });
});
