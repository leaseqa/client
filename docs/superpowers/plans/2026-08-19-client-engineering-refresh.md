# LeaseQA Client Engineering Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a secure, typed Node 24 frontend baseline and refactor the client API and AI review boundaries without changing product behavior.

**Architecture:** Centralize HTTP concerns in `app/lib/api`, treat rich HTML as untrusted at render time, and move AI review server state into React Query hooks while keeping focused presentational components. Keep workspace packages independently type-checkable.

**Tech Stack:** Node.js 24 LTS, Next.js 16, React 19, TypeScript, Axios, TanStack React Query, DOMPurify/isomorphic-dompurify, Vitest, Playwright, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-19-engineering-refresh.md`

## Global Constraints

- Preserve current routes, visible copy, and server JSON contracts.
- Preserve cookie-based authentication and same-origin `/api` proxy behavior.
- Keep the existing webpack build until a measured Turbopack migration is handled separately.
- No real credentials, `.env` contents, or production data enter tests or commits.
- Every behavior change follows red-green-refactor and commits only after its focused and regression tests pass.

---

### Task 1: Node, dependency, TypeScript, CI, and Vercel baseline

**Files:**
- Modify: `.nvmrc`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Create: `packages/config/tsconfig.json`
- Create: `packages/ui/tsconfig.json`
- Modify: `apps/web/package.json`
- Modify: `.github/workflows/ci.yml`
- Modify: `apps/web/vercel.json`
- Test: `scripts/runtime-contract.test.mjs`

**Interfaces:**
- Produces: Node `24.x`, `npm run typecheck`, `npm test`, `npm run e2e`, and deterministic CI/Vercel install contracts used by all later tasks.
- Consumes: Existing workspace names `@leaseqa/web`, `@leaseqa/config`, and `@leaseqa/ui`.

- [ ] **Step 1: Add a failing executable runtime contract test**

```js
test("declares Node 24 across the workspace", async () => {
  assert.equal((await readFile(".nvmrc", "utf8")).trim(), "24.19.0");
  assert.equal(rootPackage.engines.node, "24.x");
  assert.equal(vercel.installCommand, "npm ci");
});
```

- [ ] **Step 2: Run the test and verify it fails against Node 25/20 and `npm install`**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH node --test scripts/runtime-contract.test.mjs`

- [ ] **Step 3: Implement the runtime and workspace typecheck contract**

Set `.nvmrc` to `24.19.0`, root `engines.node` to `24.x`, and `packageManager` to `npm@11.17.0`. Add root scripts for typecheck/test/e2e. Give `packages/config` and `packages/ui` valid composite TypeScript configs extending `tsconfig.base.json`; make the root project references resolve and `tsc -b --pretty false` pass.

- [ ] **Step 4: Upgrade and remove dependencies**

Remove unused `next-auth` and frontend `mongoose`. Upgrade Next.js, Axios, PostCSS, Vitest within major 3, Playwright, and transitive lockfile packages to patched compatible releases. Align `@types/react` and `@types/react-dom` with React 19. Do not apply semver-major changes unrelated to a confirmed vulnerability or the test toolchain.

- [ ] **Step 5: Update CI and Vercel**

Use Node 24 and `npm ci`; run typecheck, lint, unit tests, build, and audit at high severity. Add a Node 26 compatibility lane for typecheck/test/build. Keep E2E in the client repository and require an explicit server checkout SHA/input rather than silently using server `main`. Set Vercel install command to `npm ci` and runtime environment to Node 24.

- [ ] **Step 6: Run baseline verification and commit**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm ci`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run typecheck`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run lint`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm test`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run build`

```bash
git add .nvmrc package.json package-lock.json tsconfig.json packages apps/web/package.json .github/workflows/ci.yml apps/web/vercel.json scripts/runtime-contract.test.mjs docs/superpowers
git commit -m "build: establish Node 24 client baseline"
```

### Task 2: Centralized typed API boundary

**Files:**
- Create: `apps/web/app/lib/api/client.ts`
- Create: `apps/web/app/lib/api/client.test.ts`
- Create: `apps/web/app/lib/api/types.ts`
- Modify: `apps/web/app/client.ts`
- Modify: `apps/web/app/auth/client.ts`
- Modify: `apps/web/app/account/client.ts`
- Modify: `apps/web/app/qa/client.ts`
- Modify: `apps/web/app/ai-review/client.ts`
- Modify: `apps/web/app/auth/login/page.tsx`
- Modify: `apps/web/app/auth/register/page.tsx`

**Interfaces:**
- Produces: `apiClient`, `apiUrl(path)`, `oauthUrl(provider)`, `ApiError`, and `unwrapData<T>(response)`.
- Consumes: Server envelopes shaped as `{ data: T }` and same-origin `/api` fallback.

- [ ] **Step 1: Write failing API-boundary tests**

```ts
it("uses same-origin api paths when no public server is configured", () => {
  expect(apiUrl("/posts", {})).toBe("/api/posts");
});

it("normalizes server errors without exposing axios internals", async () => {
  await expect(requestWithRejectedAdapter({ response: { status: 403, data: { error: { code: "FORBIDDEN", message: "Denied" } } } }))
    .rejects.toMatchObject({ name: "ApiError", status: 403, code: "FORBIDDEN", message: "Denied" });
});
```

- [ ] **Step 2: Run the test and verify it fails because the shared client does not exist**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm exec vitest run -- apps/web/app/lib/api/client.test.ts`

- [ ] **Step 3: Implement the shared client**

