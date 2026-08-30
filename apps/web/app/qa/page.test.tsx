/** @vitest-environment jsdom */

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import QAPage from "./page";
import * as client from "./client";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
  useSearchParams: () => new URLSearchParams("scenario=repairs"),
}));

vi.mock("react-redux", () => ({
  useSelector: () => ({ status: "guest", user: null }),
}));

vi.mock("./client", () => ({
  fetchFolders: vi.fn(),
  fetchPosts: vi.fn(),
  createPost: vi.fn(),
  uploadPostAttachments: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(client.fetchFolders).mockResolvedValue({ data: [] } as never);
  vi.mocked(client.fetchPosts).mockResolvedValue({ data: [] } as never);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/** The page reads through TanStack Query, so it needs a client in scope. */
function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<QAPage/>, { wrapper });
}

describe("community feed states", () => {
  test("gives guests a login action that returns to the current community view", async () => {
    renderPage();

    const link = await screen.findByRole("link", { name: "Sign in to ask" });
    expect(link.getAttribute("href")).toBe(
      "/auth/login?next=%2Fqa%3Fscenario%3Drepairs",
    );
  });

  test("shows a retryable error instead of an empty feed when loading fails", async () => {
    vi.mocked(client.fetchFolders).mockRejectedValue(new Error("offline"));
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    renderPage();

    // RemoteDataState marks the error region with role="alert" and carries the
    // title as text rather than a heading, so assert on the region.
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain(
        "Couldn’t reach the server",
      );
    });
    expect(screen.getByRole("button", { name: "Retry" })).not.toBeNull();
    error.mockRestore();
  });
});
