/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import HeaderBar from "./HeaderBar";
import * as client from "@/app/account/client";

const session = vi.hoisted(() => ({
  current: {
    status: "authenticated",
    user: { id: "u1", name: "Demo Tenant", email: "tenant@leaseqa.dev", role: "tenant" },
  } as { status: string; user: unknown },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("react-redux", () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector({ session: session.current }),
  useDispatch: () => vi.fn(),
}));

vi.mock("@/app/account/client", () => ({
  fetchNotifications: vi.fn(),
  markNotificationsRead: vi.fn(),
  logout: vi.fn(),
}));

// react-bootstrap's Offcanvas asks for media queries, which jsdom lacks.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

beforeEach(() => {
  vi.mocked(client.fetchNotifications).mockResolvedValue([
    { _id: "n1", type: "answer_received", title: "New answer", createdAt: "2026-10-01T00:00:00.000Z" },
  ]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("HeaderBar", () => {
  test("names the mobile menu toggle by what it does", () => {
    render(<HeaderBar/>);
    // react-bootstrap writes its own aria-label after spreading props, so a
    // passed aria-label used to be replaced by "Toggle navigation".
    expect(screen.getByRole("button", { name: "Open navigation" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Toggle navigation" })).toBeNull();
  });

  test("shows a signed-in renter's initials, first and last name", () => {
    render(<HeaderBar/>);
    expect(screen.getByRole("button", { name: "Open profile menu" }).textContent).toBe("DT");
  });

  test("loads notifications for a signed-in renter before the menu is opened", async () => {
    render(<HeaderBar/>);
    await waitFor(() => expect(client.fetchNotifications).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      const bell = screen.getByRole("button", { name: "Open notifications" });
      expect(bell.querySelector(".has-unread")).not.toBeNull();
    });
  });

  test("does not ask for notifications without a signed-in renter", async () => {
    session.current = { status: "guest", user: { id: "guest", name: "Guest", email: "", role: "tenant" } };
    render(<HeaderBar/>);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(client.fetchNotifications).not.toHaveBeenCalled();
    session.current = {
      status: "authenticated",
      user: { id: "u1", name: "Demo Tenant", email: "tenant@leaseqa.dev", role: "tenant" },
    };
  });
});
