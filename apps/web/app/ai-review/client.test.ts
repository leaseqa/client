import { beforeEach, describe, expect, it, vi } from "vitest";

const apiPost = vi.fn(async () => ({ data: { ok: true } }));
const apiGet = vi.fn(async () => ({ data: [] }));
const apiDelete = vi.fn(async () => ({ data: null }));

vi.mock("@/app/lib/api/client", () => ({
  apiPost,
  apiGet,
  apiDelete,
  unwrapData: (r: any) => r?.data ?? r,
}));

const { createSession, sendMessage } = await import("./client");

// Indexing a pasted clause measured 18-21s in production, and generating the
// first grounded answer is the same order of magnitude. Both sat on the shared
// 20s default, so the browser aborted them and the page showed a bare "Error".
// These two assert the long timeout stays attached to the two slow calls.
describe("ai-review client timeouts", () => {
  beforeEach(() => {
    apiPost.mockClear();
  });

  it("gives session creation longer than the shared default", async () => {
    await createSession(new FormData());
    const [, , options] = apiPost.mock.calls[0] as unknown as [string, unknown, { timeout?: number }];
    expect(options?.timeout).toBeGreaterThan(20_000);
  });

  it("gives answer generation longer than the shared default", async () => {
    await sendMessage("session-1", "Can the landlord keep my deposit?");
    const [, , options] = apiPost.mock.calls[0] as unknown as [string, unknown, { timeout?: number }];
    expect(options?.timeout).toBeGreaterThan(20_000);
  });
});
