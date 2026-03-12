# Admin UI v2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the admin workspace at `/qa/manage` into the approved v2 layout and visually align post moderation surfaces on `/qa` without changing backend APIs or moderation semantics.

**Architecture:** Keep `apps/web/app/qa/manage/page.tsx` as the orchestration layer for admin data and mutations, but move pure derivation into a small `view-model.ts` helper so the new load-state and metric rules are testable. Implement the approved shell by adding focused presentational components, then restyle moderation in place by updating `PostDetailSection` and its visible children plus the shared `post-*` CSS already loaded by the app.

**Tech Stack:** Next.js App Router, React 19 client components, Redux session state, Vitest, global CSS via `apps/web/app/globals.css` and `apps/web/app/refresh.css`, `react-icons`, `lucide-react`.

---

## File Structure

### Chunk 1: `/qa/manage` refresh

- Create: `apps/web/app/qa/manage/view-model.ts`
- Create: `apps/web/app/qa/manage/view-model.test.ts`
- Create: `apps/web/app/qa/manage/components/ManageSidebar.tsx`
- Create: `apps/web/app/qa/manage/components/ManageStats.tsx`
- Create: `apps/web/app/qa/manage/components/ManageUsersSection.tsx`
- Create: `apps/web/app/qa/manage/components/ManageSectionsSection.tsx`
- Create: `apps/web/app/qa/manage/components/render.test.tsx`
- Modify: `apps/web/app/qa/manage/page.tsx`
- Modify: `apps/web/app/qa/manage/components/ManageHeader.tsx`
- Modify: `apps/web/app/qa/manage/components/ManageAlerts.tsx`
- Modify: `apps/web/app/qa/manage/components/CreateSectionForm.tsx`
- Modify: `apps/web/app/qa/manage/components/UsersTable.tsx`
- Modify: `apps/web/app/qa/manage/components/SectionsTable.tsx`
- Modify: `apps/web/app/qa/manage/components/index.ts`
- Modify: `apps/web/app/refresh.css`
- Modify: `apps/web/app/globals.css`

### Chunk 2: moderation visual alignment

- Create: `apps/web/app/qa/components/post-detail-render.test.tsx`
- Modify: `apps/web/app/qa/components/PostDetailSection.tsx`
- Modify: `apps/web/app/qa/[id]/components/PostContent.tsx`
- Modify: `apps/web/app/qa/[id]/components/AnswersSection.tsx`
- Modify: `apps/web/app/qa/[id]/components/DiscussionsSection.tsx`
- Modify: `apps/web/app/qa/[id]/components/EditPostForm.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/refresh.css`

## Chunk 1: `/qa/manage` v2 Shell

### Task 1: Add the admin view-model helper and lock the state rules with tests

**Files:**
- Create: `apps/web/app/qa/manage/view-model.ts`
- Create: `apps/web/app/qa/manage/view-model.test.ts`
- Reference: `apps/web/app/qa/types.ts`

- [ ] **Step 1: Write failing tests for metrics, stale-data handling, and form availability**

```ts
import { describe, expect, test } from "vitest";
import {
  deriveManageMetrics,
  getDisplayMetrics,
  getDatasetState,
  getSectionEditorState,
} from "./view-model";

describe("deriveManageMetrics", () => {
  test("counts pending lawyers, verified lawyers, banned users, and sections", () => {
    expect(
      deriveManageMetrics({
        users: [
          { _id: "u1", role: "lawyer", lawyerVerified: false, banned: false },
          { _id: "u2", role: "lawyer", lawyerVerified: true, banned: false },
          { _id: "u3", role: "tenant", lawyerVerified: false, banned: true },
        ] as any,
        folders: [{ _id: "f1" }, { _id: "f2" }] as any,
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
          data: [{ _id: "f1" }] as any,
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
        data: [{ _id: "u1" }] as any,
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
```

- [ ] **Step 2: Run the new test file and confirm it fails first**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/manage/view-model.test.ts
```

Expected: FAIL because `view-model.ts` does not exist yet.

- [ ] **Step 3: Implement the helper with pure dataset and editor-state functions**

```ts
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
    totalUsers: users.hasLoaded ? metrics.totalUsers : null,
    verifiedLawyers: users.hasLoaded ? metrics.verifiedLawyers : null,
    totalSections: sections.hasLoaded ? metrics.totalSections : null,
  };
}

