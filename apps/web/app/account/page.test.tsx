/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ApiError } from "@/app/lib/api/client";
import { setSession } from "@/app/store";
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
    hasPassword: true,
  },
};
let session = signedInSession;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => dispatch,
  useSelector: (select: (state: unknown) => unknown) => select({ session }),
}));

vi.mock("./client", () => ({
  changePassword: vi.fn(),
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
  session = signedInSession;
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

function submitPasswordForm(values: { current: string; next: string; confirm: string }) {
  fireEvent.change(screen.getByLabelText("Current password"), { target: { value: values.current } });
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: values.next } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: values.confirm } });
  fireEvent.click(screen.getByRole("button", { name: "Change password" }));
}

describe("password", () => {
  test("a mismatched confirmation is caught before any request", () => {
    render(<AccountPage/>);
    submitPasswordForm({ current: "old-secret", next: "new-secret", confirm: "new-secret-typo" });

    expect(screen.getByRole("alert").textContent).toBe("The new passwords do not match.");
    expect(client.changePassword).not.toHaveBeenCalled();
  });

  test("a change sends both passwords, stores the returned user and clears the form", async () => {
    const updatedUser = {
      _id: "user-1",
      username: "Tenant",
      email: "tenant@example.com",
      role: "tenant",
      hasPassword: true,
    };
    vi.mocked(client.changePassword).mockResolvedValue(updatedUser);
    render(<AccountPage/>);
    submitPasswordForm({ current: "old-secret", next: "new-secret", confirm: "new-secret" });

    await screen.findByText("Password changed.");
    expect(client.changePassword).toHaveBeenCalledWith({
      currentPassword: "old-secret",
      newPassword: "new-secret",
    });
    expect(dispatch).toHaveBeenCalledWith(setSession(updatedUser));
    expect((screen.getByLabelText("Current password") as HTMLInputElement).value).toBe("");
  });

  test("the server's reason is shown when it refuses the change", async () => {
    vi.mocked(client.changePassword).mockRejectedValue(
      new ApiError("Current password is incorrect.", 400, "INVALID_CURRENT_PASSWORD"),
    );
    render(<AccountPage/>);
    submitPasswordForm({ current: "wrong-secret", next: "new-secret", confirm: "new-secret" });

    expect((await screen.findByRole("alert")).textContent).toBe("Current password is incorrect.");
    expect(dispatch).not.toHaveBeenCalled();
  });

  test("an account without a password gets a note in place of the form", () => {
    session = { ...signedInSession, user: { ...signedInSession.user, hasPassword: false } };
    render(<AccountPage/>);

    expect(screen.getByText("You sign in with Google, so this account has no password to change.")).toBeTruthy();
    expect(screen.queryByLabelText("Current password")).toBeNull();
  });
});
