/** @vitest-environment jsdom */

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RagSession } from "../types";
import { useRagConversation } from "./useRagConversation";
import { useRagSession } from "./useRagSession";
import { ragKeys } from "./ragKeys";

const fetchSessionById = vi.fn();
const sendMessage = vi.fn();

vi.mock("../client", () => ({
  fetchSessionById: (...args: unknown[]) => fetchSessionById(...args),
  sendMessage: (...args: unknown[]) => sendMessage(...args),
}));

function makeSession(overrides: Partial<RagSession> = {}): RagSession {
  return {
    _id: "session-1",
    status: "ready",
    error: null,
    sourceKind: "text",
    sourceName: "pasted-text",
    sourceMimeType: "text/plain",
    sourceTextPreview: "The landlord must return the deposit.",
    sourceCharCount: 40,
    createdAt: "2026-08-19T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z",
    messages: [],
    ...overrides,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe("useRagSession polling", () => {
  afterEach(() => {
    fetchSessionById.mockReset();
    sendMessage.mockReset();
  });

  it("polls while indexing and stops on ready", async () => {
    fetchSessionById
      .mockResolvedValueOnce(makeSession({ status: "indexing" }))
      .mockResolvedValueOnce(makeSession({ status: "ready" }));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRagSession("session-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.session?.status).toBe("indexing");
    });
    expect(fetchSessionById).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current.session?.status).toBe("ready");
    }, { timeout: 4000 });

    const callsAfterReady = fetchSessionById.mock.calls.length;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    });
    expect(fetchSessionById.mock.calls.length).toBe(callsAfterReady);
  });

  it("stops polling on failed and cancels in-flight work on unmount", async () => {
    fetchSessionById.mockImplementation((_id: string, signal?: AbortSignal) => {
      return new Promise((resolve, reject) => {
        if ( !signal ) {
          resolve(makeSession({ status: "failed", error: "index failed" }));
          return;
        }
        const onAbort = () => {
          reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        };
        if ( signal.aborted ) {
          onAbort();
          return;
        }
        signal.addEventListener("abort", onAbort);
      });
    });

    const { wrapper } = createWrapper();
    const { unmount } = renderHook(() => useRagSession("session-1"), {
      wrapper,
    });

    await waitFor(() => {
      expect(fetchSessionById).toHaveBeenCalled();
    });

    const signal = fetchSessionById.mock.calls[0]?.[1] as AbortSignal | undefined;
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});

describe("useRagConversation optimistic messages", () => {
  afterEach(() => {
    fetchSessionById.mockReset();
    sendMessage.mockReset();
  });

  it("replaces an optimistic user message with server history without duplication", async () => {
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(
      ragKeys.session("session-1"),
      makeSession({ status: "ready" }),
    );

    sendMessage.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
      return {
        session: makeSession({
          messages: [
            {
              role: "user",
              content: "Is the late fee legal?",
              citations: [],
              createdAt: "2026-08-19T00:00:01.000Z",
            },
            {
              role: "assistant",
              content: "The handbook caps late fees.",
              citations: [],
              createdAt: "2026-08-19T00:00:02.000Z",
            },
          ],
        }),
        answer: "The handbook caps late fees.",
        citations: [],
      };
    });

    const { result } = renderHook(() => useRagConversation("session-1"), {
      wrapper,
    });

    act(() => {
      result.current.send("Is the late fee legal?");
    });

    await waitFor(() => {
      const userMessages = (queryClient.getQueryData<RagSession>(
        ragKeys.session("session-1"),
      )?.messages || []).filter((message) => message.content === "Is the late fee legal?");
      expect(userMessages).toHaveLength(1);
    });

    await waitFor(() => {
      const session = queryClient.getQueryData<RagSession>(ragKeys.session("session-1"));
      const userMessages = (session?.messages || []).filter(
        (message) => message.role === "user" && message.content === "Is the late fee legal?",
      );
      expect(userMessages).toHaveLength(1);
      expect(session?.messages.some((message) => message.role === "assistant")).toBe(true);
    });
  });
});
