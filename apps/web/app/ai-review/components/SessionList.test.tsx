/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import SessionList from "./SessionList";
import type { RagSession } from "../types";

afterEach(cleanup);

function session(overrides: Partial<RagSession> = {}): RagSession {
  return {
    _id: "s1",
    status: "ready",
    error: null,
    sourceKind: "text",
    sourceName: "Section 4. Security Deposit",
    sourceMimeType: null,
    sourceTextPreview: "Tenant shall pay a security deposit…",
    sourceCharCount: 120,
    messages: [],
    createdAt: "2026-08-18T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
    ...overrides,
  };
}

type Overrides = Partial<React.ComponentProps<typeof SessionList>>;

function renderList(overrides: Overrides = {}) {
  const onSelect = vi.fn();
  const onRetry = vi.fn();
  render(
    <SessionList
      sessions={[]}
      activeSessionId={null}
      loading={false}
      isGuest={false}
      onSelect={onSelect}
      onRetry={onRetry}
      {...overrides}
    />,
  );
  return { onSelect, onRetry };
}

// The component renders its list twice — a desktop <section> and a mobile
// <details> — with CSS hiding one per breakpoint. Both are in the DOM under
// jsdom, so every query is scoped to the desktop copy.
function panel() {
  const section = document.querySelector<HTMLElement>(
    'section[aria-labelledby="review-history-title"]',
  );
  if (!section) throw new Error("desktop history section did not render");
  return within(section);
}

function state(): HTMLElement | null {
  const section = document.querySelector<HTMLElement>(
    'section[aria-labelledby="review-history-title"]',
  );
  return section?.querySelector<HTMLElement>(".remote-data-state") || null;
}

describe("SessionList states", () => {
  test("announces loading without claiming the list is empty", () => {
    renderList({ loading: true });
    expect(state()?.dataset.state).toBe("loading");
    expect(panel().getByText("Loading reviews")).toBeTruthy();
    expect(panel().queryByText("No saved reviews yet")).toBeNull();
  });

  test("shows a failed read as an alert rather than as an empty list", () => {
    renderList({ error: "Failed to load reviews." });
    expect(state()?.dataset.state).toBe("error");
    expect(state()?.getAttribute("role")).toBe("alert");
    expect(panel().getByText("Failed to load reviews.")).toBeTruthy();
    expect(panel().queryByText("No saved reviews yet")).toBeNull();
  });

  test("keeps the neutral empty copy when nothing failed", () => {
    renderList({ sessions: [] });
    expect(state()?.dataset.state).toBe("empty");
    expect(panel().getByText("No saved reviews yet")).toBeTruthy();
    expect(panel().getByText("Your first source will appear here.")).toBeTruthy();
  });

  test("prefers loading over the empty state", () => {
    renderList({ sessions: [], loading: true });
    expect(state()?.dataset.state).toBe("loading");
  });

  test("prefers the error over the empty state", () => {
    renderList({ sessions: [], error: "Failed to load reviews." });
    expect(state()?.dataset.state).toBe("error");
  });
});

describe("SessionList retry", () => {
  test("offers a retry on failure and calls back", () => {
    const { onRetry } = renderList({ error: "Failed to load reviews." });
    fireEvent.click(panel().getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("omits the retry when no handler is supplied", () => {
    render(
      <SessionList
        sessions={[]}
        activeSessionId={null}
        loading={false}
        isGuest={false}
        error="Failed to load reviews."
        onSelect={() => {}}
      />,
    );
    expect(panel().queryByRole("button", { name: "Try again" })).toBeNull();
  });
});

describe("SessionList items", () => {
  test("renders one selectable row per saved review", () => {
    const { onSelect } = renderList({
      sessions: [
        session(),
        session({ _id: "s2", sourceName: "Section 9. Repairs" }),
      ],
    });
    expect(state()).toBeNull();
    expect(panel().getByText("Section 4. Security Deposit")).toBeTruthy();

    fireEvent.click(panel().getByText("Section 9. Repairs"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]._id).toBe("s2");
  });

  test("marks the active review for assistive technology", () => {
    renderList({
      sessions: [session(), session({ _id: "s2", sourceName: "Section 9" })],
      activeSessionId: "s2",
    });
    const active = panel().getByText("Section 9").closest("button");
    expect(active?.getAttribute("aria-current")).toBe("true");
  });

  test("tells a guest their history is only for this session", () => {
    renderList({ sessions: [session()], isGuest: true });
    expect(panel().getByText(/Temporary for this guest session/i)).toBeTruthy();
  });
});