Create one Axios instance with credentials, a 20-second timeout, response-envelope extraction, AbortSignal support, and normalized `ApiError`. Resolve browser requests to same-origin `/api` unless an explicit public origin is configured. Derive Google OAuth URLs through the same resolver so production never falls back to localhost.

- [ ] **Step 4: Migrate every domain client without changing exported domain functions**

Remove local Axios instances, `HOST`, and duplicate `API_BASE` declarations. Keep existing function names and returned domain shapes so pages do not need unrelated changes.

- [ ] **Step 5: Run focused tests, unit suite, typecheck, and commit**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm exec vitest run -- apps/web/app/lib/api/client.test.ts`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run typecheck`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm test`

```bash
git add apps/web/app
git commit -m "refactor: centralize client API boundary"
```

### Task 3: Rich-text browser boundary and typed session state

**Files:**
- Create: `apps/web/app/lib/safeHtml.ts`
- Create: `apps/web/app/lib/safeHtml.test.ts`
- Modify: `apps/web/app/qa/[id]/components/PostContent.tsx`
- Modify: `apps/web/app/qa/[id]/components/AnswersSection.tsx`
- Modify: `apps/web/app/qa/[id]/components/DiscussionsSection.tsx`
- Modify: `apps/web/app/store.ts`
- Modify: `apps/web/app/auth/SessionLoader.tsx`

**Interfaces:**
- Produces: `sanitizeServerHtml(html: string): string` and concrete `SessionUser`/`SessionState` types.
- Consumes: Sanitized server content, while retaining browser-side defense in depth.

- [ ] **Step 1: Write a failing sanitization test**

```ts
it("removes executable markup while preserving basic rich text", () => {
  const result = sanitizeServerHtml('<p>Hello</p><img src=x onerror="alert(1)"><a href="javascript:alert(1)">bad</a>');
  expect(result).toContain("<p>Hello</p>");
  expect(result).not.toMatch(/onerror|javascript:|<script/i);
});
```

- [ ] **Step 2: Run it and verify failure because the sanitizer does not exist**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm exec vitest run -- apps/web/app/lib/safeHtml.test.ts`

- [ ] **Step 3: Implement isomorphic sanitization and migrate all HTML sinks**

Use an isomorphic DOMPurify implementation with an explicit semantic-tag and safe-attribute allowlist. Components may retain `dangerouslySetInnerHTML` only with the direct result of `sanitizeServerHtml`.

- [ ] **Step 4: Replace Redux `any` session payloads with concrete types**

Define tenant/lawyer/admin role union, lawyer verification, and nullable session user. Type `setSession` and all selectors without assertions that hide malformed API data.

- [ ] **Step 5: Run focused tests, typecheck, lint, unit suite, and commit**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm exec vitest run -- apps/web/app/lib/safeHtml.test.ts`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run typecheck`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run lint`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm test`

```bash
git add apps/web/app apps/web/package.json package-lock.json
git commit -m "fix: sanitize rich content at the browser boundary"
```

### Task 4: AI review server-state and component decomposition

**Files:**
- Create: `apps/web/app/ai-review/hooks/useRagSessions.ts`
- Create: `apps/web/app/ai-review/hooks/useRagSession.ts`
- Create: `apps/web/app/ai-review/hooks/useRagConversation.ts`
- Create: `apps/web/app/ai-review/hooks/useRagConversation.test.tsx`
- Create: `apps/web/app/ai-review/components/SessionList.tsx`
- Create: `apps/web/app/ai-review/components/SourceUploader.tsx`
- Create: `apps/web/app/ai-review/components/Conversation.tsx`
- Create: `apps/web/app/ai-review/components/AnswerSections.tsx`
- Modify: `apps/web/app/ai-review/page.tsx`
- Modify: `apps/web/components/providers.tsx`
- Modify: `apps/web/app/ai-review/view-model.ts`
- Modify: `apps/web/app/ai-review/view-model.test.ts`

**Interfaces:**
- Produces: Query keys `ragKeys.sessions`, `ragKeys.session(id)`, mutations for create/message/delete, and presentational components receiving typed props only.
- Consumes: Shared API functions from Task 2 and the existing server response shapes.

- [ ] **Step 1: Write failing hook tests for polling and optimistic message state**

With a real `QueryClient` and fake HTTP adapter, assert session detail polls only while status is processing, stops on ready/error, cancels on unmount, and replaces an optimistic user message with server-confirmed history without duplication.

- [ ] **Step 2: Run the focused test and verify current page-local effects cannot satisfy it**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm exec vitest run -- apps/web/app/ai-review/hooks/useRagConversation.test.tsx`

- [ ] **Step 3: Implement query keys and hooks**

Use TanStack Query for lists, detail polling, source creation, message sending, invalidation, cancellation, and normalized errors. Keep ephemeral textarea/upload animation state local; keep server state out of Redux and page-level manual effects.

- [ ] **Step 4: Extract focused presentation components**

Split session navigation, source upload, conversation timeline, and structured answer sections. Each component receives serializable typed props and callbacks; no component creates an HTTP client. Keep current copy, route, accessibility labels, and loading/empty/error states.

- [ ] **Step 5: Reduce `page.tsx` to orchestration and add behavior tests**

The page selects the active session, connects hooks, and composes components. Extend view-model tests for abstentions, missing citations, pending messages, and retryable errors using literal fixtures.

- [ ] **Step 6: Run focused and full client verification, then commit**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm exec vitest run -- apps/web/app/ai-review`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run typecheck`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run lint`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm test`

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run build`

```bash
git add apps/web/app/ai-review apps/web/components/providers.tsx
git commit -m "refactor: isolate AI review server state"
```
