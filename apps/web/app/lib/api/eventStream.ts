import {
  apiUrl,
  errorFromResponse,
  invalidResponseError,
  networkError,
  timeoutError,
  toApiError,
  unwrapData,
} from "./client";
import { ApiEnvelope, ApiError } from "./types";

export type ServerEvent = {
  event: string;
  data: unknown;
};

export type ServerEventListener = (event: ServerEvent) => void;

export type EventStreamOptions = {
  /** Every event before the final one, in arrival order. */
  onEvent?: ServerEventListener;
  /** Ceiling for the whole exchange, first byte to final event. */
  timeout: number;
  fetchFn?: typeof fetch;
};

/**
 * Split a buffer into complete SSE events. Returns the events and whatever is
 * left over after the last blank line, which belongs to an event still on its
 * way. Comment lines (": keep-alive") are dropped.
 */
export function parseEventBlocks(buffer: string): {
  events: ServerEvent[];
  rest: string;
} {
  // A chunk can end between the \r and \n of one line break. Hold a trailing
  // \r back so it is not read as a line break of its own, which would make
  // the next chunk's \n a blank line and split the event in two.
  const heldCR = buffer.endsWith("\r") ? "\r" : "";
  const blocks = buffer
    .slice(0, buffer.length - heldCR.length)
    .replace(/\r\n?/g, "\n")
    .split("\n\n");
  const rest = (blocks.pop() ?? "") + heldCR;
  const events: ServerEvent[] = [];
  for ( const block of blocks ) {
    let event = "message";
    const dataLines: string[] = [];
    for ( const line of block.split("\n") ) {
      if ( !line || line.startsWith(":") ) {
        continue;
      }
      const separator = line.indexOf(":");
      const field = separator === -1 ? line : line.slice(0, separator);
      const value =
        separator === -1 ? "" : line.slice(separator + 1).replace(/^ /, "");
      if ( field === "event" ) {
        event = value;
      } else if ( field === "data" ) {
        dataLines.push(value);
      }
    }
    if ( dataLines.length > 0 ) {
      events.push({ event, data: JSON.parse(dataLines.join("\n")) });
    }
  }
  return { events, rest };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * POST to an endpoint that can stream its answer as server-sent events, and
 * resolve with the payload of the final `done` event, which is the same `data`
 * the JSON response carries. Progress events reach onEvent as they arrive. An
 * `error` event rejects with an ApiError, as does any failure the axios client
 * would report, mapped the same way: a non-2xx status, a network error or a
 * timeout.
 *
 * A server that answers with plain JSON (one deployed before streaming, during
 * a rollout) counts as a stream with no progress: its data is the result.
 */
export async function postEventStream<T>(
  path: string,
  body: FormData | Record<string, unknown>,
  { onEvent, timeout, fetchFn = fetch }: EventStreamOptions,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  let finished = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  const toTransportError = (error: unknown) => {
    if ( error instanceof ApiError ) {
      return error;
    }
    if ( error instanceof SyntaxError ) {
      return invalidResponseError();
    }
    if ( timedOut ) {
      return timeoutError();
    }
    // fetch and body reads fail with a TypeError when the connection does.
    if ( error instanceof TypeError ) {
      return networkError();
    }
    // Anything else (a listener that threw, say) is reported as axios would.
    return toApiError(error);
  };

  try {
    const isForm = body instanceof FormData;
    const response = await fetchFn(apiUrl(path), {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "text/event-stream",
        ...(isForm ? {} : { "Content-Type": "application/json" }),
      },
      body: isForm ? body : JSON.stringify(body),
      signal: controller.signal,
    });

    if ( !response.ok ) {
      throw errorFromResponse(
        response.status,
        await readJson(response),
        `Request failed with status code ${response.status}`,
      );
    }
    if ( !response.headers.get("content-type")?.includes("text/event-stream") ) {
      return unwrapData<T>(await response.json());
    }
    if ( !response.body ) {
      throw networkError();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for ( ;; ) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      // An event is complete only at its blank line; one cut off by the end
      // of the stream is discarded, as the SSE spec requires.
      const parsed = parseEventBlocks(buffer);
      buffer = parsed.rest;
      for ( const serverEvent of parsed.events ) {
        // The server closes the stream right after either final event. Leave
        // that to it: cancelling here would cut the response off mid-close.
        if ( serverEvent.event === "done" ) {
          finished = true;
          return unwrapData<T>(serverEvent.data as ApiEnvelope<T>);
        }
        if ( serverEvent.event === "error" ) {
          finished = true;
          // The error body plus the status a JSON response would have had.
          const payload = serverEvent.data as ApiEnvelope<unknown> & { status?: number };
          throw errorFromResponse(payload?.status ?? 0, payload, "Request failed");
        }
        onEvent?.(serverEvent);
      }
      if ( done ) {
        // Cut off before a final event: the answer never arrived.
        throw networkError();
      }
    }
  } catch ( error ) {
    const failure = toTransportError(error);
    // Stopped for any other reason, the request may still be open: end it.
    if ( !finished ) {
      controller.abort();
    }
    throw failure;
  } finally {
    clearTimeout(timer);
  }
}
