# Admin UI v2 Design

**Date:** 2026-03-12  
**Owner:** Codex  
**Status:** Approved for planning  
**Planning gate note:** No TODO markers or placeholder sections remain in this document.

## Goal

Refresh the admin and moderation experience in `apps/web/app/qa/manage` so it visually aligns with the new public-facing v2 UI while preserving the speed and information density of an internal operations console.

## Scope

This design covers the frontend admin and moderation surfaces that are already in the client app:

- `apps/web/app/qa/manage/page.tsx`
- `apps/web/app/qa/manage/components/*`
- `apps/web/app/qa/components/PostDetailSection.tsx`
- Any shared admin-specific styles needed to align these screens with the new v2 visual language

This design does **not** change:

- Backend APIs
- Roles, permissions, or authentication rules
- Admin workflows that require new server capabilities
- Public QA feed layout beyond any styling hooks needed to keep post moderation consistent

## Current State

The current admin page is functional but visually disconnected from the rest of v2:

- It relies on a legacy `manage-*` dashboard style in `apps/web/app/globals.css`
- It uses a dense card-and-table layout that reads more like a generic admin template than a legal product
- The admin page and post moderation flow do not share the newer palette, spacing, and surface treatment used by the refreshed home and AI review pages
- Operators can already create sections, edit sections, update user roles, verify lawyers, ban or unban users, delete users, and moderate posts, so the problem is presentation and flow clarity rather than missing business logic

## Design Principles

1. Keep the page operational first. Admin users should still be able to scan rows and act quickly.
2. Align with the v2 product look. Use the same warm neutrals, muted green accents, soft borders, rounded cards, and calmer hierarchy.
3. Reduce visual noise. Remove oversized dashboard chrome, duplicate explanations, and unnecessary decorative panels.
4. Keep section editing close to the data. Section management should stay on-page instead of feeling like a context switch, while post moderation remains in the existing QA flow.
5. Avoid a “marketing page” admin. This should feel polished, not theatrical.

## Terminology Boundary

- Backend APIs, client functions, and persisted models continue using the existing `folder` / `folders` naming.
- All operator-facing copy in this redesign uses `section` / `sections`.
- `qa/manage/page.tsx` owns the translation boundary between API-facing `folders` data and UI-facing `sections` language.
- In this phase, no separate `SectionViewModel` layer is introduced. Existing admin components that already operate on raw folder records continue receiving those records directly, while headings, labels, and status copy refer to them as sections.
- New admin shell components may name props by UI intent (`sectionCount`, `sectionsError`, `sectionsAnchor`), but mutation handlers and client calls continue passing raw folder ids and folder draft shapes.

## Information Architecture

The refreshed page keeps a single-route admin workspace for **users and sections only** with three zones:

### 1. Top Utility Bar

Purpose:

- Give the page a stable v2-branded header
- Keep the primary action visible

Contents:

- `LeaseQA Admin` brand treatment
- Refresh action
- Primary action button for section creation

### 2. Left Rail

Purpose:

- Preserve the feeling of a management workspace
- Make the major admin areas legible without splitting into multiple pages immediately

Contents:

- Small navigation list: overview, users, sections
- Compact “needs attention” cards derived from already-loaded admin data only:
  - pending lawyer verifications
  - banned users
  - a dedicated cross-route moderation entry that links to `/qa`, where admins already moderate posts

Behavior:

- In this phase, the left rail uses in-page navigation only
- It does not create new routes or require new data loading
- The overview, users, and sections items scroll to on-page sections within `/qa/manage`
- The post moderation entry is an explicit link that opens the existing moderation route rather than an in-page anchor

### 3. Main Workspace

Purpose:

- Hold the actual management work
- Keep the densest information in the center of the screen

Contents:

- Compact page title and one-line description
- Small status cards derived from already loaded user and folder data only:
  - total users
  - total sections
  - verified lawyers
- A main content column containing:
  - `UsersTable`
  - `SectionsTable`
- A right-side editor column containing the shared section form

Post moderation boundary in this phase:

- `qa/manage` does **not** embed the full post moderation workflow
- Post moderation remains on `/qa`
- `PostDetailSection` is restyled so admin and moderation surfaces feel like one system across routes

Overview anchor target:

- The `overview` sidebar anchor targets the top of the main workspace title block plus `ManageStats`
- `page.tsx` owns that anchor target

## Primary Screen Layout

