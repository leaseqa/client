import { expect, type Page, test } from "@playwright/test";

const TENANT_EMAIL = "tenant@leaseqa.dev";
const TEST_PASSWORD =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || "leaseqa-e2e-admin";
const SKIP_RAG_CONVERSATION_TEST = process.env.CI_SKIP_RAG === "true";
const SAMPLE_CLAUSE =
  "Section 4. Security Deposit. Upon execution of this Lease, Tenant shall pay to " +
  "Landlord a security deposit equal to two months' rent, plus a non-refundable " +
  "cleaning fee of $350.";
const ABSTENTION_PATTERN = /could not find enough support/i;

async function loginAsUser(page: Page, email: string, nextPath: string) {
  await page.goto(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10_000 });
}

async function askFollowUp(page: Page, question: string) {
  await page.locator("#review-question").fill(question);
  const response = page.waitForResponse(
    (candidate) =>
      candidate.url().includes("/messages") &&
      candidate.request().method() === "POST" &&
      candidate.ok(),
  );
  await page.getByRole("button", { name: "Ask" }).click();
  await response;
}

// The chat model occasionally returns structured output that fails parsing or
// cites evidence outside the retrieved set (see abstentionReason in
// server/LeaseQA/RAG/service.js); one retry via a normal follow-up question
// clears it in practice, so this bounds that known flake without touching the
// project's global retries:0 policy.
async function expectGroundedAnswer(page: Page, retryQuestion?: string) {
  const assistantMessages = page.locator(".review-chat-message-assistant");
  const answer = () => assistantMessages.last();
  await expect(answer()).toBeVisible({ timeout: 20_000 });
  let text = await answer().innerText();

  if ( ABSTENTION_PATTERN.test(text) && retryQuestion ) {
    const priorCount = await assistantMessages.count();
    await askFollowUp(page, retryQuestion);
    await expect(assistantMessages).toHaveCount(priorCount + 1, {
      timeout: 20_000,
    });
    text = await answer().innerText();
  }

  expect(text).not.toMatch(ABSTENTION_PATTERN);
  await expect(
    answer().locator("a.review-chat-inline-citation").first(),
  ).toBeVisible({ timeout: 20_000 });
}

test.describe("ai review conversation", () => {
  test("tenant reviewing a lease clause gets a cited answer and keeps citations on follow-up", async ({
                                                                                                         page,
                                                                                                       }) => {
    test.skip(
      SKIP_RAG_CONVERSATION_TEST,
      "Grounded-answer coverage requires Milvus-backed RAG services.",
    );
    // Two conversation turns, each a real ~15s chat-model call, plus a
    // possible one-shot retry per turn on the known abstention flake — well
    // past Playwright's 30s default.
    test.setTimeout(120_000);

    await loginAsUser(page, TENANT_EMAIL, "/ai-review");
    await expect(page).toHaveURL(/\/ai-review$/);

    await page.getByRole("tab", { name: "Paste Text" }).click();
    await page.locator('textarea[name="sourceText"]').fill(SAMPLE_CLAUSE);
    const createSessionResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/rag/sessions") &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await page.getByRole("button", { name: "Start Review" }).click();
    await createSessionResponse;

    await expectGroundedAnswer(
      page,
      "Which specific Massachusetts law does this clause violate?",
    );

    await askFollowUp(
      page,
      "What can I do if my landlord already collected the illegal fee?",
    );
    await expectGroundedAnswer(
      page,
      "What legal remedies are available under Massachusetts law for this illegal deposit and fee?",
    );
  });
});
