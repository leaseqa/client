/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import SourceUploader from "./SourceUploader";

afterEach(cleanup);

function renderUploader(sourceText = "", hasActiveSession = false) {
  const onFilesChange = vi.fn();
  const onSourceTextChange = vi.fn();

  render(
    <SourceUploader
      sourceText={sourceText}
      selectedFile={null}
      uploadResetKey={0}
      creatingSession={false}
      pendingDraftSource={false}
      hasActiveSession={hasActiveSession}
      isGuest
      onSourceTextChange={onSourceTextChange}
      onFilesChange={onFilesChange}
      onSubmit={vi.fn()}
    />,
  );

  return { onFilesChange, onSourceTextChange };
}

describe("SourceModeTabs", () => {
  test("exposes upload and paste as accessible, mutually exclusive modes", () => {
    const { onFilesChange } = renderUploader();

    expect(
      screen.getByRole("tab", { name: "Upload File" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen.queryByLabelText("Lease clause or housing text"),
    ).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Paste Text" }));

    expect(
      screen.getByRole("tab", { name: "Paste Text" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByLabelText("Lease clause or housing text")).not.toBeNull();
    expect(onFilesChange).toHaveBeenCalledWith([]);
  });

  test("starts in paste mode for an existing text draft and clears it when switching", () => {
    const { onSourceTextChange } = renderUploader("A lease clause draft");

    expect(
      screen.getByRole("tab", { name: "Paste Text" }).getAttribute("aria-selected"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("tab", { name: "Upload File" }));

    expect(onSourceTextChange).toHaveBeenCalledWith("");
    expect(
      screen.queryByLabelText("Lease clause or housing text"),
    ).toBeNull();
  });

  test("collapses a completed source on mobile until the renter chooses to change it", () => {
    renderUploader("", true);

    const summary = screen.getByRole("button", { name: "Change Source" });
    const sourceRegion = screen.getByRole("region", { name: "Lease source" });
    expect(summary.getAttribute("aria-expanded")).toBe("false");
    expect(sourceRegion.getAttribute("data-expanded")).toBe("false");

    fireEvent.click(summary);

    expect(summary.getAttribute("aria-expanded")).toBe("true");
    expect(sourceRegion.getAttribute("data-expanded")).toBe("true");
    expect(screen.getByRole("tab", { name: "Upload File" })).not.toBeNull();
  });

  test("configures Word uploads without emitting an invalid MIME warning", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    renderUploader();

    expect(warning).not.toHaveBeenCalled();
    warning.mockRestore();
  });

  test("prevents an empty review from being submitted", () => {
    renderUploader();

    expect(
      (screen.getByRole("button", { name: "Start Review" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