The approved direction is the simpler variant from the mockup review:

- No oversized hero panel
- No persistent right-side details drawer
- No large narrative overview blocks
- Keep the structure to a top bar, left rail, central list, and one smaller side editor
- The top bar contains branding, refresh, and create actions only

The intended desktop layout is:

- Top bar spanning the page
- Left rail at fixed width
- Main content in a two-column area:
  - primary column: `ManageStats`, `UsersTable`, then `SectionsTable`
  - secondary column: shared `CreateSectionForm` side panel

On smaller screens:

- Left rail stacks above the main content
- The main content column remains primary
- The section form panel drops below the main column rather than compressing both columns too aggressively
- Use the app’s existing desktop breakpoint behavior around `992px`; below that width the sidebar and section form stack vertically

## Component Responsibilities

### `qa/manage/page.tsx`

Responsibilities:

- Compose the refreshed page shell
- Continue loading folders and users through existing client functions
- Derive lightweight status counts from loaded data
- Own local UI state for success, error, create form visibility, editing state, and drafts
- Own separate fetch state and retry handlers for users and folders
- Own the in-page navigation targets for overview, users, and sections links
- Own row-level pending state for async admin actions so buttons can disable while requests are active

Changes:

- Reorganize markup into the new shell
- Replace the current flat stack of cards with a clearer hierarchy
- Keep business logic local unless extraction materially reduces complexity
- Render only counts and highlights that can be derived from loaded user and folder data
- Coordinate section create and edit state so only one editor surface is active at a time
- Keep partial rendering logic local so one failed dataset does not collapse the whole page
- The top refresh action always reloads both datasets together

Fetch architecture:

- Users and folders load as independent requests with independent success and error state
- `page.tsx` owns separate retry handlers for users and folders
- Partial rendering is allowed when one request fails
- Summary cards render only the metrics supported by the datasets that are currently available
- The page shell remains mounted even if one or both requests fail
- Row-level pending markers are keyed by entity id plus action type
- Concurrent actions on different rows are allowed; duplicate clicks on the same row action are blocked while that action is pending

Pending marker shape:

- Users: `${userId}:role`, `${userId}:verify`, `${userId}:ban`, `${userId}:delete`
- Sections: `${sectionId}:delete`
- The shared side-panel form owns its own save pending state instead of using a row marker

Request coordination:

- The global refresh action is disabled while any row mutation or section save is pending
- Row mutations and section save actions do not auto-trigger the global refresh button
- An open section draft remains mounted during a manual refresh unless the refetched data removes the edited section

Planning boundary:

- `page.tsx` remains the orchestration file, but implementation should treat users management and sections management as separate UI subtrees with explicit props and callbacks
- The admin shell should not directly interleave users-specific retry UI with sections-specific retry UI

### `qa/manage/components/ManageSidebar.tsx`

Responsibilities:

- Render the left rail navigation
- Render compact attention cards from explicit props

Changes:

- New component
- Keeps sidebar layout and summary rendering separate from page-level data loading

Contract:

- Receives in-page section anchors for overview, users, and sections
- Receives nullable `pendingLawyerCount`
- Receives nullable `bannedUserCount`
- Receives a moderation route href for the cross-route post moderation entry
- Omits user-derived cards when the related counts are unavailable because the users dataset failed

Count predicates:

- `pendingLawyerCount`: users with `role === "lawyer"` and `lawyerVerified !== true`
- `bannedUserCount`: users with `banned === true`

### `qa/manage/components/ManageStats.tsx`

Responsibilities:

- Render the compact status cards at the top of the main workspace

Changes:

- New component
- Receives derived counts as props
- Keeps metric presentation isolated from the rest of the page shell

Contract:

- Receives `totalUsers`
- Receives `totalSections`
- Receives `verifiedLawyers`
- Allows missing values for metrics whose source dataset is unavailable

### `qa/manage/components/ManageUsersSection.tsx`

Responsibilities:

- Render the users area title
- Render users-specific load error and retry action
- Render empty state when users load successfully but no users exist
- Render `UsersTable` when users data is available

Contract:

- Receives users data
- Receives `isLoading`
- Receives `hasLoaded`
- Receives `isDataAvailable`
- Receives users-specific load error
- Receives users retry handler
- Receives user-row pending markers
- Receives user action callbacks

Pending behavior rule:

