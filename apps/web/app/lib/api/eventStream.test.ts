import { describe, expect, it } from "vitest";

import { parseEventBlocks, postEventStream, ServerEvent } from "./eventStream";
import { ApiError } from "./types";

const encoder = new TextEncoder();
const TIMEOUT = 5_000;

/** A Response whose body arrives in the given pieces, one per read. */
function streamedResponse(pieces: string[], init: ResponseInit = {}) {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for ( const piece of pieces ) {
        controller.enqueue(encoder.encode(piece));
      }
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/event-stream; charset=utf-8" },
    ...init,
  });
}

function fetchReturning(response: Response) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response;
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}

const ask = (fetchFn: typeof fetch, onEvent?: (event: ServerEvent) => void) =>
  postEventStream("/rag/sessions/s1/messages", { message: "q" }, { fetchFn, onEvent, timeout: TIMEOUT });

describe("parseEventBlocks", () => {
  it("parses complete events and keeps the unfinished tail", () => {
    const { events, rest } = parseEventBlocks(
      'event: status\ndata: {"stage":"retrieving"}\n\n: keep-alive\n\nevent: delta\ndata: {"part":"sum',
    );
    expect(events).toEqual([{ event: "status", data: { stage: "retrieving" } }]);
    expect(rest).toBe('event: delta\ndata: {"part":"sum');
  });

  it("accepts CRLF framing, joins data lines and defaults the event name", () => {
    const { events } = parseEventBlocks('data: {"a":\r\ndata: 1}\r\n\r\n');
    expect(events).toEqual([{ event: "message", data: { a: 1 } }]);
  });

  it("keeps an event whole when a chunk ends between the \\r and \\n of a line break", () => {
    const first = parseEventBlocks("event: done\r");
    expect(first.events).toEqual([]);
    const second = parseEventBlocks(`${first.rest}\ndata: {"data":1}\r\n\r\n`);
    expect(second.events).toEqual([{ event: "done", data: { data: 1 } }]);
  });
});

describe("postEventStream", () => {
  it("asks for a stream, reports progress in order and resolves with the done payload", async () => {
    const seen: ServerEvent[] = [];
    const { fetchFn, calls } = fetchReturning(
      streamedResponse([
        'event: status\ndata: {"stage":"retrieving"}\n\n',
        "event: delta\ndata: ",
        '{"part":"summary","text":"The dep"}\n\n: keep-alive\n\n',
        'event: delta\ndata: {"part":"summary","text":"osit"}\n\nevent: done\ndata: {"data":{"answer":"ok"}}\n\n',
      ]),
    );

    const result = await postEventStream<{ answer: string }>(
      "/rag/sessions/s1/messages",
      { message: "Is this legal?" },
      { fetchFn, onEvent: (event) => seen.push(event), timeout: TIMEOUT },
    );

    expect(result).toEqual({ answer: "ok" });
    expect(seen).toEqual([
      { event: "status", data: { stage: "retrieving" } },
      { event: "delta", data: { part: "summary", text: "The dep" } },
      { event: "delta", data: { part: "summary", text: "osit" } },
    ]);
    expect(calls[0].url).toBe("/api/rag/sessions/s1/messages");
    expect(calls[0].init.method).toBe("POST");
    expect(calls[0].init.credentials).toBe("include");
    expect(calls[0].init.headers).toEqual({
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    });
    expect(calls[0].init.body).toBe(JSON.stringify({ message: "Is this legal?" }));
  });

  it("leaves closing the stream to the server after the final event", async () => {
    const { fetchFn, calls } = fetchReturning(
      streamedResponse(['event: done\ndata: {"data":{"answer":"ok"}}\n\n']),
    );

    await ask(fetchFn);

    expect(calls[0].init.signal?.aborted).toBe(false);
  });

  it("ends the request itself when it stops reading early", async () => {
    const { fetchFn, calls } = fetchReturning(
      streamedResponse(["event: status\ndata: {not json}\n\n", 'event: done\ndata: {"data":1}\n\n']),
    );

    await expect(ask(fetchFn)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
    expect(calls[0].init.signal?.aborted).toBe(true);
  });

  it("sends FormData untouched so the browser sets the multipart boundary", async () => {
    const form = new FormData();
    form.set("sourceText", "Clause");
    const { fetchFn, calls } = fetchReturning(
      streamedResponse(['event: done\ndata: {"data":{"_id":"s1"}}\n\n']),
    );

    await expect(
      postEventStream("/rag/sessions", form, { fetchFn, timeout: TIMEOUT }),
    ).resolves.toEqual({ _id: "s1" });
    expect(calls[0].init.body).toBe(form);
    expect(calls[0].init.headers).toEqual({ Accept: "text/event-stream" });
  });

  it("rejects with the code, message and status the JSON response would have had", async () => {
    const { fetchFn } = fetchReturning(
      streamedResponse([
        'event: status\ndata: {"stage":"generating"}\n\n',
        'event: error\ndata: {"error":{"code":"RAG_MESSAGE_FAILED","message":"Failed to answer question."},"status":500}\n\n',
      ]),
    );

    const failure = await ask(fetchFn).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({
      status: 500,
      code: "RAG_MESSAGE_FAILED",
      message: "Failed to answer question.",
    });
  });

  it("treats a stream that ends without a final event as a network failure", async () => {
    const { fetchFn } = fetchReturning(
      streamedResponse(['event: delta\ndata: {"part":"summary","text":"Half"}\n\nevent: done\ndata: {"da']),
    );

    await expect(ask(fetchFn)).rejects.toMatchObject({ code: "NETWORK", message: "Network Error" });
  });

  it("maps an HTTP error the way the axios client does, body or no body", async () => {
    const withBody = fetchReturning(
      new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Chat session not found" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await expect(ask(withBody.fetchFn)).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "Chat session not found",
    });

    const bare = fetchReturning(new Response("Bad gateway", { status: 502 }));
    await expect(ask(bare.fetchFn)).rejects.toMatchObject({
      status: 502,
      code: "HTTP_502",
      message: "Request failed with status code 502",
    });
  });

  it("accepts a plain JSON answer from a server that cannot stream yet", async () => {
    const seen: ServerEvent[] = [];
    const { fetchFn } = fetchReturning(
      new Response(JSON.stringify({ data: { answer: "from json" } }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }),
    );

    await expect(ask(fetchFn, (event) => seen.push(event))).resolves.toEqual({ answer: "from json" });
    expect(seen).toEqual([]);
  });

  it("gives up with a timeout error when the whole exchange runs past its ceiling", async () => {
    const fetchFn = ((_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      })) as unknown as typeof fetch;

    await expect(
      postEventStream("/rag/sessions/s1/messages", { message: "q" }, { fetchFn, timeout: 10 }),
    ).rejects.toMatchObject({ code: "TIMEOUT", message: "Request timed out" });
  });

  it("reports a listener that throws the way axios reports an unknown error, and ends the request", async () => {
    const { fetchFn, calls } = fetchReturning(
      streamedResponse(['event: status\ndata: {"stage":"retrieving"}\n\nevent: done\ndata: {"data":1}\n\n']),
    );

    await expect(
      ask(fetchFn, () => {
        throw new Error("listener broke");
      }),
    ).rejects.toMatchObject({ code: "UNKNOWN", message: "listener broke" });
    expect(calls[0].init.signal?.aborted).toBe(true);
  });

  it("reports a dropped connection as the same network error axios gives", async () => {
    const offline = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;

    await expect(ask(offline)).rejects.toMatchObject({ code: "NETWORK", message: "Network Error", status: 0 });
  });
});
