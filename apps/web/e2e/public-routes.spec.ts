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

/** Reachable without an account. */
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/info"];

/**
 * Reachable only once signed in. These carry most of the icon-only controls,
 * so leaving them out of the sweep is how the unlabelled post actions and
 * composer close button survived.
 */
const SIGNED_IN_ROUTES = [
  "/qa",
  "/qa?compose=1",
  "/qa?post=post-1",
  "/qa/manage",
  "/qa/resources",
  "/qa/stats",
  "/account",
  "/ai-review",
];

const ADMIN_USER = {
  _id: "sweep-admin",
  username: "Sweep Admin",
  email: "sweep@leaseqa.dev",
  role: "admin",
};

const SWEEP_POST = {
  _id: "post-1",
  summary: "How long does a landlord have to return a deposit?",
  details: "<p>My lease ended last month.</p>",
  postType: "question",
  folders: ["folder-1"],
  authorId: "sweep-admin",
  lawyerOnly: false,
  fromAIReviewId: null,
  urgency: "medium",
  viewCount: 3,
  isPinned: false,
  isResolved: false,
  isAnonymous: false,
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z",
  lastActivityAt: "2026-08-19T10:00:00.000Z",
  author: { _id: "sweep-admin", username: "Sweep Admin", role: "admin" },
  answers: [],
  discussions: [],
};

/**
 * Signs the page in as an admin and gives every list endpoint enough shape to
 * render populated. An empty route exercises none of the row-level controls.
 */
async function stubAdminData(page: Page) {
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    const json = (body: unknown) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    if (url.includes("/auth/session")) return json({ data: ADMIN_USER });
    if (url.includes("/folders")) {
      return json({
        data: [
          {
            _id: "folder-1",
            name: "deposits",
            displayName: "Deposits",
            description: "Security deposit questions",
            color: "#5c6e4e",
          },
        ],
      });
    }
    if (url.includes("/stats/overview")) {
      return json({ data: { totalPosts: 4, totalAnswers: 2, totalUsers: 3, resolvedPosts: 1 } });
    }
    if (url.includes("/posts")) return json({ data: [SWEEP_POST] });
    return json({ data: [] });
  });
}

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
      await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
      await expectShellRendered(page);
    });
  }

  test("a guest reaching AI review is sent to login rather than a blank page", async ({
    page,
  }) => {
    await stubSession(page, "unauthorized");
    await page.goto("/ai-review");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expectShellRendered(page);
  });

  test("AI review renders its source picker for an authenticated renter", async ({
    page,
  }) => {
    await stubSession(page, "authenticated");
    await page.goto("/ai-review");
    await expect(page.getByRole("tab", { name: "Upload file" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Paste text" })).toBeVisible();
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

  /**
   * Returns every visible interactive control that exposes no accessible name.
   * This is the check that originally found the unlabelled sign-in fields and
   * the icon-only post actions.
   */
  async function unnamedControls(page: Page) {
    return page.evaluate(() => {
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
  }

  for (const route of PUBLIC_ROUTES) {
    test(`no control is left unnamed on ${route}`, async ({ page }) => {
      await stubSession(page, "unauthorized");
      await page.goto(route);
      await page.waitForLoadState("networkidle").catch(() => {});
      expect(await unnamedControls(page)).toEqual([]);
    });
  }

  for (const route of SIGNED_IN_ROUTES) {
    test(`no control is left unnamed on ${route} when signed in`, async ({
      page,
    }) => {
      await stubAdminData(page);
      await page.goto(route);
      await page.waitForLoadState("networkidle").catch(() => {});
      expect(await unnamedControls(page)).toEqual([]);
    });
  }

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

  /** One h1, first heading is the h1, and no skipped levels. */
  async function headingProblems(page: Page) {
    return page.evaluate(() => {
      const hs = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"))
        .filter((e) => !e.closest("nextjs-portal"))
        .filter((e) => {
          const b = e.getBoundingClientRect();
          return b.width > 0 && b.height > 0;
        })
        .map((e) => ({ lvl: Number(e.tagName[1]), text: (e.textContent || "").trim().slice(0, 30) }));
      const problems: string[] = [];
      const h1s = hs.filter((h) => h.lvl === 1);
      if (h1s.length !== 1) problems.push(`${h1s.length} h1 elements`);
      if (hs.length && hs[0].lvl !== 1) problems.push(`first heading is h${hs[0].lvl}`);
      for (let i = 1; i < hs.length; i += 1) {
        if (hs[i].lvl - hs[i - 1].lvl > 1) {
          problems.push(`skips h${hs[i - 1].lvl} to h${hs[i].lvl} at "${hs[i].text}"`);
        }
      }
      return problems;
    });
  }

  for (const route of PUBLIC_ROUTES) {
    test(`heading outline is well formed on ${route}`, async ({ page }) => {
      await stubSession(page, "unauthorized");
      await page.goto(route);
      await page.waitForLoadState("networkidle").catch(() => {});
      expect(await headingProblems(page)).toEqual([]);
    });
  }

  for (const route of SIGNED_IN_ROUTES) {
    test(`heading outline is well formed on ${route} when signed in`, async ({
      page,
    }) => {
      await stubAdminData(page);
      await page.goto(route);
      await page.waitForLoadState("networkidle").catch(() => {});
      expect(await headingProblems(page)).toEqual([]);
    });
  }
});