- User actions lock per row, not per control
- While any user mutation is pending for a user, all interactive controls on that user row are disabled
- This prevents combinations like role change plus delete or ban plus delete from running concurrently on the same row

### `qa/manage/components/ManageSectionsSection.tsx`

Responsibilities:

- Render the sections area title
- Render sections-specific load error and retry action
- Render empty state when sections load successfully but no sections exist
- Render `SectionsTable`

Contract:

- Receives raw folders data while rendering all UI copy as sections
- Receives `isLoading`
- Receives `hasLoaded`
- Receives `isDataAvailable`
- Receives sections-specific load error
- Receives sections retry handler
- Receives section-row pending markers
- Receives section action callbacks
- Owns only the sections list, sections empty state, and sections-specific retry UI

### Screen Composition

Desktop:

- `ManageHeader`
- Left rail: `ManageSidebar`
- Top of main shell under header: `ManageAlerts`
- Main column: `ManageStats` -> `ManageUsersSection` -> `ManageSectionsSection`
- Right column: shared `CreateSectionForm`

Mobile:

- `ManageHeader`
- `ManageSidebar`
- `ManageAlerts`
- `ManageStats`
- `ManageUsersSection`
- `ManageSectionsSection`
- shared `CreateSectionForm`

### Section Management Flow

Render tree:

- `page.tsx` renders the section management area
- `SectionsTable` stays responsible for listing existing sections and exposing edit/delete actions
- `CreateSectionForm` becomes the shared side-panel form surface for both:
  - create mode
  - edit mode

State ownership:

- `page.tsx` owns the active section form mode: `create | edit | closed`
- `page.tsx` owns the selected section id for edit mode
- `page.tsx` owns the section draft object passed into the form
- The draft shape remains the current folder draft shape:
  - `name`
  - `displayName`
  - `description`
  - `color`
- `SectionsTable` stays presentational and emits edit/delete intents only
- `CreateSectionForm` stays presentational and emits draft/save/cancel events only

Rules:

- Only one section form panel is open at a time
- Starting a create flow closes any active edit flow
- Starting an edit flow closes any active create flow
- Canceling closes the panel immediately
- Delete remains an inline action from the list and does not reuse the side panel
- Section creation is not an inline row flow in this phase; it uses the same side-panel surface as editing
- Required fields remain `name` and `displayName`
- In edit mode, `name` is read-only and is not submitted as a mutable field
- Validation errors keep the current draft intact for retry
- When the form mode is `closed`, the side panel unmounts
- Unsaved drafts do not survive switching between `create` and `edit`
- If the folders dataset reloads and the edited section no longer exists, the panel closes and the page shows a concise error
- If the folders dataset fails while editing, the current draft stays visible but save remains disabled until folders data becomes available again
- If the sections dataset is unavailable on initial load, the section form cannot open and all section create/edit entry points stay disabled until sections data reload succeeds
- If the currently edited section is deleted successfully, the panel closes, clears its draft, and relies on the folders reload to reconcile the list
- After a successful create or edit mutation, the client refetches folders before closing the panel
- If the mutation succeeds but the refetch fails, the panel stays open and the page shows a concise error so the admin can retry the refetch without losing context
- In that refetch-failure recovery state, form fields stay visible but save remains disabled until retry succeeds or the admin cancels
- If a manual refresh succeeds while an edit draft is open and the section still exists, the local draft remains authoritative until the admin cancels or saves
- `page.tsx` owns the retry-refetch callback and passes it to `CreateSectionForm` when needed

### `qa/manage/components/ManageHeader.tsx`

Responsibilities:

- Become the compact top utility bar
- Surface the main create action and refresh action

Changes:

- Reduce copy length
- Match v2 button and surface styling
- Stop reading like a generic admin banner
- Remove any placeholder search or filter control from this phase

Contract:

- Receives `isRefreshing`
- Receives `isRefreshDisabled`
- Receives the current section form mode
- Receives whether sections data is currently available
- Emits `onRefresh`
- Emits `onShowCreate`
- Does not own async state
- Triggering `onShowCreate` always forces section form mode to `create`
- If an edit panel is open, the header action closes it and opens the create panel instead
- If sections data is unavailable, the create action remains visible but disabled

### `qa/manage/components/ManageAlerts.tsx`

Responsibilities:

- Display actionable success and error feedback

Changes:

- Restyle alerts to fit v2 surfaces
- Make them feel inline and operational instead of loud full-width admin warnings

