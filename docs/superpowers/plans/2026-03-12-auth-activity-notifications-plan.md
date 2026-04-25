# Auth, Activity, and Notifications V2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (
`- [ ]`) syntax for tracking.

**Goal:** Replace the remaining auth/account/notification placeholders with real persisted behavior, keep AI review
history backed by real sessions, and add end-to-end coverage for the missing user flows.

**Architecture:** Add a single server-side `Activity` module in the Express/Mongoose backend, emit activity records from
existing RAG/posts/answers/discussions write paths, and expose separate account-feed and unread-notification queries
over that shared model. On the frontend, reuse the current v2 surfaces by wiring `/account`, `HeaderBar`, and
`ai-review` to real data while preserving guest behavior and adding auth/activity e2e coverage.

**Tech Stack:** Next.js App Router, React, Redux Toolkit, React-Bootstrap, Playwright, Vitest, Express, Mongoose,
`node:test`

---

## File Map

### Server files

- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/schema.js`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/model.js`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/dao.js`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/service.js`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/routes.js`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/routes.test.js`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/index.js`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/RAG/service.js`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Posts/routes.js`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Answers/routes.js`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Discussions/routes.js`
- Create or modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Auth/routes.test.js`

### Client files

- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/components/ActivityTimeline.tsx`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/page.test.tsx`
- Create:
  `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/components/navigation/HeaderBar/NotificationsMenu.tsx`
- Create:
  `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/components/navigation/HeaderBar/NotificationsMenu.test.tsx`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/page.tsx`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/client.ts`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/auth/SessionLoader.tsx`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/auth/client.ts`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/store.ts`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/ai-review/page.tsx`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/components/navigation/HeaderBar.tsx`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/refresh.css`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/e2e/auth-session.spec.ts`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/e2e/activity-notifications.spec.ts`

---

## Chunk 1: Backend Activity Feed and Auth Coverage

### Task 1: Add the failing Activity route tests

**Files:**

- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/routes.test.js`
- Reference: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/RAG/routes.test.js`

- [ ] **Step 1: Write the failing tests for activity listing and mark-read**

```js
test("lists activity for the current user newest first", async () => {
  const response = await request(app)
    .get("/api/activity")
    .set("Cookie", authCookie);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 2);
  assert.equal(response.body.data[0].type, "answer_received");
});

test("lists only unread notification-surface items in the bell endpoint", async () => {
  const response = await request(app)
    .get("/api/activity/notifications")
    .set("Cookie", authCookie);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.every((item) => item.readAt === null), true);
});

test("marks notification items read for the current user", async () => {
  const response = await request(app)
    .post("/api/activity/notifications/read")
    .set("Cookie", authCookie)
    .send({ ids: [activityId] });

  assert.equal(response.status, 200);
  assert.ok(response.body.data.updatedCount >= 1);
});
```

- [ ] **Step 2: Run the new test file to verify RED**

Run: `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/routes.test.js`

Expected: FAIL because the Activity module and routes do not exist yet.

- [ ] **Step 3: Implement the Activity model, DAO, service, and routes**

Create minimal server files:

- `schema.js` with `userId`, `type`, `title`, `summary`, `href`, `surface`, `readAt`, `metadata`, timestamps
- `dao.js` with:
  - `createActivity`
  - `listActivityForUser`
  - `listUnreadNotificationsForUser`
  - `markActivitiesRead`
- `service.js` with activity factory helpers for each event type
- `routes.js` with the three endpoints from the spec

- [ ] **Step 4: Wire the new router into the Express app**

Modify `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/index.js` to mount `/api/activity`.

- [ ] **Step 5: Re-run the activity test file to verify GREEN**

Run: `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/routes.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server add LeaseQA/Activity index.js
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server commit -m "feat: add activity feed api"
```

### Task 2: Add failing auth/session coverage

**Files:**

- Create or modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Auth/routes.test.js`
- Reference: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Auth/routes.js`

- [ ] **Step 1: Write failing tests for register, login, session, and logout**

```js
test("register creates a user and starts a session", async () => {
  const response = await request(app).post("/api/auth/register").send({
    username: "Fresh Tenant",
    email: uniqueEmail,
    password: "leaseqa-e2e-user",
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.email, uniqueEmail);
  assert.ok(response.headers["set-cookie"]);
});

test("session returns the logged-in user after login", async () => {
  const login = await request(app).post("/api/auth/login").send({
    email: seededEmail,
    password: seededPassword,
  });
  const cookie = login.headers["set-cookie"];
  const session = await request(app).get("/api/auth/session").set("Cookie", cookie);

  assert.equal(session.status, 200);
  assert.equal(session.body.data.email, seededEmail);
});

test("logout clears the session", async () => {
  const logout = await request(app).post("/api/auth/logout").set("Cookie", authCookie);
  const session = await request(app).get("/api/auth/session").set("Cookie", authCookie);

  assert.equal(logout.status, 200);
  assert.equal(session.status, 401);
});
```