export function getDatasetState(input: DatasetStateInput) {
  const hasRows = input.data.length > 0;
  const showStaleRows = input.hasLoaded && hasRows;

  return {
    showInlineError: Boolean(input.error),
    showStaleRows,
    disableActions: Boolean(input.error) && showStaleRows,
    showEmptyState: input.hasLoaded && !input.error && !hasRows && !input.isLoading,
  };
}
```

- [ ] **Step 4: Re-run the helper tests**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/manage/view-model.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the helper baseline**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add \
  apps/web/app/qa/manage/view-model.ts \
  apps/web/app/qa/manage/view-model.test.ts
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "test: cover admin manage view model"
```

### Task 2: Build the new admin shell components and widen the existing component contracts

**Files:**
- Create: `apps/web/app/qa/manage/components/ManageSidebar.tsx`
- Create: `apps/web/app/qa/manage/components/ManageStats.tsx`
- Create: `apps/web/app/qa/manage/components/ManageUsersSection.tsx`
- Create: `apps/web/app/qa/manage/components/ManageSectionsSection.tsx`
- Create: `apps/web/app/qa/manage/components/render.test.tsx`
- Modify: `apps/web/app/qa/manage/components/ManageHeader.tsx`
- Modify: `apps/web/app/qa/manage/components/ManageAlerts.tsx`
- Modify: `apps/web/app/qa/manage/components/CreateSectionForm.tsx`
- Modify: `apps/web/app/qa/manage/components/UsersTable.tsx`
- Modify: `apps/web/app/qa/manage/components/SectionsTable.tsx`
- Modify: `apps/web/app/qa/manage/components/index.ts`

- [ ] **Step 1: Write failing render smoke tests for the new shell components**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import CreateSectionForm from "./CreateSectionForm";
import ManageAlerts from "./ManageAlerts";
import ManageHeader from "./ManageHeader";
import ManageSidebar from "./ManageSidebar";
import ManageSectionsSection from "./ManageSectionsSection";
import ManageStats from "./ManageStats";
import ManageUsersSection from "./ManageUsersSection";

describe("ManageSidebar", () => {
  test("renders navigation anchors, attention cards, and the moderation link", () => {
    const html = renderToStaticMarkup(
      <ManageSidebar
        anchors={{ overview: "#overview", users: "#users", sections: "#sections" }}
        pendingLawyerCount={2}
        bannedUserCount={1}
        moderationHref="/qa"
      />,
    );

    expect(html).toContain("Overview");
    expect(html).toContain("Users");
    expect(html).toContain("Sections");
    expect(html).toContain("Pending verification");
    expect(html).toContain("Banned users");
    expect(html).toContain("Moderate posts");
    expect(html).toContain("href=\"/qa\"");
    expect(html).not.toContain("Verified lawyers");
  });
});

describe("ManageStats", () => {
  test("omits metrics whose dataset is unavailable", () => {
    const html = renderToStaticMarkup(
      <ManageStats totalUsers={null} totalSections={6} verifiedLawyers={null} />,
    );

    expect(html).toContain("6");
    expect(html).not.toContain("Users");
  });
});

describe("ManageHeader and ManageAlerts", () => {
  test("disables create when sections are unavailable and prefers the latest alert", () => {
    const headerHtml = renderToStaticMarkup(
      <ManageHeader
        isRefreshing={false}
        isRefreshDisabled={true}
        formMode="closed"
        sectionsAvailable={false}
        onRefresh={() => {}}
        onShowCreate={() => {}}
      />,
    );
    const alertsHtml = renderToStaticMarkup(
      <ManageAlerts
        error=""
        success="Section saved"
        onClearError={() => {}}
        onClearSuccess={() => {}}
      />,
    );

    expect(headerHtml).toContain("LeaseQA Admin");
    expect(headerHtml).toContain("disabled");
    expect(alertsHtml).toContain("Section saved");
  });
});