Contract:

- Receives `error`
- Receives `success`
- Emits `onClearError`
- Emits `onClearSuccess`
- Displays page-level feedback only; row-level pending state stays outside this component
- Displays only the latest page-level success or error message rather than stacking a history
- Is rendered by `page.tsx` directly below `ManageHeader` and above the main content
- Does not render shell-level load failures; those are rendered by `page.tsx` as a separate load-error surface

### Shell Error Surface

Responsibilities:

- Render the dedicated load-failure surface when both users and sections fail together

Ownership:

- Rendered by `page.tsx`
- Positioned below `ManageHeader` and above `ManageAlerts`
- Accepts shell-level load copy plus the shared refresh action
- Appears only in the dual-failure state

### `qa/manage/components/UsersTable.tsx`

Responsibilities:

- Keep user rows scannable
- Preserve inline role changes, verification, ban/unban, and delete actions

Changes:

- Restyle rows as lighter list cards or softer table rows
- Clarify status badges visually
- Tighten action grouping so the row still feels efficient

Contract:

- Receives `users`
- Receives `currentUserId`
- Receives row-level pending markers from `page.tsx`
- Emits `onChangeRole`
- Emits `onVerifyLawyer`
- Emits `onToggleBan`
- Emits `onDelete`
- Does not own request or retry state

### `qa/manage/components/SectionsTable.tsx`

Responsibilities:

- Present sections consistently with the new admin shell
- Keep edit and delete affordances accessible

Changes:

- Match the same row system as users
- Reduce visual heaviness from the existing table chrome

Contract:

- Receives `folders`
- Receives section-row pending markers from `page.tsx`
- Emits `onEdit`
- Emits `onDelete`
- Does not own request or retry state
- Does not own edit drafts or save/cancel behavior

### `qa/manage/components/CreateSectionForm.tsx`

Responsibilities:

- Handle the shared section side-panel form for both create and edit modes without leaving the page

Changes:

- Match the smaller side-panel editor style
- Align input and action styling with the new AI review and site-wide forms
- Accept mode-specific heading and submit labels from `page.tsx`
- Remain presentation-only; create and edit save semantics stay owned by `page.tsx`

Contract:

- Receives the current section draft
- Receives current mode: `create | edit`
- Receives loading and disabled state for the active save action
- Receives field-level and submit-level errors from `page.tsx`
- Receives an optional refetch-failure message when a save succeeded but folders reload failed
- Receives an optional retry-refetch callback when a save succeeded but folders reload failed
- Emits `onDraftChange`
- Emits `onSave`
- Emits `onCancel`
- Never loads or mutates data directly
- Renders required-field validation for `name` and `displayName` from errors passed by `page.tsx`
- Displays submit errors passed down from `page.tsx`
- Server-backed validation failures such as duplicate names or invalid values remain submit-level messages in this phase
- Displays the refetch-failure recovery message and retry action inside the side-panel form area
- Keeps validation and submit errors visible without clearing the current draft

### `qa/components/PostDetailSection.tsx`

Responsibilities:

- Continue to power post moderation and editing
- Keep admin controls visually consistent with the new management workspace

In-scope visible children for this visual pass:

- `PostContent`
- `AnswersSection`
- `DiscussionsSection`

Child-component boundary:

- `PostContent`: in scope for card, button, badge, and spacing alignment only
- `AnswersSection`: in scope for list, editor box, and action-button styling only
- `DiscussionsSection`: in scope for thread list, reply box, and action-button styling only
- None of these child components gain new business logic, routing, or moderation actions in this phase

Changes:

- Align buttons, cards, badges, and spacing with the admin v2 system
- Preserve existing moderation actions and data flow
- Remain on the existing post detail route rather than being embedded into `/qa/manage`
- Limit this phase to token, spacing, badge, and button treatment updates plus only the minimal markup changes required to apply those styles
- Do not redesign the moderation information architecture or introduce new moderation actions
- Small local state-management fixes are allowed only when required to preserve the existing success, error, or pending behavior during the visual refresh

Allowed changes:

- Update class names, spacing wrappers, badge treatment, button treatment, and card surfaces
- Make only the minimal markup adjustments needed to attach the new visual treatment
- Add only the minimal local state wiring required to preserve existing pending, success, and error behavior during the visual pass

Implementation boundary:

