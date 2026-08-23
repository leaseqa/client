/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import ProfileHeader from "./ProfileHeader";
import type { RootState } from "@/app/store";

afterEach(cleanup);

type SessionUser = RootState["session"]["user"];

const AUTH_USER: SessionUser = {
  id: "user-1",
  name: "Marisol Ferreira-Whitcombe",
  email: "marisol.ferreira.whitcombe@student.northeastern.edu",
  role: "tenant",
  avatar: "/images/NEU.png",
  lawyerVerified: false,
};

const GUEST_USER: SessionUser = {
  id: "guest",
  name: "Guest",
  email: "guest@leaseqa.com",
  role: "tenant",
  avatar: "/images/NEU.png",
  lawyerVerified: false,
};

function identity(): HTMLElement {
  const block = document.querySelector<HTMLElement>(".profile-menu-identity");
  if (!block) {
    throw new Error("profile identity block was not rendered");
  }
  return block;
}

describe("ProfileHeader — authenticated", () => {
  test("shows the account name", () => {
    render(
      <ProfileHeader user={AUTH_USER} initials="MA" isAuthenticated />,
    );
    expect(
      identity().querySelector(".profile-menu-name")?.textContent,
    ).toBe("Marisol Ferreira-Whitcombe");
  });

  test("does not show the email address", () => {
    render(
      <ProfileHeader user={AUTH_USER} initials="MA" isAuthenticated />,
    );
    expect(screen.queryByText(AUTH_USER!.email)).toBeNull();
    expect(identity().textContent).not.toContain("@");
  });

  test("does not show a role or permission badge", () => {
    render(
      <ProfileHeader user={AUTH_USER} initials="MA" isAuthenticated />,
    );
    const text = identity().textContent || "";
    expect(text).not.toMatch(/tenant/i);
    expect(text).not.toMatch(/read-only/i);
    expect(identity().querySelector(".badge")).toBeNull();
  });

  test("keeps a long name on a single truncating line", () => {
    render(
      <ProfileHeader user={AUTH_USER} initials="MA" isAuthenticated />,
    );
    const name = identity().querySelector(".profile-menu-name");
    expect(name?.className).toContain("profile-menu-name");
    expect(identity().querySelector(".profile-menu-copy")).not.toBeNull();
  });

  test("renders initials in the menu avatar", () => {
    render(
      <ProfileHeader user={AUTH_USER} initials="MA" isAuthenticated />,
    );
    expect(
      identity().querySelector(".profile-menu-avatar")?.textContent,
    ).toContain("MA");
  });
});

describe("ProfileHeader — guest", () => {
  test("reduces the identity block to avatar plus Guest", () => {
    render(
      <ProfileHeader
        user={GUEST_USER}
        initials="GU"
        isAuthenticated={false}
        isGuest
      />,
    );
    expect(
      identity().querySelector(".profile-menu-name")?.textContent,
    ).toBe("Guest");
    expect(identity().textContent).not.toContain("@");
    expect(identity().querySelector(".badge")).toBeNull();
  });
});

describe("ProfileHeader — signed out", () => {
  test("explains the signed-out state without an identity name", () => {
    render(
      <ProfileHeader user={null} initials="?" isAuthenticated={false} />,
    );
    expect(screen.getByText("Not signed in")).toBeTruthy();
    expect(screen.getByText("Sign in to access more")).toBeTruthy();
  });
});
