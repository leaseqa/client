import type { User, Folder } from "../types";

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

export function getSectionEditorState(input: {
  hasSectionsLoaded: boolean;
  sectionsError?: string | null;
  formMode: string; // e.g., "closed" | "open" | "create" | "edit"
  savePending: boolean;
}) {
  const neverLoaded = !input.hasSectionsLoaded;
  const isDisabled = neverLoaded;
  const isOpen = input.formMode !== "closed";
  const canOpen = !isOpen && !isDisabled && !input.savePending;

  return { canOpen, isDisabled, isOpen } as const;
}
