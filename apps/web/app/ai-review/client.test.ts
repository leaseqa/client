import { beforeEach, describe, expect, it, vi } from "vitest";

const postEventStream = vi.fn(async () => ({ ok: true }));
const apiGet = vi.fn(async () => ({ data: [] }));
const apiDelete = vi.fn(async () => ({ data: null }));

vi.mock("@/app/lib/api/eventStream", () => ({ postEventStream }));
vi.mock("@/app/lib/api/client", () => ({
  apiGet,
  apiDelete,
  unwrapData: (r: any) => r?.data ?? r,
}));

const { createSession, sendMessage } = await import("./client");

type StreamCall = [string, unknown, { timeout?: number; onEvent?: unknown }];

// Both calls wait on the chat model and stream their progress. Indexing a
// pasted clause measured 18-21s in production before the first answer even
// starts, so each keeps a ceiling well past the shared 20s default.
describe("ai-review client streams the two model calls", () => {
  beforeEach(() => {
    postEventStream.mockClear();
  });

  it("streams session creation with its own long ceiling", async () => {
    const form = new FormData();
    const onEvent = vi.fn();
    await createSession(form, onEvent);

    const [path, body, options] = postEventStream.mock.calls[0] as unknown as StreamCall;
    expect(path).toBe("/rag/sessions");
    expect(body).toBe(form);
    expect(options.onEvent).toBe(onEvent);
    expect(options.timeout).toBeGreaterThan(20_000);
  });

  it("streams answer generation with its own long ceiling", async () => {
    const onEvent = vi.fn();
    await sendMessage("session-1", "Can the landlord keep my deposit?", onEvent);

    const [path, body, options] = postEventStream.mock.calls[0] as unknown as StreamCall;
    expect(path).toBe("/rag/sessions/session-1/messages");
    expect(body).toEqual({ message: "Can the landlord keep my deposit?" });
    expect(options.onEvent).toBe(onEvent);
    expect(options.timeout).toBeGreaterThan(20_000);
  });
});
