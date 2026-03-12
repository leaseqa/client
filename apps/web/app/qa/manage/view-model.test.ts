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
  test("returns null for cards backed by unavailable datasets", () => {
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
      totalUsers: null,
      verifiedLawyers: null,
      totalSections: 1,
    });
  });
});

describe("getDatasetState", () => {
  test("treats initial load failure differently from refresh failure", () => {
    expect(
      getDatasetState({
        hasLoaded: false,
        data: [],
        error: "Failed to load users",
        isLoading: false,
      }),
    ).toMatchObject({ showStaleRows: false, showInlineError: true });

    expect(
      getDatasetState({
        hasLoaded: true,
        data: [{ _id: "u1" }] as Any,
        error: "Refresh failed",
        isLoading: false,
      }),
    ).toMatchObject({ showStaleRows: true, disableActions: true });
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
    ).toMatchObject({ canOpen: false, isDisabled: true });
  });
});
