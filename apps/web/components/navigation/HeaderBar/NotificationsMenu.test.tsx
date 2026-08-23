/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import NotificationsMenu, { type NotificationMenuItem } from "./NotificationsMenu";

afterEach(cleanup);

const LONG_TITLE =
  "Someone replied in your follow-up thread about whether the landlord may withhold the deposit for normal wear";

const ITEMS: NotificationMenuItem[] = [
  {
    _id: "activity-1",
    title: "New answer on your question",
    summary: "Security deposit deadline question",
    href: "/qa?post=1",
    createdAt: "2026-08-20T15:00:00.000Z",
  },
  {
    _id: "activity-2",
    title: LONG_TITLE,
    href: "/qa?post=2",
    createdAt: "2026-08-19T09:12:00.000Z",
  },
];

type Overrides = Partial<React.ComponentProps<typeof NotificationsMenu>>;

function renderMenu(overrides: Overrides = {}) {
  const onOpen = vi.fn();
  const onSelect = vi.fn();
  const utils = render(
    <NotificationsMenu
      items={[]}
      loading={false}
      error=""
      onOpen={onOpen}
      onSelect={onSelect}
      {...overrides}
    />,
  );
  return { onOpen, onSelect, ...utils };
}

function openMenu() {
  fireEvent.click(screen.getByLabelText("Open notifications"));
}

function menuPanel(): HTMLElement {
  const panel = document.querySelector<HTMLElement>(".dropdown-menu.notifications-menu");
  if (!panel) {
    throw new Error("notifications menu panel was not rendered");
  }
  return panel;
}

describe("NotificationsMenu trigger", () => {
  test("keeps the accessible trigger label and marks unread state", () => {
    renderMenu({ items: ITEMS });
    const trigger = screen.getByLabelText("Open notifications");
    expect(trigger.querySelector(".site-auth-chip-bell")).not.toBeNull();
    expect(trigger.querySelector(".has-unread")).not.toBeNull();
  });

  test("drops the unread marker when there is nothing unread", () => {
    renderMenu({ items: [] });
    const trigger = screen.getByLabelText("Open notifications");
    expect(trigger.querySelector(".site-auth-chip-bell")).not.toBeNull();
    expect(trigger.querySelector(".has-unread")).toBeNull();
  });

  test("loads notifications when the menu opens", () => {
    const { onOpen } = renderMenu();
    openMenu();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe("NotificationsMenu panel", () => {
  test("keeps the Notifications heading that end-to-end coverage matches on", () => {
    renderMenu({ items: ITEMS });
    openMenu();
    expect(screen.getByText("Notifications", { exact: true })).toBeTruthy();
  });

  test("does not constrain its own width with an inline style", () => {
    renderMenu({ items: ITEMS });
    openMenu();
    expect(menuPanel().style.minWidth).toBe("");
  });

  test("shows an unread count once there are items", () => {
    renderMenu({ items: ITEMS });
    openMenu();
    expect(menuPanel().querySelector(".notifications-menu-count")?.textContent).toBe(
      "2 new",
    );
  });

  test("omits the unread count when the list is empty", () => {
    renderMenu({ items: [] });
    openMenu();
    expect(menuPanel().querySelector(".notifications-menu-count")).toBeNull();
  });
});

describe("NotificationsMenu items", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-22T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("keeps title, summary, and date for each unread item", () => {
    renderMenu({ items: ITEMS });
    openMenu();

    expect(screen.getByText("New answer on your question")).toBeTruthy();
    expect(screen.getByText("Security deposit deadline question")).toBeTruthy();
    expect(screen.getByText("Aug 20")).toBeTruthy();
  });

  test("renders each item as a button carrying an unread marker", () => {
    renderMenu({ items: ITEMS });
    openMenu();

    const rows = menuPanel().querySelectorAll("button.notifications-menu-item");
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      expect(row.querySelector(".notifications-menu-dot")).not.toBeNull();
    });
  });

  test("clamps a long title instead of widening the panel", () => {
    renderMenu({ items: ITEMS });
    openMenu();

    const title = screen.getByText(LONG_TITLE);
    expect(title.className).toContain("notifications-menu-title");
  });

  test("renders no summary element when an item has none", () => {
    renderMenu({ items: ITEMS });
    openMenu();

    const rows = menuPanel().querySelectorAll(".notifications-menu-item");
    expect(rows[1].querySelector(".notifications-menu-summary")).toBeNull();
  });

  test("keeps the year when a notification is not from the current year", () => {
    renderMenu({
      items: [{ ...ITEMS[0], _id: "old", createdAt: "2025-01-04T10:00:00.000Z" }],
    });
    openMenu();
    expect(screen.getByText("Jan 4, 2025")).toBeTruthy();
  });

  test("falls back to the raw value for an unparseable date", () => {
    renderMenu({ items: [{ ...ITEMS[0], _id: "bad", createdAt: "not-a-date" }] });
    openMenu();
    expect(screen.getByText("not-a-date")).toBeTruthy();
  });

  test("reports the selected item to the caller", () => {
    const { onSelect } = renderMenu({ items: ITEMS });
    openMenu();

    fireEvent.click(screen.getByText("New answer on your question"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]._id).toBe("activity-1");
  });
});

describe("NotificationsMenu states", () => {
  test("stays distinguishable while loading", () => {
    renderMenu({ loading: true });
    openMenu();

    const state = menuPanel().querySelector(".notifications-menu-state");
    expect(state?.textContent).toContain("Loading");
    expect(state?.getAttribute("aria-live")).toBe("polite");
    expect(screen.queryByText("No new notifications")).toBeNull();
  });

  test("surfaces an error without pretending the list is empty", () => {
    renderMenu({ error: "Could not load notifications." });
    openMenu();

    expect(screen.getByText("Could not load notifications.")).toBeTruthy();
    expect(screen.queryByText("No new notifications")).toBeNull();
  });

  test("keeps the neutral empty state copy", () => {
    renderMenu({ items: [] });
    openMenu();

    expect(screen.getByText("No new notifications")).toBeTruthy();
    expect(screen.getByText("New activity will appear here.")).toBeTruthy();
  });

  test("prefers the loading state over the empty state", () => {
    renderMenu({ items: [], loading: true, error: "" });
    openMenu();
    expect(screen.queryByText("No new notifications")).toBeNull();
  });
});
