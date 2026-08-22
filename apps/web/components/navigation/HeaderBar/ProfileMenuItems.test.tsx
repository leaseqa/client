/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import ProfileMenuItems from "./ProfileMenuItems";

afterEach(cleanup);

type Overrides = Partial<React.ComponentProps<typeof ProfileMenuItems>>;

function renderItems(overrides: Overrides = {}) {
  const navigate = vi.fn();
  const onSignOut = vi.fn();
  render(
    <ProfileMenuItems
      isAuthenticated={false}
      navigate={navigate}
      onSignOut={onSignOut}
      {...overrides}
    />,
  );
  return { navigate, onSignOut };
}

function labels() {
  return Array.from(document.querySelectorAll("button")).map((node) =>
    node.textContent?.trim(),
  );
}

describe("ProfileMenuItems — signed out", () => {
  test("offers sign in and account creation", () => {
    renderItems();
    expect(labels()).toEqual(["Sign In", "Create Account"]);
  });

  test("routes to the login page", () => {
    const { navigate } = renderItems();
    fireEvent.click(screen.getByText("Sign In"));
    expect(navigate).toHaveBeenCalledWith("/auth/login");
  });
});

describe("ProfileMenuItems — guest", () => {
  test("keeps the approved guest actions in order", () => {
    renderItems({ isGuest: true });
    expect(labels()).toEqual([
      "View Profile",
      "Sign In for Full Access",
      "Create Account",
    ]);
  });

  test("separates the profile action from the upgrade actions", () => {
    renderItems({ isGuest: true });
    expect(document.querySelectorAll(".profile-menu-separator")).toHaveLength(1);
  });

  test("routes to the account page", () => {
    const { navigate } = renderItems({ isGuest: true });
    fireEvent.click(screen.getByText("View Profile"));
    expect(navigate).toHaveBeenCalledWith("/account");
  });
});

describe("ProfileMenuItems — authenticated", () => {
  test("offers account navigation and sign out", () => {
    renderItems({ isAuthenticated: true });
    expect(labels()).toEqual(["Go to Account", "Sign Out"]);
  });

  test("styles sign out with the warm accent rather than bootstrap danger", () => {
    renderItems({ isAuthenticated: true });
    const signOut = screen.getByText("Sign Out");
    expect(signOut.className).toContain("profile-menu-item-warm");
    expect(signOut.className).not.toContain("text-danger");
  });

  test("signs out through the caller", () => {
    const { onSignOut } = renderItems({ isAuthenticated: true });
    fireEvent.click(screen.getByText("Sign Out"));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});

describe("ProfileMenuItems — shared", () => {
  test("renders every action as a menu row button", () => {
    renderItems({ isGuest: true });
    document.querySelectorAll("button").forEach((node) => {
      expect(node.className).toContain("profile-menu-item");
    });
  });
});
