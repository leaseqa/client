# LeaseQA Frontend Experience Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a staged frontend refresh that fixes anonymous rendering and state honesty, then improves the homepage, AI review workspace, community states, accessibility, and shared styling without changing routes or server contracts.

**Architecture:** Keep Next.js App Router, Redux session state, TanStack Query, React Bootstrap, and the existing warm visual identity. Introduce explicit view-state components and route-scoped styles incrementally; visual stages stop at a screenshot approval gate before rendered source changes.

**Tech Stack:** Next.js 16, React 19, TypeScript, Redux Toolkit, TanStack Query, React Bootstrap, CSS Modules/global design tokens, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-21-frontend-experience-refresh.md`

## Global Constraints

- Preserve existing routes and backend JSON contracts.
- Preserve the warm neutral palette, olive accent, and wordmark. Use the approved homepage headline and CTA copy recorded in the spec.
- Do not add another UI framework.
- Before every rendered layout or styling change, show 1280x720 and 390x844 current-versus-target comparisons and wait for explicit user approval.
- Distinguish loading, empty, error, and permission states.
- Maintain minimum 44x44 touch targets on mobile.
- Run focused tests before implementation, after implementation, and before every stage commit.

---

### Task 1: Public shell renders while session restoration runs

**Files:**
- Create: `apps/web/app/auth/SessionLoader.test.tsx`
- Modify: `apps/web/app/auth/SessionLoader.tsx:9-40`
- Modify: `apps/web/components/providers.tsx:24-31`
- Test: `apps/web/app/auth/SessionLoader.test.tsx`

**Interfaces:**
- Consumes: `fetchSession(): Promise<unknown>`, Redux actions `setSession`, `setGuestSession`, and `signOut`.
- Produces: `SessionLoader({ children }): ReactNode` that renders children immediately and restores session state in the background.

- [x] **Step 1: Write a failing pending-session test**

```tsx
it("renders the public shell while session restoration is pending", () => {
  fetchSessionMock.mockReturnValue(new Promise(() => undefined));
  renderWithStore(<SessionLoader><h1>LeaseQA</h1></SessionLoader>);
  expect(screen.getByRole("heading", { name: "LeaseQA" })).toBeVisible();
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm exec vitest run -- apps/web/app/auth/SessionLoader.test.tsx`

Expected: FAIL because `SessionLoader` currently returns `null` until `fetchSession` settles.

- [x] **Step 3: Remove the render gate while preserving the restoration effect**

```tsx
export default function SessionLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  useEffect(() => {
    void restoreSession(dispatch);
  }, [dispatch]);
  return <>{children}</>;
}
```

Keep authenticated, guest, and unauthenticated dispatch behavior unchanged. Extract `restoreSession` only if needed to test the three settled outcomes without timers.

- [x] **Step 4: Add settled-state tests**

Cover authenticated response, stored guest fallback, and unauthenticated rejection. Assert the matching Redux state after each promise settles.

- [x] **Step 5: Run focused and existing auth tests**

Run: `npm exec vitest run -- apps/web/app/auth apps/web/e2e/auth-session.spec.ts`

- [x] **Step 6: Run client verification**

Run: `npm run typecheck && npm run lint && npm test`

- [x] **Step 7: Commit the functional shell fix**

```bash
git add apps/web/app/auth/SessionLoader.tsx apps/web/app/auth/SessionLoader.test.tsx apps/web/components/providers.tsx
git commit -m "fix: keep the public shell visible during session restore"
```

### Task 2: Honest remote-data states

**Files:**
- Create: `apps/web/components/ui/RemoteDataState.tsx`
- Create: `apps/web/components/ui/RemoteDataState.test.tsx`
- Modify: `apps/web/app/page.tsx:21-95,190-213`
- Modify: `apps/web/app/ai-review/components/SessionList.tsx:24-65`
- Modify: `apps/web/app/qa/page.tsx:42-240`
- Test: `apps/web/components/ui/RemoteDataState.test.tsx`

**Interfaces:**
- Produces: `RemoteDataState` with props `{ kind: "loading" | "empty" | "error" | "permission"; title: string; description?: string; action?: { label: string; onClick: () => void } }`.
- Consumes: existing query/load errors and refetch callbacks.

- [ ] **Step 1: Write component tests for all four variants**

```tsx
it.each(["loading", "empty", "error", "permission"] as const)("renders %s state", (kind) => {
  render(<RemoteDataState kind={kind} title={`${kind} title`} description="Details" />);
  expect(screen.getByText(`${kind} title`)).toBeVisible();
});
```

Add an action test that clicks Retry exactly once and an accessibility test that error uses `role="alert"` while loading uses `aria-live="polite"`.

- [ ] **Step 2: Run the focused test and verify the component is missing**

Run: `npm exec vitest run -- apps/web/components/ui/RemoteDataState.test.tsx`

- [ ] **Step 3: Implement the minimal shared state component without route styling changes**

Use semantic markup and existing typography/button classes only. Do not change layout in this step.

- [ ] **Step 4: Add route-level state tests**

Assert homepage statistics are absent on fetch failure, AI history shows retryable error copy, and QA load failure does not render `Nothing here yet`.

- [ ] **Step 5: Wire explicit errors and retry callbacks**

Homepage keeps SWR `error` and `isLoading`; QA stores `loadError`; AI history uses TanStack Query `refetch`. Replace raw Axios messages with `Could not load ...` copy and Retry.

- [ ] **Step 6: Run focused tests and commit**

Run: `npm exec vitest run -- apps/web/components/ui apps/web/app/ai-review apps/web/app/qa`

```bash
git add apps/web/components/ui apps/web/app/page.tsx apps/web/app/ai-review apps/web/app/qa
git commit -m "fix: distinguish loading empty and error states"
```

### Task 3: Homepage composition refresh

**Files:**
- Create: `apps/web/app/home/HomeJourney.tsx`
- Create: `apps/web/app/home/HomeJourney.test.tsx`
- Create: `apps/web/app/home/home.module.css`
- Modify: `apps/web/app/page.tsx:49-215`
- Modify: `scripts/check-home-hero-preview-structure.mjs`
- Test: `apps/web/app/home/HomeJourney.test.tsx`

**Interfaces:**
- Produces: `HomeJourney` rendering the fixed three-step domain narrative and route-scoped homepage classes.
- Consumes: optional valid `stats`; remote data never controls whether the hero has a visual anchor.

- [x] **Step 1: Generate current-versus-target desktop and mobile comparison images**

Capture current `/` at 1280x720 and 390x844. Generate a target with the approved headline and CTA copy, a stable lease-clause preview, one dominant CTA, a secondary text action, a clause-to-cited-guidance-to-verification-question narrative, and conditional statistics.

- [x] **Step 2: Show the comparison and stop for explicit user approval**

Do not edit `page.tsx`, homepage CSS, or HomeJourney until approval is received.

- [x] **Step 3: Write failing structure tests for the approved composition**

```tsx
expect(screen.getByRole("heading", { name: /Understand your lease/i })).toBeVisible();
expect(screen.getByText("Section 4. Security Deposit")).toBeVisible();
expect(screen.getByText("What the cited guidance says")).toBeVisible();
expect(screen.getByText("Question to verify")).toBeVisible();
expect(screen.queryByText("Live")).not.toBeInTheDocument();
```

- [x] **Step 4: Implement the approved homepage structure and route-scoped styles**

Keep the approved UPL-safe headline and current palette. Render the target visual anchor even with no posts. Do not render suggested actions or case-specific directives. Render metrics only after a successful response with at least one nonzero value.

- [x] **Step 5: Verify responsive structure and accessibility**

Run: `node scripts/check-home-hero-preview-structure.mjs && npm exec vitest run -- apps/web/app/home`

- [x] **Step 6: Capture after images and compare against the approved target**

Capture `/` at 1280x720 and 390x844. Reject the change if hierarchy, wrapping, or touch targets regress.

- [x] **Step 7: Run verification and commit**

Run: `npm run typecheck && npm run lint && npm test && npm run build`

```bash
git add apps/web/app/page.tsx apps/web/app/home scripts/check-home-hero-preview-structure.mjs
git commit -m "feat: refocus the renter homepage journey"
```

### Task 4: AI review workspace refresh

**Files:**
- Create: `apps/web/app/ai-review/components/SourceModeTabs.tsx`
- Create: `apps/web/app/ai-review/components/SourceModeTabs.test.tsx`
- Create: `apps/web/app/ai-review/ai-review.module.css`
- Modify: `apps/web/app/ai-review/page.tsx:303-356`
- Modify: `apps/web/app/ai-review/components/SourceUploader.tsx:20-83`
- Modify: `apps/web/app/ai-review/components/SessionList.tsx:15-68`
- Modify: `apps/web/app/ai-review/components/Conversation.tsx:42-215`
- Modify: `apps/web/app/globals.css:4140-4553,4973-5034`
- Test: `apps/web/app/ai-review/components/SourceModeTabs.test.tsx`

**Interfaces:**
- Produces: `SourceModeTabs({ mode, onModeChange })` where mode is `"upload" | "paste"`; desktop workspace grid and mobile linear flow.
- Consumes: existing `createSession`, session list, active session, and conversation callbacks without server changes.

- [ ] **Step 1: Generate current-versus-target desktop and mobile comparison images**

Target desktop uses a source/history rail and primary conversation workspace. Target mobile keeps the source input first and collapses it to a compact summary after session creation.

- [ ] **Step 2: Show the comparison and stop for explicit user approval**

Do not edit AI review rendered components or styles until approval is received.

- [ ] **Step 3: Write failing mode and accessibility tests**

```tsx
expect(screen.getByRole("tab", { name: "Upload file" })).toHaveAttribute("aria-selected", "true");
await user.click(screen.getByRole("tab", { name: "Paste text" }));
expect(onModeChange).toHaveBeenCalledWith("paste");
expect(screen.getByLabelText("Lease clause or housing text")).toBeVisible();
```

- [ ] **Step 4: Implement tabs and preserve mutually exclusive input validation**

Only the active input mode remains interactive. Switching modes clears the inactive selection after confirmation is unnecessary because no server mutation has occurred.

- [ ] **Step 5: Implement the approved workspace composition**

Keep all existing hooks and request shapes. Move only presentation and ephemeral input mode state.

- [ ] **Step 6: Capture after images and run focused tests**

Run: `npm exec vitest run -- apps/web/app/ai-review`

- [ ] **Step 7: Run verification and commit**

Run: `npm run typecheck && npm run lint && npm test && npm run build`

```bash
git add apps/web/app/ai-review apps/web/app/globals.css
git commit -m "feat: turn AI review into a focused workspace"
```

### Task 5: Community states, touch targets, and motion preferences

**Files:**
- Modify: `apps/web/app/qa/components/QAToolbar.tsx:38-66`
- Modify: `apps/web/components/navigation/HeaderBar/MobileNav.tsx:25-84`
- Modify: `apps/web/app/qa/page.tsx:220-340`
- Modify: `apps/web/app/globals.css`
- Create: `apps/web/app/qa/components/QAToolbar.test.tsx`
- Test: `apps/web/app/qa/components/QAToolbar.test.tsx`

**Interfaces:**
- Produces: labelled community search, guest permission action, 44px mobile targets, and reduced-motion overrides.
- Consumes: existing router/query parameters and `RemoteDataState`.

- [ ] **Step 1: Generate current-versus-target mobile comparison images**

Show QA at 390x844 with improved segmented navigation, labelled search, and distinct guest/error/empty actions.

- [ ] **Step 2: Show the comparison and stop for explicit user approval**

- [ ] **Step 3: Write failing toolbar and guest-state tests**

Assert search is labelled `Search community questions`, resolved state has `aria-pressed`, and guest empty state links to login with the current route as `next`.

- [ ] **Step 4: Implement semantic controls and approved layout**

Use visible or visually-hidden labels. Set touch targets through shared mobile control rules rather than one-off padding.

- [ ] **Step 5: Add reduced-motion coverage**

Add one global media query that disables nonessential animation and shortens transitions when `prefers-reduced-motion: reduce` is active.

- [ ] **Step 6: Run responsive E2E, verification, and commit**

Run: `npm exec vitest run -- apps/web/app/qa apps/web/components/navigation && npm run e2e --workspace @leaseqa/web -- --grep "community|mobile"`

```bash
git add apps/web/app/qa apps/web/components/navigation apps/web/app/globals.css
git commit -m "fix: improve community states and mobile access"
```

### Task 6: Consolidate the design system without a framework rewrite

**Files:**
- Create: `apps/web/app/styles/tokens.css`
- Create: `apps/web/app/styles/base.css`
- Create: `apps/web/app/styles/shell.css`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx:1-2`
- Modify: `apps/web/app/COLOR_GUIDE.md`
- Modify: `apps/web/app/BUTTON_GUIDE.md`
- Modify: `packages/ui/src/components/button.tsx`
- Modify: `packages/ui/src/components/card.tsx`

**Interfaces:**
- Produces: one canonical token set and shared Button/Surface contracts exported by `@leaseqa/ui`.
- Consumes: approved rendered appearances from Tasks 3-5; no route may visually change during extraction.

- [ ] **Step 1: Inventory duplicate selectors and overridden tokens**

Record the duplicate `:root`, `body`, `.qa-toolbar`, `.qa-nav-tabs`, button, and card rules with their winning declarations.

- [ ] **Step 2: Write structural checks for one canonical token block**

Extend the existing Node structural scripts to assert one token import, no `transition: all`, and no legacy purple variable usage in active route styles.

- [ ] **Step 3: Extract tokens, base, and shell rules without visual changes**

Move winning declarations verbatim first. Do not rename tokens and change values in the same step.

- [ ] **Step 4: Adopt or remove the unused package primitives**

Use `@leaseqa/ui` for Button and Surface in the refreshed routes. If a primitive has no consumer after migration, remove it rather than preserving a second system.

- [ ] **Step 5: Update guides to the warm production system**

Document the actual olive, terracotta, warm neutral, typography, radius, touch-target, and motion rules.

- [ ] **Step 6: Run full visual and engineering verification**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run e2e`

- [ ] **Step 7: Run `design-review` in regression mode and commit**

Capture homepage, login, AI review, QA, resources, account, and admin at desktop and mobile sizes. Fix only regressions introduced by the extraction.

```bash
git add apps/web/app packages/ui scripts
git commit -m "refactor: consolidate the frontend design system"
```

### Task 7: Final QA and handoff

**Files:**
- Modify: `apps/web/e2e/auth-session.spec.ts`
- Create: `apps/web/e2e/public-routes.spec.ts`
- Modify: `docs/release-checklist.md`

**Interfaces:**
- Produces: deployment smoke coverage for public routes and a documented visual approval checklist.
- Consumes: all route and state contracts from Tasks 1-6.

- [ ] **Step 1: Add public-route smoke tests**

Test `/`, `/auth/login`, and guest `/ai-review` with authenticated, 401, delayed, and failed session responses. Assert a visible landmark or heading and no blank body.

- [ ] **Step 2: Run Playwright against the paired backend or explicit mocks**

Run: `npm run e2e --workspace @leaseqa/web -- --grep "public routes|auth session"`

- [ ] **Step 3: Run the complete release verification**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run e2e`

- [ ] **Step 4: Run `review`, then update the release checklist**

Record exact commands, visual approval sizes, and any backend-dependent tests that could not run.

- [ ] **Step 5: Commit final QA coverage**

```bash
git add apps/web/e2e docs/release-checklist.md
git commit -m "test: lock frontend refresh release behavior"
```