describe("region shells and section form", () => {
  test("renders inline retry states and an edit-mode section form", () => {
    const usersHtml = renderToStaticMarkup(
      <ManageUsersSection
        title="Users"
        isLoading={false}
        isDataAvailable={false}
        hasLoaded={false}
        error="Failed to load users"
        onRetry={() => {}}
      >
        <div>unused</div>
      </ManageUsersSection>,
    );
    const sectionsHtml = renderToStaticMarkup(
      <ManageSectionsSection
        title="Sections"
        isLoading={false}
        isDataAvailable={false}
        hasLoaded={false}
        error="Failed to load sections"
        onRetry={() => {}}
      >
        <div>unused</div>
      </ManageSectionsSection>,
    );
    const formHtml = renderToStaticMarkup(
      <CreateSectionForm
        draft={{ name: "repairs", displayName: "Repairs", description: "", color: "" }}
        mode="edit"
        loading={false}
        disabled={false}
        errors={{}}
        submitError=""
        refetchError=""
        onDraftChange={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(usersHtml).toContain("Retry users");
    expect(sectionsHtml).toContain("Retry sections");
    expect(formHtml).toContain("Edit section");
    expect(formHtml).toContain("readonly");
  });
});
```

- [ ] **Step 2: Run the new render tests and confirm they fail**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/manage/components/render.test.tsx
```

Expected: FAIL because the new components do not exist yet.

- [ ] **Step 3: Implement the new shell pieces and update the touched component APIs**

```tsx
export default function ManageUsersSection({
  title,
  isLoading,
  isDataAvailable,
  error,
  onRetry,
  children,
}: ManageUsersSectionProps) {
  if (!isDataAvailable && error) {
    return (
      <section id="users" className="admin-v2-section">
        <div className="admin-v2-inline-error">
          <p>{error}</p>
          <button className="admin-v2-link-btn" onClick={onRetry}>Retry users</button>
        </div>
      </section>
    );
  }

  return (
    <section id="users" className="admin-v2-section">
      <div className="admin-v2-section-heading">
        <h2>{title}</h2>
      </div>
      {isLoading ? <p className="admin-v2-loading-copy">Loading users…</p> : children}
    </section>
  );
}
```

Implementation notes for this step:
- `ManageHeader` must accept `isRefreshing`, `isRefreshDisabled`, `formMode`, and `sectionsAvailable`.
- `ManageAlerts` must expose only the latest page-level mutation result.
- `CreateSectionForm` must support both `create` and `edit` labels, disabled states, submit errors, and refetch-retry copy.
- `UsersTable` must accept row-pending markers and disable the full row while a user action is in flight.
- `SectionsTable` must stop owning inline edit controls; it only lists rows and emits edit/delete intents.
- `render.test.tsx` must exercise the widened contracts for `ManageSidebar`, `ManageHeader`, `ManageAlerts`, `ManageUsersSection`, `ManageSectionsSection`, and `CreateSectionForm` so the new shell cannot silently drift from the spec.

- [ ] **Step 4: Re-run the component render tests**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/manage/components/render.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the new shell components**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add \
  apps/web/app/qa/manage/components/ManageSidebar.tsx \
  apps/web/app/qa/manage/components/ManageStats.tsx \
  apps/web/app/qa/manage/components/ManageUsersSection.tsx \
  apps/web/app/qa/manage/components/ManageSectionsSection.tsx \
  apps/web/app/qa/manage/components/render.test.tsx \
  apps/web/app/qa/manage/components/ManageHeader.tsx \
  apps/web/app/qa/manage/components/ManageAlerts.tsx \
  apps/web/app/qa/manage/components/CreateSectionForm.tsx \
  apps/web/app/qa/manage/components/UsersTable.tsx \
  apps/web/app/qa/manage/components/SectionsTable.tsx \
  apps/web/app/qa/manage/components/index.ts
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "feat: add admin v2 shell components"
```

### Task 3: Refactor `page.tsx` orchestration and wire the `admin-v2-*` visual system

**Files:**
- Modify: `apps/web/app/qa/manage/page.tsx`
- Modify: `apps/web/app/qa/manage/view-model.ts`
- Modify: `apps/web/app/qa/manage/view-model.test.ts`
- Modify: `apps/web/app/refresh.css`
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Extend the helper tests to cover page orchestration rules before changing the page**

```ts
describe("getPageRegions", () => {
  test("keeps successful content visible when only sections refresh fails", () => {
    expect(
      getPageRegions({
        users: { hasLoaded: true, data: [{ _id: "u1" }] as any, error: "", isLoading: false },
        sections: { hasLoaded: true, data: [{ _id: "f1" }] as any, error: "Sections refresh failed", isLoading: false },
        formMode: "edit",
      }),
    ).toMatchObject({
      showShellError: false,
      showUsersRegion: true,
      showSectionsRegion: true,
      showSectionForm: true,
      sectionsDisabled: true,
    });
  });

  test("hides the section form when both datasets fail on first load", () => {
    expect(
      getPageRegions({
        users: { hasLoaded: false, data: [], error: "Users failed", isLoading: false },
        sections: { hasLoaded: false, data: [], error: "Sections failed", isLoading: false },
        formMode: "create",
      }),
    ).toMatchObject({
      showShellError: true,
      showSectionForm: false,
    });
  });
});
```

- [ ] **Step 2: Run the helper suite again and confirm the new cases fail**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/manage/view-model.test.ts
```

Expected: FAIL until `getPageRegions` exists and the old page state rules are updated.

- [ ] **Step 3: Refactor `page.tsx` to use split dataset state, row-pending markers, and the new shell layout**

```tsx
const [usersState, setUsersState] = useState<DatasetState<User>>({
  data: [],
  hasLoaded: false,
  isLoading: false,
  error: "",
});
const [sectionsState, setSectionsState] = useState<DatasetState<Folder>>({
  data: [],
  hasLoaded: false,
  isLoading: false,
  error: "",
});
const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
const [formMode, setFormMode] = useState<"closed" | "create" | "edit">("closed");

const metrics = getDisplayMetrics({
  users: usersState,
  sections: sectionsState,
});
const pageRegions = getPageRegions({
  users: usersState,
  sections: sectionsState,
  formMode,
});
```

Implementation notes for this step:
- Keep initial auth gating intact: non-admin users still redirect to `/qa`.
- `loadUsers`, `loadSections`, and `refreshAll` should be separate async functions so partial reload and retry behavior matches the spec.
- Use row markers like `${userId}:role` and `${sectionId}:delete` to disable only the intended actions.
- The section side panel must stay open during manual refresh if the edited section still exists after reload.
- Move the new `admin-v2-*` shell layout, nav, stats, inline error, and side-panel styles into `refresh.css`.
- Leave untouched legacy `manage-*` rules in `globals.css` only where other QA surfaces still rely on them; remove or override the ones this page no longer uses.

- [ ] **Step 4: Run the focused tests, then the full frontend verification**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/manage/view-model.test.ts apps/web/app/qa/manage/components/render.test.tsx
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web test
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client lint
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client build
```

Expected: all commands PASS.

- [ ] **Step 5: Manually verify the admin workspace with the existing admin account**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web dev
```

Manual checklist:
- Log in with the current admin account already configured for this environment.
- Open `/qa/manage`.
- Confirm the left rail anchors scroll to overview, users, and sections.
- Confirm the left rail moderation entry links to `/qa`.
- Confirm the create button is disabled whenever sections are unavailable.
- Confirm users-only failure still leaves sections visible, and sections-only failure still leaves users visible.
- Confirm the dual-failure state shows the shell error surface, keeps both regions mounted with inline errors, and hides the section form.
- Confirm refresh is disabled while a user-row mutation or section save is pending.
- Confirm create, edit, and delete section flows work, and that edit mode keeps the `name` field read-only.
- Confirm a successful save followed by folders-refetch failure keeps the panel open, shows the refetch retry action, and disables re-save until recovery.
- Confirm a manual refresh while editing keeps the panel open if the section still exists.
- Confirm the edit panel closes with a concise error if the edited section disappears after reload.
- Confirm role change, verify lawyer, ban/unban, and delete user each lock only the targeted row.
- Confirm the layout stacks into header -> sidebar -> alerts -> stats -> main sections -> section form around the `992px` breakpoint.

- [ ] **Step 6: Commit chunk 1**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add \
  apps/web/app/qa/manage/page.tsx \
  apps/web/app/qa/manage/view-model.ts \
  apps/web/app/qa/manage/view-model.test.ts \
  apps/web/app/refresh.css \
  apps/web/app/globals.css
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "feat: redesign admin manage workspace"
```

## Chunk 2: Moderation Surface Alignment

### Task 4: Add render smoke tests for the moderation components that will be restyled

**Files:**
- Create: `apps/web/app/qa/components/post-detail-render.test.tsx`
- Reference: `apps/web/app/qa/[id]/components/PostContent.tsx`
- Reference: `apps/web/app/qa/[id]/components/AnswersSection.tsx`
- Reference: `apps/web/app/qa/[id]/components/DiscussionsSection.tsx`

- [ ] **Step 1: Write failing render smoke tests that pin the current moderation affordances**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

import PostContent from "../[id]/components/PostContent";
import AnswersSection from "../[id]/components/AnswersSection";
import DiscussionsSection from "../[id]/components/DiscussionsSection";

describe("moderation render smoke", () => {
  test("PostContent keeps pin and status controls visible for admins", () => {
    const html = renderToStaticMarkup(
      <PostContent
        post={{ summary: "Heating issue", details: "<p>Broken radiator</p>", folders: ["repairs"], isPinned: true, urgency: "high" } as any}
        folders={[]}
        canEdit
        isEditing={false}
        editSummary=""
        editDetails=""
        editUrgency="low"
        editFolders={[]}
        resolvedStatus="open"
        isAdmin
        onStatusChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
        onSummaryChange={() => {}}
        onDetailsChange={() => {}}
        onUrgencyChange={() => {}}
        onFoldersChange={() => {}}
        onTogglePin={() => {}}
      />,
    );

    expect(html).toContain("Pinned");
    expect(html).toContain("Status:");
  });

  test("AnswersSection keeps answer affordances reachable", () => {
    const html = renderToStaticMarkup(
      <AnswersSection
        answers={[]}
        currentUserId="u1"
        currentRole="admin"
        isGuest={false}
        showAnswerBox={false}
        answerContent=""
        answerFocused={false}
        answerFiles={[]}
        answerEditing={null}
        answerEditContent=""
        error=""
        onShowAnswerBox={() => {}}
        onAnswerContentChange={() => {}}
        onAnswerFocus={() => {}}
        onAnswerFilesChange={() => {}}
        onSubmitAnswer={() => {}}
        onClearAnswer={() => {}}
        onEditAnswer={() => {}}
        onEditContentChange={() => {}}
        onSaveEdit={() => {}}
        onCancelEdit={() => {}}
        onDeleteAnswer={() => {}}
      />,
    );

    expect(html).toContain("Answers");
    expect(html).toContain("Write an answer");
  });

  test("DiscussionsSection keeps follow-up affordances reachable", () => {
    const html = renderToStaticMarkup(
      <DiscussionsSection
        discussions={[]}
        currentUserId="u1"
        currentRole="admin"
        isGuest={false}
        showFollowBox={false}
        followFocused={false}
        discussionDrafts={{}}
        discussionReplying={null}
        discussionEditing={null}
        onShowFollowBox={() => {}}
        onFollowFocus={() => {}}
        onDraftChange={() => {}}
        onSubmit={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        onReply={() => {}}
        onEdit={() => {}}
        onCancelReply={() => {}}
        onCancelEdit={() => {}}
        onClearFollow={() => {}}
      />,
    );

    expect(html).toContain("Follow-up Discussion");
    expect(html).toContain("Write follow-up");
  });
});
```

- [ ] **Step 2: Run the new moderation render test and confirm it fails first**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/components/post-detail-render.test.tsx
```

Expected: FAIL until the new test file and stubs are in place.

- [ ] **Step 3: Add the render test file with any minimal mocks needed for dynamic editors**

```tsx
vi.mock("next/dynamic", () => ({
  default: () => function MockDynamicEditor() {
    return <div data-testid="mock-editor" />;
  },
}));
```

- [ ] **Step 4: Re-run the moderation render test**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/components/post-detail-render.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the moderation smoke tests**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add \
  apps/web/app/qa/components/post-detail-render.test.tsx
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "test: cover moderation render surfaces"
```

### Task 5: Restyle `PostDetailSection` and its visible children to match the v2 admin system

**Files:**
- Modify: `apps/web/app/qa/components/PostDetailSection.tsx`
- Modify: `apps/web/app/qa/[id]/components/PostContent.tsx`
- Modify: `apps/web/app/qa/[id]/components/AnswersSection.tsx`
- Modify: `apps/web/app/qa/[id]/components/DiscussionsSection.tsx`
- Modify: `apps/web/app/qa/[id]/components/EditPostForm.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/refresh.css`

- [ ] **Step 1: Move the visible moderation wrappers onto the shared v2 surface system**

```tsx
return (
  <section className="qa-v2-panel post-detail-card">
    <div className="qa-v2-panel-header post-detail-header">
      ...
    </div>
    <div className="qa-v2-panel-body">
      ...
    </div>
  </section>
);
```

- [ ] **Step 2: Align `PostContent`, `AnswersSection`, and `DiscussionsSection` while preserving their action ownership**

Implementation notes for this step:
- Keep all fetch and mutation logic inside `PostDetailSection`.
- Keep answer and discussion submit/edit/delete handlers in the same components that already own them.
- Update badges, buttons, list containers, editor boxes, and spacing only.
- Leave the route shape, section order, and moderation actions unchanged.
- Update `EditPostForm.tsx` if needed so edit mode uses the same field and button surfaces as the admin side panel.

- [ ] **Step 3: Update the shared `post-*` CSS to use the v2 palette and spacing**

```css
.post-detail-card {
  border: 1px solid var(--site-border);
  border-radius: var(--site-radius);
  background: var(--site-panel);
  box-shadow: var(--site-shadow);
}

.post-btn.primary {
  background: var(--site-accent);
  border-color: var(--site-accent);
  color: #fff;
}

.post-answer-item,
.post-discussion-item {
  background: var(--site-panel-strong);
  border: 1px solid var(--site-border);
}
```

- [ ] **Step 4: Re-run the moderation render test, then the full frontend verification**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web exec vitest run apps/web/app/qa/components/post-detail-render.test.tsx
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web test
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client lint
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client build
```

Expected: all commands PASS.

- [ ] **Step 5: Manually verify the moderation flow on `/qa` with the existing admin account**

Run:

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web dev
```

Manual checklist:
- Open `/qa`, choose a post, and confirm `PostDetailSection` uses the new surfaces.
- Confirm pin toggle, status toggle, edit, delete, answer, and discussion actions still work.
- Confirm pending moderation actions disable only the clicked control.
- Confirm existing moderation success and error feedback still appears and remains readable after the visual refresh.
- Confirm the admin restyle and `/qa/manage` now feel visually related without collapsing into one route.

- [ ] **Step 6: Commit chunk 2**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add \
  apps/web/app/qa/components/PostDetailSection.tsx \
  apps/web/app/qa/[id]/components/PostContent.tsx \
  apps/web/app/qa/[id]/components/AnswersSection.tsx \
  apps/web/app/qa/[id]/components/DiscussionsSection.tsx \
  apps/web/app/qa/[id]/components/EditPostForm.tsx \
  apps/web/app/globals.css \
  apps/web/app/refresh.css
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "feat: align moderation ui with admin v2"
```

## Final Verification

- [ ] **Step 1: Run the full frontend test suite**

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web test
```

Expected: PASS.

- [ ] **Step 2: Run lint and production build**

```bash
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client lint
pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client build
```

Expected: PASS.

- [ ] **Step 3: Record manual QA outcomes before any release work**

Checklist:
- `/qa/manage` works end to end for the current admin account.
- `/qa/manage` handles partial dataset failures correctly.
- `/qa` moderation still supports edit, pin, resolve, answer, and discussion flows.
- Visual language is aligned across home, AI review, admin, and moderation.
