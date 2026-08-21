/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import QAToolbar from "./QAToolbar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("react-redux", () => ({
  useSelector: () => ({ status: "guest", user: null }),
}));

afterEach(cleanup);

describe("QAToolbar", () => {
  test("labels the community search field", () => {
    render(
      <QAToolbar
        showResolved={false}
        onToggleResolvedAction={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Search community questions")).not.toBeNull();
  });

  test("exposes Open and Resolved as mutually exclusive filters", () => {
    const onToggleResolvedAction = vi.fn();
    render(
      <QAToolbar
        showResolved={false}
        onToggleResolvedAction={onToggleResolvedAction}
      />,
    );

    const open = screen.getByRole("button", { name: "Open" });
    const resolved = screen.getByRole("button", { name: "Resolved" });
    expect(open.getAttribute("aria-pressed")).toBe("true");
    expect(resolved.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(resolved);
    expect(onToggleResolvedAction).toHaveBeenCalledOnce();
    fireEvent.click(open);
    expect(onToggleResolvedAction).toHaveBeenCalledOnce();
  });
});