- [ ] **Step 2: Run the auth route tests to verify RED**

Run: `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Auth/routes.test.js`

Expected: FAIL until the test harness and missing auth assertions are in place.

- [ ] **Step 3: Make the minimal auth fixes needed for GREEN**

Likely changes:

- normalize response payloads if the tests expose session/user shape issues
- ensure logout clears `connect.sid` consistently
- ensure register and login return session-backed sanitized users

- [ ] **Step 4: Re-run the auth test file**

Run: `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Auth/routes.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server add LeaseQA/Auth/routes.js LeaseQA/Auth/routes.test.js
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server commit -m "test: cover auth session flows"
```

### Task 3: Add failing activity-emission tests on existing write paths

**Files:**

- Modify or create tests near:
  - `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/RAG/sessionBootstrap.test.js`
  - `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Posts/routes.test.js`
  - `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Answers/routes.test.js`
  - `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Discussions/routes.test.js`

- [ ] **Step 1: Write failing tests for emitted activity records**

Add cases that assert:

- logged-in RAG session creation writes `ai_review_created`
- post creation writes `post_created`
- pin/resolve writes `post_status_changed` for the author
- answer creation writes `answer_received`
- reply creation writes `discussion_received` for the correct recipient

- [ ] **Step 2: Run the targeted failing tests**

Run:

- `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/RAG/sessionBootstrap.test.js`
- `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Answers/routes.test.js`
- `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Discussions/routes.test.js`

Expected: FAIL on missing activity assertions and/or missing route side effects.

- [ ] **Step 3: Add minimal activity writes in the success paths**

Modify:

- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/RAG/service.js`
- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Posts/routes.js`
- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Answers/routes.js`
- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Discussions/routes.js`

Implementation rules:

- fail soft on activity write errors
- never notify the actor about their own inbound event
- keep primary API behavior unchanged

- [ ] **Step 4: Re-run the targeted tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server add LeaseQA/RAG/service.js LeaseQA/Posts/routes.js LeaseQA/Answers/routes.js LeaseQA/Discussions/routes.js LeaseQA/Activity
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server commit -m "feat: emit user activity events"
```

---

## Chunk 2: Frontend Account, Notifications, and AI Review History

### Task 4: Add failing unit tests for the account activity timeline

**Files:**

- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/page.test.tsx`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/components/ActivityTimeline.tsx`

- [ ] **Step 1: Write failing tests for authenticated, guest, and error states**

```tsx
it("renders recent activity entries for an authenticated user", async () => {
  render(<AccountPage />, { preloadedState: authenticatedState });
  expect(await screen.findByText("Recent activity")).toBeInTheDocument();
  expect(screen.getByText("AI review created")).toBeInTheDocument();
});

it("shows a sign-in empty state for guest users", async () => {
  render(<AccountPage />, { preloadedState: guestState });
  expect(await screen.findByText(/saved history starts after sign-in/i)).toBeInTheDocument();
});

