import type { Folder, User } from "../types";

export type DatasetStateInput<T = unknown> = {
  hasLoaded: boolean;
  data: T[];
  error?: string | null;
  isLoading: boolean;
};

export function deriveManageMetrics({ users, folders }: { users: User[]; folders: Folder[] }) {
  const pendingLawyerCount = users.filter(
    (user) => user.role === "lawyer" && user.lawyerVerified !== true,
  ).length;

  return {
    pendingLawyerCount,
    verifiedLawyers: users.filter(
      (user) => user.role === "lawyer" && user.lawyerVerified === true,
    ).length,
    bannedUserCount: users.filter((user) => user.banned === true).length,
    totalUsers: users.length,
    totalSections: folders.length,
  };
}

export function getDisplayMetrics({
                                    users,
                                    sections,
                                  }: {
  users: DatasetStateInput<User>;
  sections: DatasetStateInput<Folder>;
}) {
  const metrics = deriveManageMetrics({
    users: users.data,
    folders: sections.data,
  });

  return {
    pendingLawyerCount: users.hasLoaded ? metrics.pendingLawyerCount : null,
    verifiedLawyers: users.hasLoaded ? metrics.verifiedLawyers : null,
    bannedUserCount: users.hasLoaded ? metrics.bannedUserCount : null,
    totalUsers: users.hasLoaded ? metrics.totalUsers : null,
    totalSections: sections.hasLoaded ? metrics.totalSections : null,
  } as const;
}

export function getDatasetState<T = unknown>(input: DatasetStateInput<T>) {
  const hasRows = input.data.length > 0;
  const showStaleRows = input.hasLoaded && hasRows && Boolean(input.error);
  const hasError = Boolean(input.error);

  return {
    showInlineError: hasError,
    showStaleRows,
    disableActions: hasError && showStaleRows,
    showEmptyState: input.hasLoaded && !hasError && !hasRows && !input.isLoading,
  } as const;
}

type EditorFormMode = "closed" | "open" | "create" | "edit";

export function getSectionEditorState(input: {
  hasSectionsLoaded: boolean;
  sectionsError?: string | null;
  formMode: EditorFormMode;
  savePending: boolean;
}) {
  const neverLoaded = !input.hasSectionsLoaded;
  // Disable interaction while saving or if the dataset never loaded successfully.
  const isDisabled = neverLoaded || input.savePending;
  const isOpen = input.formMode !== "closed";
  const canOpen = !isOpen && !isDisabled;

  return { canOpen, isDisabled, isOpen } as const;
}

/**
 * Decide whether to keep the section editor panel open after a refetch.
 * Rules:
 * - Only applies when currently in edit mode
 * - Keep open if the edited section id still exists in the freshly fetched list
 * - Otherwise, close and surface an error at the page level
 */
export function shouldKeepEditorOpenAfterRefetch(input: {
  formMode: EditorFormMode;
  editedSectionId: string | null;
  sections: Array<{ _id: string }>;
}) {
  if ( input.formMode !== "edit" || !input.editedSectionId ) return false;
  return input.sections.some((s) => s._id === input.editedSectionId);
}
