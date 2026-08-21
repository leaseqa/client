// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import store, { signOut } from "@/app/store";
import SessionLoader from "./SessionLoader";
import * as client from "./client";

vi.mock("./client", () => ({
  fetchSession: vi.fn(),
}));

const storage = (() => {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  } satisfies Storage;
})();

vi.stubGlobal("localStorage", storage);

function renderLoader() {
  return render(
    <Provider store={store}>
      <SessionLoader>
        <main>Public page</main>
      </SessionLoader>
    </Provider>,
  );
}

describe("SessionLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    store.dispatch(signOut());
  });

  afterEach(() => {
    cleanup();
  });

  test("renders the public shell while session restoration is pending", () => {
    vi.mocked(client.fetchSession).mockReturnValue(new Promise(() => {}));

    renderLoader();

    expect(screen.getByText("Public page")).toBeTruthy();
  });

  test("restores an authenticated session", async () => {
    vi.mocked(client.fetchSession).mockResolvedValue({
      data: {
        _id: "user-1",
        username: "Alex",
        email: "alex@example.com",
        role: "tenant",
      },
    });

    renderLoader();

    await waitFor(() => {
      expect(store.getState().session.status).toBe("authenticated");
    });
    expect(store.getState().session.user?.name).toBe("Alex");
  });

  test("restores the stored guest session when the request fails", async () => {
    localStorage.setItem("guest_session", "true");
    vi.mocked(client.fetchSession).mockRejectedValue(new Error("offline"));

    renderLoader();

    await waitFor(() => {
      expect(store.getState().session.status).toBe("guest");
    });
  });

  test("marks the session unauthenticated when restoration fails", async () => {
    vi.mocked(client.fetchSession).mockRejectedValue(new Error("signed out"));

    renderLoader();

    await waitFor(() => {
      expect(store.getState().session.status).toBe("unauthenticated");
    });
  });
});
