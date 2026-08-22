/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import RemoteDataState, {
  type RemoteDataStateKind,
} from "./RemoteDataState";

afterEach(cleanup);

function panel(): HTMLElement {
  const el = document.querySelector<HTMLElement>(".remote-data-state");
  if (!el) throw new Error("RemoteDataState did not render");
  return el;
}

const KINDS: RemoteDataStateKind[] = ["loading", "empty", "error", "permission"];

describe("RemoteDataState variants", () => {
  test.each(KINDS)("renders the %s variant with its own marker", (kind) => {
    render(<RemoteDataState kind={kind} title={`${kind} title`}/>);
    expect(panel().dataset.state).toBe(kind);
    expect(panel().className).toContain(`remote-data-state-${kind}`);
    expect(screen.getByText(`${kind} title`)).toBeTruthy();
  });

  test("shows a spinner only while loading", () => {
    render(<RemoteDataState kind="loading" title="Loading reviews"/>);
    expect(panel().querySelector(".remote-data-state-spinner")).not.toBeNull();
    cleanup();
    render(<RemoteDataState kind="empty" title="No reviews yet"/>);
    expect(panel().querySelector(".remote-data-state-spinner")).toBeNull();
  });

  test("renders an optional description", () => {
    render(
      <RemoteDataState
        kind="empty"
        title="No saved reviews yet"
        description="Your first source will appear here."
      />,
    );
    expect(screen.getByText("Your first source will appear here.")).toBeTruthy();
  });

  test("omits the description element when none is given", () => {
    render(<RemoteDataState kind="empty" title="No saved reviews yet"/>);
    expect(panel().querySelector(".remote-data-state-description")).toBeNull();
  });

  test("supports a compact variant for sidebars", () => {
    render(<RemoteDataState kind="empty" title="Nothing here" compact/>);
    expect(panel().className).toContain("remote-data-state-compact");
  });

  test("merges a caller class without dropping its own", () => {
    render(
      <RemoteDataState kind="empty" title="Nothing here" className="history-slot"/>,
    );
    expect(panel().className).toContain("history-slot");
    expect(panel().className).toContain("remote-data-state");
  });
});

describe("RemoteDataState accessibility", () => {
  test("announces loading politely and marks itself busy", () => {
    render(<RemoteDataState kind="loading" title="Loading reviews"/>);
    expect(panel().getAttribute("role")).toBe("status");
    expect(panel().getAttribute("aria-live")).toBe("polite");
    expect(panel().getAttribute("aria-busy")).toBe("true");
  });

  test("makes an error perceivable as an alert", () => {
    render(<RemoteDataState kind="error" title="Could not load reviews"/>);
    expect(panel().getAttribute("role")).toBe("alert");
    expect(panel().getAttribute("aria-busy")).toBeNull();
  });

  test("treats a permission block as an alert too", () => {
    render(<RemoteDataState kind="permission" title="Sign in to see this"/>);
    expect(panel().getAttribute("role")).toBe("alert");
  });

  test("leaves an empty result silent rather than announcing it", () => {
    render(<RemoteDataState kind="empty" title="No saved reviews yet"/>);
    expect(panel().getAttribute("role")).toBeNull();
    expect(panel().getAttribute("aria-live")).toBeNull();
  });
});

describe("RemoteDataState action", () => {
  test("renders no action button by default", () => {
    render(<RemoteDataState kind="error" title="Could not load reviews"/>);
    expect(panel().querySelector(".remote-data-state-action")).toBeNull();
  });

  test("invokes the retry callback", () => {
    const onClick = vi.fn();
    render(
      <RemoteDataState
        kind="error"
        title="Could not load reviews"
        action={{ label: "Try again", onClick }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("exposes the action as a real button", () => {
    render(
      <RemoteDataState
        kind="error"
        title="Could not load reviews"
        action={{ label: "Try again", onClick: () => {} }}
      />,
    );
    const button = screen.getByRole("button", { name: "Try again" });
    expect(button.getAttribute("type")).toBe("button");
  });
});
