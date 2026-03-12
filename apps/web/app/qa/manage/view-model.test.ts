import { describe, expect, test } from "vitest";
import {
  deriveManageMetrics,
  getDisplayMetrics,
  getDatasetState,
  getSectionEditorState,
} from "./view-model";

// Types used in tests-only context
// eslint-disable-next-line @typescript-eslint/no-explicit-any

type Any = any;

describe("deriveManageMetrics", () => {
  test("counts pending lawyers, verified lawyers, banned users, and sections", () => {
    expect(
      deriveManageMetrics({
        users: [
          { _id: "u1", role: "lawyer", lawyerVerified: false, banned: false } as Any,
          { _id: "u2", role: "lawyer", lawyerVerified: true, banned: false } as Any,
          { _id: "u3", role: "tenant", lawyerVerified: false, banned: true } as Any,
        ] as Any,
        folders: [{ _id: "f1" }, { _id: "f2" }] as Any,
      }),
    ).toEqual({
      pendingLawyerCount: 1,
      verifiedLawyers: 1,
      bannedUserCount: 1,
      totalUsers: 3,
      totalSections: 2,
    });
  });
});

describe("getDisplayMetrics", () => {
  test("returns null for cards backed by unavailable datasets and includes full shape", () => {
    expect(
      getDisplayMetrics({
        users: { hasLoaded: false, data: [], error: "Users failed", isLoading: false },
        sections: {
          hasLoaded: true,
          data: [{ _id: "f1" }] as Any,
          error: "",
          isLoading: false,
        },
      }),
    ).toEqual({
      pendingLawyerCount: null,
      verifiedLawyers: null,
      bannedUserCount: null,
      totalUsers: null,
      totalSections: 1,
    });
  });

  test("returns full metrics when both datasets are available", () => {
    expect(
      getDisplayMetrics({
        users: {
          hasLoaded: true,
          data: [
            { _id: "u1", role: "lawyer", lawyerVerified: false, banned: false } as Any,
            { _id: "u2", role: "lawyer", lawyerVerified: true, banned: false } as Any,
            { _id: "u3", role: "tenant", lawyerVerified: false, banned: true } as Any,
          ],
          error: "",
          isLoading: false,
        },
        sections: { hasLoaded: true, data: [{ _id: "f1" }, { _id: "f2" }] as Any, error: "", isLoading: false },
      }),
    ).toEqual({
      pendingLawyerCount: 1,
      verifiedLawyers: 1,
      bannedUserCount: 1,
      totalUsers: 3,
      totalSections: 2,
    });
  });
});

describe("getDatasetState", () => {
  test("treats initial load failure differently from refresh failure, and normal loaded has no stale rows", () => {
    // Initial load failure: error with hasLoaded=false is inline error, not stale
    expect(
      getDatasetState({
        hasLoaded: false,
        data: [],
        error: "Failed to load users",
        isLoading: false,
      }),
    ).toEqual({
      showInlineError: true,
      showStaleRows: false,
      disableActions: false,
      showEmptyState: false,
    });

    // Refresh failure with existing rows: stale + actions disabled
    expect(
      getDatasetState({
        hasLoaded: true,
        data: [{ _id: "u1" }] as Any,
        error: "Refresh failed",
        isLoading: false,
      }),
    ).toEqual({
      showInlineError: true,
      showStaleRows: true,
      disableActions: true,
      showEmptyState: false,
    });

    // Normal loaded, no error: not stale, actions enabled
    expect(
      getDatasetState({
        hasLoaded: true,
        data: [{ _id: "u1" }] as Any,
        error: "",
        isLoading: false,
      }),
    ).toEqual({
      showInlineError: false,
      showStaleRows: false,
      disableActions: false,
      showEmptyState: false,
    });
  });
});

describe("getSectionEditorState", () => {
  test("disables the editor when sections never loaded successfully", () => {
    expect(
      getSectionEditorState({
        hasSectionsLoaded: false,
        sectionsError: "Failed to load sections",
        formMode: "closed",
        savePending: false,
      }),
    ).toEqual({ canOpen: false, isDisabled: true, isOpen: false });
  });

  test("allows opening when there was a prior successful load, even if a later refresh errored", () => {
    expect(
      getSectionEditorState({
        hasSectionsLoaded: true,
        sectionsError: "Latest refresh failed",
        formMode: "closed",
        savePending: false,
      }),
    ).toEqual({ canOpen: true, isDisabled: false, isOpen: false });
  });
});