- Shared visual primitives for this chunk live in existing QA-local class names and shared site tokens, not in the `/qa/manage` shell component tree
- Any minimal pending, success, or error preservation fixes live inside the touched moderation component that already owns that behavior; do not move moderation state upward into unrelated parents during the visual pass
- Chunk 2 test ownership stays with `PostDetailSection` plus whichever of `PostContent`, `AnswersSection`, and `DiscussionsSection` receive markup or state-touching changes
- Chunk 2 does not introduce a new shared moderation state container, route wrapper, or data-loading abstraction

Unchanged areas:

- Route structure
- Data loading logic
- Moderation action set
- Section ordering and information architecture
- Reply, answer, and discussion workflow semantics
- No new asynchronous flows, retries, or interaction modes

## Visual System

The admin refresh should borrow directly from the current v2 surfaces rather than inventing a second design language.

Use:

- Warm page background and off-white panel surfaces
- Muted green as the primary action and emphasis color
- Soft orange only for warning/high-attention accents
- Rounded corners and low-contrast borders
- Serif brand accents only where the main app already uses them; do not turn the admin interior into a display-heavy page

Avoid:

- Dark enterprise dashboard styling
- Saturated badge colors everywhere
- Multiple competing card treatments
- Large decorative overview panels that push operational content below the fold

### Styling Boundary

- Introduce a namespaced `admin-v2-*` style family for the refreshed admin shell inside `/qa/manage`
- Use the same color variables and surface tokens already established by v2
- Migrate refreshed admin components away from the older `manage-*` visual treatment as they are touched
- Do not introduce a separate third theme for admin pages
- Cross-route moderation surfaces such as `PostDetailSection` should reuse shared site-level v2 tokens and QA-local classes rather than importing `admin-v2-*` shell classes directly

In practice:

- `/qa/manage` uses `admin-v2-*` layout and component classes
- `PostDetailSection` uses the existing QA structure plus shared site tokens and QA-local classes
- The moderation entry in the left rail links to `/qa`, where admins select a post and open `PostDetailSection` inside the existing QA flow
- The authoritative v2 token source remains the existing site variables and shared surface styles already defined in `apps/web/app/refresh.css`
- Add new admin-specific classes only when an equivalent site-level token or utility does not already exist
- `PostDetailSection` should specifically reuse the `--site-*` variables, shared panel surface treatment, shared border/radius/shadow patterns, and shared button spacing conventions already expressed in `refresh.css`

## Interaction Design

### User Moderation

- Rows remain interactive and action-oriented
- Status badges indicate role, verification state, and ban state
- Inline actions remain the fastest path for operators
- Destructive actions still require confirmation
- While a row action is pending, the full user row disables and shows a busy state
- If an action fails, the row returns to its prior interactive state and the page shows a concise error
- Existing self-targeting guardrails remain unchanged: admins cannot ban, delete, or demote their own account from this table
- If the first users load fails before any successful users response, render only the users error block and retry action for that region
- If a later users refresh fails after at least one successful users load, keep the last rendered rows visible for context but disable all user actions until users reload succeeds

### Section Management

- Creating a section uses the shared side-panel form
- Editing a section should feel like working in a side editor panel rather than a separate dashboard module
- Save and cancel actions remain explicit and visible
- Save, delete, and create actions disable while their request is pending
- A failed section action preserves the current draft so the admin can retry
- If the first sections load fails before any successful sections response, render only the sections error block and retry action for that region
- If a later sections refresh fails after at least one successful sections load, keep the last rendered rows visible for context but disable section create, edit, and delete actions until sections reload succeeds

### Post Moderation

- Existing moderation controls stay in place functionally
- Visual treatment aligns to the new admin system
- Resolved, pinned, and category status remain easy to scan
- Pending actions should disable only the relevant moderation control instead of freezing the whole panel

## Loading, Empty, and Error States

- Loading should use calmer placeholders or concise status copy inside the new shell
- Empty states should be short and operational, not playful
- Errors should explain the failed action in plain language and remain dismissible
- Success messages should confirm the completed action without dominating the page
- Success confirmation uses the same lightweight inline success treatment already present on the page, not a new toast system

### Interaction State Matrix

