import { expect, type Page, type Route, test } from "@playwright/test";

// The streamed answer UI, end to end in a real browser, without Milvus or a
// chat model: the RAG API is answered here with the server's SSE framing. The
// grounded-answer spec covers the real backend when RAG services are present.

const SESSION_ID = "e2e-streaming-session";
const CLAUSE =
  "Section 4. Security Deposit. Tenant shall pay a security deposit equal to two months' rent.";
const FIRST_SUMMARY = "This clause asks for more than the law allows up front.";
const FOLLOW_UP_SUMMARY = "You can ask for the excess back in writing.";

const citation = {
  citationId: "knowledge-ch03",
  sourceName: "ch03_security_deposits.pdf",
  sourceGroup: "chapters",
  sourceType: "handbook",
  chapterRef: "3",
  filePath: null,
  sourceUrl: "https://example.org/handbook/ch03",
  snippet: "A landlord may not ask for more than one month's rent as a deposit.",
};

const assistantMessage = (summary: string, bullets: string[]) => ({
  role: "assistant",
  content: [summary, ...bullets.map((text) => `• ${text}`)].join("\n"),
  summary,
  summaryCitationIndices: [0],
  bullets: bullets.map((text) => ({ text, citationIndices: [0] })),
  citations: [citation],
  createdAt: new Date().toISOString(),
});

const userMessage = (content: string) => ({
  role: "user",
  content,
  citations: [],
  createdAt: new Date().toISOString(),
});

type Frame = [event: string, data: unknown];

type FakeSession = { messages: unknown[] } & Record<string, unknown>;

type FollowUpScript = (context: { session: FakeSession; question: string }) => Frame[];

const sse = (frames: Frame[]) =>
  frames.map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join("");

const draftFrames = (summary: string, bullet: string): Frame[] => [
  ["status", { stage: "retrieving" }],
  ["status", { stage: "generating" }],
  ["delta", { part: "summary", text: summary.slice(0, 12) }],
  ["delta", { part: "summary", text: summary.slice(12) }],
  ["delta", { part: "bullet", index: 0, text: bullet }],
];

/**
 * A stand-in for the RAG API. Follow-up answers are scripted per test; each
 * entry receives the session so far and returns the SSE frames to send.
 */
async function fakeRagApi(page: Page, followUps: FollowUpScript[]) {
  const accepts: string[] = [];
  let session: FakeSession | null = null;

  const respond = (route: Route, status: number, contentType: string, body: string) =>
    route.fulfill({
      status,
      contentType,
      body,
      headers: {
        "Access-Control-Allow-Origin": route.request().headers().origin || "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    });

  await page.route((url) => url.pathname.startsWith("/api/rag/"), async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    if ( request.method() === "OPTIONS" ) {
      return respond(route, 204, "text/plain", "");
    }
    if ( request.method() === "GET" ) {
      const data = pathname === "/api/rag/sessions" ? (session ? [session] : []) : session;
      return respond(route, 200, "application/json", JSON.stringify({ data }));
    }

    accepts.push(request.headers().accept || "");
    if ( pathname === "/api/rag/sessions" ) {
      session = {
        _id: SESSION_ID,
        status: "ready",
        error: null,
        sourceKind: "text",
        sourceName: "pasted-text",
        sourceMimeType: "text/plain",
        sourceTextPreview: CLAUSE,
        sourceCharCount: CLAUSE.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          userMessage("Explain this clause in plain language."),
          assistantMessage(FIRST_SUMMARY, ["A deposit cannot exceed one month's rent."]),
        ],
      };
      return respond(route, 200, "text/event-stream", sse([
        ["status", { stage: "indexing" }],
        ...draftFrames(FIRST_SUMMARY, "A deposit cannot exceed"),
        ["done", { data: session }],
      ]));
    }

    const script = followUps.shift();
    const question = String(JSON.parse(request.postData() || "{}").message || "");
    const frames = script && session ? script({ session, question }) : [];
    return respond(route, 200, "text/event-stream", sse(frames));
  });

  return { accepts };
}

async function startGuestReview(page: Page) {
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Continue as guest" }).click();
  await page.goto("/ai-review");
  await page.getByRole("tab", { name: "Paste text" }).click();
  await page.locator('textarea[name="sourceText"]').fill(CLAUSE);
  await page.getByRole("button", { name: "Start review" }).click();
  await expect(page.locator(".review-chat-summary", { hasText: FIRST_SUMMARY })).toBeVisible();
}

const busyAnswers = (page: Page) => page.locator('.review-chat-message[aria-busy="true"]');
const assistantTurns = (page: Page) => page.locator(".review-chat-message-assistant");

test.describe("ai review streaming", () => {
  test("streamed answers end as finished, cited answers", async ({ page }) => {
    const api = await fakeRagApi(page, [
      ({ session, question }) => {
        session.messages.push(
          userMessage(question),
          assistantMessage(FOLLOW_UP_SUMMARY, ["Send a written demand for the excess."]),
        );
        return [...draftFrames(FOLLOW_UP_SUMMARY, "Send a written"), ["done", {
          data: { session, answer: FOLLOW_UP_SUMMARY, citations: [citation] },
        }]];
      },
    ]);

    await startGuestReview(page);
    await expect(busyAnswers(page)).toHaveCount(0);
    await expect(assistantTurns(page).first().locator("a.review-chat-inline-citation")).toBeVisible();

    await page.locator("#review-question").fill("What can I do about the extra deposit?");
    await page.getByRole("button", { name: "Ask" }).click();

    await expect(page.locator(".review-chat-summary", { hasText: FOLLOW_UP_SUMMARY })).toBeVisible();
    await expect(busyAnswers(page)).toHaveCount(0);
    await expect(assistantTurns(page)).toHaveCount(2);
    await expect(assistantTurns(page).last().locator("a.review-chat-inline-citation")).toBeVisible();
    await expect(page.locator("#review-question")).toHaveValue("");
    expect(api.accepts).toEqual(["text/event-stream", "text/event-stream"]);
  });

  test("an answer that fails partway drops its draft and gives the question back", async ({ page }) => {
    await fakeRagApi(page, [
      () => [
        ...draftFrames("This draft must not stay on screen.", "Nor this bullet"),
        ["error", { error: { code: "RAG_MESSAGE_FAILED", message: "Failed to answer question." } }],
      ],
    ]);

    await startGuestReview(page);
    await page.locator("#review-question").fill("Is the cleaning fee refundable?");
    await page.getByRole("button", { name: "Ask" }).click();

    await expect(page.getByText("Failed to answer question.").first()).toBeVisible();
    await expect(page.locator("#review-question")).toHaveValue("Is the cleaning fee refundable?");
    await expect(busyAnswers(page)).toHaveCount(0);
    await expect(assistantTurns(page)).toHaveCount(1);
    await expect(page.getByText("This draft must not stay on screen.")).toHaveCount(0);
  });

  test("a stream cut off before it finishes reports a network error and keeps nothing", async ({ page }) => {
    await fakeRagApi(page, [() => draftFrames("Half an answer that never ends.", "Half")]);

    await startGuestReview(page);
    await page.locator("#review-question").fill("Can they keep my deposit?");
    await page.getByRole("button", { name: "Ask" }).click();

    await expect(page.getByText("Network Error").first()).toBeVisible();
    await expect(page.getByText("Half an answer that never ends.")).toHaveCount(0);
    await expect(page.locator("#review-question")).toHaveValue("Can they keep my deposit?");
    await expect(busyAnswers(page)).toHaveCount(0);
    await expect(assistantTurns(page)).toHaveCount(1);
  });
});