it("shows an inline retry state when the activity request fails", async () => {
  render(<AccountPage />, { preloadedState: authenticatedState });
  expect(await screen.findByRole("button", { name: /retry activity/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the account page test file to verify RED**

Run:
`pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web test -- apps/web/app/account/page.test.tsx`

Expected: FAIL because the activity timeline and data wiring do not exist yet.

- [ ] **Step 3: Add account activity API helpers and UI components**

Modify `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/client.ts` to add:

- `fetchActivity`
- `fetchNotifications`
- `markNotificationsRead`

Implement `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/components/ActivityTimeline.tsx` and
wire `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/account/page.tsx`.

- [ ] **Step 4: Re-run the account test file**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add apps/web/app/account
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "feat: add account activity timeline"
```

### Task 5: Add failing unit tests for the header notification bell

**Files:**

- Create:
  `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/components/navigation/HeaderBar/NotificationsMenu.tsx`
- Create:
  `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/components/navigation/HeaderBar/NotificationsMenu.test.tsx`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/components/navigation/HeaderBar.tsx`

- [ ] **Step 1: Write failing tests for unread state, empty state, and mark-read navigation**

```tsx
it("shows an unread dot when unread notifications exist", () => {
  render(<NotificationsMenu items={[unreadNotification]} />);
  expect(screen.getByLabelText(/open notifications/i)).toHaveClass("has-unread");
});

it("renders the empty state when there are no unread notifications", () => {
  render(<NotificationsMenu items={[]} />);
  expect(screen.getByText("No new notifications")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the notification unit test to verify RED**

Run:
`pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web test -- apps/web/components/navigation/HeaderBar/NotificationsMenu.test.tsx`

Expected: FAIL because the extracted component does not exist yet.

- [ ] **Step 3: Implement the notification menu and wire the dropdown**

Implementation rules:

- reuse v2 card/dropdown styling from `refresh.css`
- do not auto-mark read on open
- mark read on click before route transition when possible

- [ ] **Step 4: Re-run the notification unit test**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add apps/web/components/navigation/HeaderBar apps/web/components/navigation/HeaderBar.tsx apps/web/app/refresh.css
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "feat: wire notifications menu"
```

### Task 6: Add failing tests for real AI review history

**Files:**

- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/store.ts`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/ai-review/page.tsx`
- Modify or create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/ai-review/page.test.tsx`

- [ ] **Step 1: Write failing tests that prove placeholder AI history is gone**

Add assertions that:

- authenticated history comes from server session fetches
- guest history still shows the current guest-session hint
- no seeded review cards render when the server returns empty history

- [ ] **Step 2: Run the targeted AI review test file to verify RED**

Run:
`pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web test -- apps/web/app/ai-review/page.test.tsx`

Expected: FAIL because store-seeded history still exists.

- [ ] **Step 3: Remove placeholder AI history state and wire real session data**

Implementation rules:

- remove the seed items from `store.ts`
- keep any session/auth state still needed elsewhere
- do not break guest behavior

- [ ] **Step 4: Re-run the AI review test file**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add apps/web/app/store.ts apps/web/app/ai-review/page.tsx apps/web/app/ai-review/page.test.tsx
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "feat: persist ai review history"
```

---

## Chunk 3: End-to-End Auth and Activity Verification

### Task 7: Add failing auth/session e2e coverage

**Files:**

- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/e2e/auth-session.spec.ts`
- Reference: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/e2e/admin-smoke.spec.ts`

- [ ] **Step 1: Write failing e2e tests for register, refresh restore, and logout**

Test cases:

- new tenant can register and land authenticated
- refresh keeps the user signed in
- logout clears the session and returns the UI to signed-out state

- [ ] **Step 2: Run the auth e2e spec to verify RED**

Run: `pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web e2e --grep "auth session"`

Expected: FAIL until the flow, fixtures, and UI hooks are complete.

- [ ] **Step 3: Fix the minimal client or server gaps exposed by the e2e**

Potential files:

- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/auth/login/page.tsx`
- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/auth/register/page.tsx`
- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/app/auth/SessionLoader.tsx`
- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Auth/routes.js`

- [ ] **Step 4: Re-run the auth e2e spec**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add apps/web/e2e/auth-session.spec.ts apps/web/app/auth
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "test: cover auth session flow"
```

### Task 8: Add failing activity + notification e2e coverage

**Files:**

- Create: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/apps/web/e2e/activity-notifications.spec.ts`

- [ ] **Step 1: Write failing e2e tests for activity and notifications**

Test cases:

- logged-in tenant creates an AI review and sees a new account activity entry
- logged-in tenant creates a post and sees it in account activity
- another user answers or replies and the tenant sees a bell notification
- clicking the bell item navigates and removes it from unread state

- [ ] **Step 2: Run the activity e2e spec to verify RED**

Run:
`pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web e2e --grep "activity notifications"`

Expected: FAIL until the backend events and frontend UI are wired correctly.

- [ ] **Step 3: Make the minimum fixes exposed by the e2e**

Touch only the files already introduced in Chunks 1 and 2 unless a real defect requires otherwise.

- [ ] **Step 4: Re-run the activity e2e spec**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client add apps/web/e2e/activity-notifications.spec.ts apps/web/components/navigation apps/web/app/account apps/web/app/ai-review
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client commit -m "test: cover activity and notifications"
```

### Task 9: Full verification and cleanup

**Files:**

- Verify both repos only

- [ ] **Step 1: Run the backend verification suite**

Run:

- `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Activity/routes.test.js`
- `node --test /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/LeaseQA/Auth/routes.test.js`
- `pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server test:rag`

Expected: PASS.

- [ ] **Step 2: Run the frontend verification suite**

Run:

- `pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web test`
-

`pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web e2e --grep "admin smoke|discussion threads|auth session|activity notifications"`

- `pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web lint`
- `pnpm --dir /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client --filter @leaseqa/web build`

Expected: PASS.

- [ ] **Step 3: Remove e2e-created data**

Use the same cleanup pattern already used for Playwright-generated posts/discussions and extend it to any new
auth/activity fixtures.

- [ ] **Step 4: Push both repos**

```bash
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client push origin main
git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server push origin main
```

- [ ] **Step 5: Verify production deployment endpoints**

Check:

- `https://leaseqa-client.vercel.app`
- `https://leaseqa-client.vercel.app/account`
- `https://leaseqa-client.vercel.app/ai-review`
- `https://leaseqa-server.onrender.com/api/health`

