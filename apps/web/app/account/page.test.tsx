/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AccountPage from "./page";
import * as client from "./client";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const dispatch = vi.fn();
const signedInSession = {
  status: "authenticated",
  user: {
    id: "user-1",
    name: "Tenant",
    email: "tenant@example.com",
    role: "tenant",
    avatar: "",
    lawyerVerified: false,
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => dispatch,
  useSelector: (select: (state: unknown) => unknown) => select({ session: signedInSession }),
}));

vi.mock("./client", () => ({
  fetchActivity: vi.fn(),
  logout: vi.fn(),
  updateCurrentUser: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(client.fetchActivity).mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("profile", () => {
  test("saving sends only the name, which is all PATCH /users/me accepts", async () => {
    vi.mocked(client.updateCurrentUser).mockResolvedValue({
      data: { _id: "user-1", username: "Renamed" },
    } as never);
    render(<AccountPage/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Renamed" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(client.updateCurrentUser).toHaveBeenCalledWith({ username: "Renamed" });
    });
    // The email is shown, not editable: the API cannot change it.
    expect(screen.queryByLabelText("Email")).toBeNull();
    expect(screen.getAllByText("tenant@example.com").length).toBeGreaterThan(0);
  });
});