| Area | Pending Behavior | Error Behavior | Success Behavior |
|------|------------------|----------------|------------------|
| Refresh/load | Keep shell visible, disable refresh button, show loading copy in content area | Dismissible page-level error | Silent data refresh |
| Role change | Disable the full user row during request | Restore prior value and re-enable the row with a concise page-level error | Small success confirmation |
| Verify lawyer | Disable the full user row during request | Re-enable the row and show concise error | Update badges immediately after reload |
| Ban/unban | Disable the full user row during request | Re-enable the row and preserve previous state | Update row badge after reload |
| Delete user | Disable the full user row after confirmation | Re-enable the row and show concise error | Remove row after reload |
| Create/edit section | Disable save button only for the active side-panel form | Preserve draft and show concise error | Keep updated data visible after reload |
| Delete section | Disable delete control for that row after confirmation | Re-enable row and show concise error | Remove row after reload |
| Post moderation actions | Disable only the clicked control while request is active | Restore control state and show concise error | Refresh post state inline |

### Mutation Reload Matrix

| Action | Optimistic Update | Reload Behavior |
|--------|-------------------|-----------------|
| User role change | No | Reload users only; if reload fails, unlock the row and surface a users retry path plus a concise page-level error |
| Verify lawyer | No | Reload users only; if reload fails, unlock the row and surface a users retry path plus a concise page-level error |
| Ban/unban user | No | Reload users only; if reload fails, unlock the row and surface a users retry path plus a concise page-level error |
| Delete user | No | Reload users only; if reload fails, keep the last rendered list visible, surface a users retry path plus a concise page-level error, and rely on the successful retry to reconcile the missing row |
| Create section | No | Reload folders before closing panel |
| Edit section | No | Reload folders before closing panel |
| Delete section | No | Reload folders only; if reload fails, keep the last rendered list visible, surface a sections retry path plus a concise page-level error, and rely on the successful retry to reconcile the removed row |

### Initial Load Matrix

| Users Load | Sections Load | Page Result |
|-----------|----------------|-------------|
| Success | Success | Render the full shell and all summary data |
| Success | Failure | Render the shell, user moderation content, and a dismissible section-specific error with retry |
| Failure | Success | Render the shell, section management content, and a dismissible user-specific error with retry |
| Failure | Failure | Render the header and sidebar, keep the main users and sections regions mounted with their inline error blocks, hide the section form panel, and show the global refresh action; do not render stale rows because neither dataset has ever loaded successfully |
| Refresh fails after prior success | Any | Keep the last successful content visible, surface the relevant inline retry path, and do not replace visible content with empty states |

Partial rendering is allowed when exactly one dataset succeeds. The page should not hide all successful content because a sibling request failed.

Stale-data rule:

- Stale rows are shown only after a dataset has already loaded successfully at least once in the current page lifetime
- Initial-load failures never render placeholder stale rows or stale metrics for that dataset

### Per-Region Loading Matrix

| Users | Sections | Region Behavior |
|-------|----------|-----------------|
| Loading | Loading | Keep shell mounted, show loading state in both main sections, hide section form interactions |
| Loading | Ready | Render sections content normally; users area shows its loading state |
| Ready | Loading | Render users content normally; sections area shows its loading state and section form stays disabled |

Retry rules:

- The top refresh action always retries both datasets
- Section-specific retry only retries sections
- User-specific retry only retries users

Dataset-specific error ownership:

- `ManageUsersSection` renders users-specific load errors and retry controls inline
- `ManageSectionsSection` renders sections-specific load errors and retry controls inline
- `ManageAlerts` remains reserved for the latest page-level action outcome
- `page.tsx` renders the shell-level load error when both datasets fail at once
- In the dual-failure state, the shell-level load error appears above the main content regions while the header refresh action remains available

### Feedback Routing Matrix

| Outcome | Surface |
|---------|---------|
| User or section mutation success | `ManageAlerts` only |
| User or section mutation failure | `ManageAlerts` only |
| Users dataset load failure | Inline in `ManageUsersSection` |
| Sections dataset load failure | Inline in `ManageSectionsSection` |
| Dual dataset load failure | Shell Error Surface |
| Post-save refetch failure for sections | Inline inside `CreateSectionForm` plus retry action |

Alert concurrency rule:

- `ManageAlerts` shows only the latest completed mutation outcome
- A newer mutation outcome replaces the previous one

### Empty State Matrix

