/** @vitest-environment jsdom */

import React from "react";
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

describe("community feed states", () => {
  test("gives guests a login action that returns to the current community view", async () => {
    render(<QAPage/>);

    const link = await screen.findByRole("link", { name: "Sign In to Ask" });
    expect(link.getAttribute("href")).toBe(
      "/auth/login?next=%2Fqa%3Fscenario%3Drepairs",
    );
  });

  test("shows a retryable error instead of an empty feed when loading fails", async () => {
    vi.mocked(client.fetchFolders).mockRejectedValue(new Error("offline"));
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<QAPage/>);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Questions Could Not Load" }),
      ).not.toBeNull();
    });
    expect(screen.getByRole("button", { name: "Try Again" })).not.toBeNull();
    error.mockRestore();
  });
});