| Area | Empty Condition | Required UI |
|------|-----------------|-------------|
| Users list | Users request succeeds with zero users | Show short operational copy in the users section: no users found |
| Sections list | Folders request succeeds with zero sections | Show short operational copy and keep the create action visible |
| Sidebar attention cards | Relevant count is zero | Render a `0` state without warning styling rather than hiding the card |
| Sidebar attention cards | Users dataset fails | Omit user-derived cards and keep only section-independent navigation plus the moderation link |
| Main stats | A metric depends on a failed dataset | Omit that metric and render the remaining successful stats only |

### `PostDetailSection` Acceptance Checklist

- Buttons, badges, spacing, and panel surfaces align visually with the refreshed admin look
- Existing moderation actions remain in the same route and same information architecture
- Pending moderation actions still disable only the relevant control
- Existing success and error behavior remains reachable and visible
- No new moderation actions, route changes, or structural rewrites are introduced in this phase

Implementation sequencing note:

- This spec is intended to produce one implementation plan with two chunks:
  - chunk 1: `/qa/manage`
  - chunk 2: `PostDetailSection` plus its visible children (`PostContent`, `AnswersSection`, `DiscussionsSection`)
- It should not be split into separate projects unless the product scope changes

### `/qa/manage` Acceptance Checklist

- Desktop layout renders as left rail, main column, and right section form column
- Mobile layout keeps the same units in a stacked order without hiding controls
- Users and sections can fail independently without collapsing the whole page
- Sections-specific errors and retry controls appear only in the sections area
- Users-specific errors and retry controls appear only in the users area
- The header refresh reloads both datasets together
- Dual-failure state keeps the shell visible, mounts both inline error regions, and hides the section form panel
- Header create action is disabled when sections data is unavailable
- User pending behavior follows the single-row lock rule
- Section create/edit mode switches close the previous mode before opening the next one
- Successful section save closes the panel only after folders refetch succeeds

## Data and API Impact

No backend changes are required for this phase.

The refreshed page continues using:

- `client.fetchFolders()`
- `client.fetchAllUsers()`
- Existing create/update/delete folder calls
- Existing role, verification, ban, and delete user calls
- Existing post update and moderation calls used by `PostDetailSection`

Derived summary counts should be computed from already-loaded user and folder data. No new post-count or moderation-summary API is introduced in this phase. This keeps the redesign self-contained and avoids coupling UI polish to new server work.

## Testing Strategy

Testing for implementation should cover:

- Component rendering for the new admin shell
- In-page navigation rendering and target presence
- Summary-card derivation from loaded data
- Left-rail attention cards use the intended metrics only and do not duplicate top stats
- Existing action handlers still firing correctly after markup changes
- Role/status badge rendering
- Create/edit section flows
- Row-level pending and disabled states for async actions
- Partial-load behavior when folders fail, users fail, or both fail
- User-derived sidebar and stat behavior when the users dataset is unavailable
- Empty-state rendering for users, sections, and omitted metrics
- Responsive layout sanity for the simplified shell
- Post moderation controls still rendering and remaining reachable
- Post moderation restyle does not regress pending, success, and error feedback for moderation actions
- `PostDetailSection` still satisfies the acceptance checklist above without route or IA changes

The implementation should favor focused component tests and existing frontend test patterns before introducing broad E2E coverage.

## Risks and Mitigations

### Risk: visual refactor breaks admin workflows

Mitigation:

- Keep business logic and handlers largely in place
- Limit the first pass to presentation and local composition changes
- Verify all existing actions manually after the redesign
- Preserve existing self-targeting and destructive-action guardrails, including browser confirmation flows already used by the page

### Risk: too much “v2 polish” reduces density

Mitigation:

- Preserve compact rows and inline actions
- Keep only a few summary cards
- Avoid introducing large marketing-style content blocks

### Risk: styling becomes split across old and new admin systems

Mitigation:

- Consolidate the refreshed admin styling into a focused set of admin-v2 classes
- Remove or stop relying on the heaviest old `manage-*` treatments where practical

## Out of Scope

- Breaking the admin area into multiple routed pages
- New moderation workflows or audit systems
- Search-backed filtering implementation
- Backend analytics endpoints
- Release engineering, branch promotion, Vercel protection changes, or production deployment work

## Success Criteria

The design is successful when:

- The admin UI visibly belongs to the same v2 product as the refreshed public pages
- Admins can still complete current tasks without extra clicks
- The page feels cleaner and more modern without becoming sparse or showy
- Post moderation controls and management controls feel like part of one system instead of separate generations of UI
