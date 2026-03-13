# Auth, Activity, and Notifications V2 Design

## Summary

LeaseQA v2 already has working AI review, Q&A, moderation, and session-backed login flows, but the user-facing account surfaces are still partially stubbed. The gaps are concentrated in four places:

- registration, login persistence, and logout are implemented but under-tested
- the account page shows hard-coded recent activity
- the header notification bell is UI-only
- logged-in AI review history is mixed between real session data and placeholder client state

This design makes those surfaces real without introducing a second UI language or a separate event platform. The system will use one shared activity record model. `/account` renders the full feed, the header bell renders unread notification entries from the same feed, and AI review history remains session-centric while also producing activity records for the owning user.

## Goals

- Make auth flows production-complete: register, login, refresh/session restore, and logout
- Replace account and notification placeholders with real persisted data
- Keep UI consistent with the current v2 visual system
- Persist logged-in AI review history using the existing RAG session model instead of Redux seed data
- Add automated test coverage for the missing flows before and during implementation

## Non-Goals

- Email, push, or websocket notifications
- Notification preference settings
- Search, archive, or labels for account activity
- Guest activity persistence beyond the current guest-session behavior
- A generic async event bus or audit log platform

## Current Context

### Frontend

- `/account` already supports profile edit and logout, but `recentActions` is hard-coded in `apps/web/app/account/page.tsx`
- `HeaderBar` already has a notification dropdown shell, but the notifications array is empty in `apps/web/components/navigation/HeaderBar.tsx`
- `SessionLoader` already restores sessions from `/api/auth/session`
- `ai-review` already uses real RAG sessions, but client-side placeholder history still exists in `apps/web/app/store.ts`

### Backend

- Auth routes exist in `LeaseQA/Auth/routes.js`
- User profile updates exist in `LeaseQA/Users/routes.js`
- Q&A write paths exist in `LeaseQA/Posts/routes.js`, `LeaseQA/Answers/routes.js`, and `LeaseQA/Discussions/routes.js`
- RAG write paths exist in `LeaseQA/RAG/routes.js` and `LeaseQA/RAG/service.js`
- There is no server-side activity or notification model today

## Recommended Approach

Use a single persisted `Activity` model with a thin notification view instead of building separate recent-history and notification systems.

Each activity record belongs to one user and carries enough metadata to render both the account feed and the bell dropdown. Some activity types are informational only and appear only on `/account`; some are actionable and appear in both `/account` and the bell.

This approach is preferred because it:

- keeps history and notifications consistent
- fits the existing monolith-style Express/Mongoose architecture
- avoids over-engineering with an event bus
- allows AI review, posts, answers, and discussions to plug into the same user-facing surface

## Data Model

Add a new `Activity` collection with the following fields:

- `userId`: ObjectId of the affected user
- `type`: enum identifying the event
- `title`: short user-facing title
- `summary`: optional one-line supporting text
- `href`: optional in-app destination
- `surface`: enum of `account`, `notification`, or `both`
- `readAt`: nullable timestamp used only for notification-capable entries
- `createdAt`: timestamp
- `metadata`: object for lightweight event-specific data such as `postId`, `sessionId`, `answerId`, `discussionId`, or `actorId`

### Event Types in Scope

- `ai_review_created`
- `post_created`
- `post_status_changed`
- `answer_received`
- `discussion_received`

### Read Semantics

- `/account` shows all activity entries for the current user, newest first
- the bell shows only entries where `surface` is `notification` or `both`, and `readAt` is null
- opening the bell does not auto-mark items read
- clicking a notification or using a mark-read action will set `readAt`

## Activity Generation Rules

### AI Review

- When a logged-in user successfully creates a RAG session, write an `ai_review_created` activity for that user
- Guest RAG sessions do not create persisted activity entries
- AI review detail pages continue to read real RAG sessions; activity is only the feed summary layer

### Posts

- When a logged-in user creates a post, write a `post_created` activity to that same user with `surface=account`
- When an admin pins or resolves a post, write a `post_status_changed` activity for the post author

### Answers

- When an answer is created, write an `answer_received` activity for the post author if the actor is not the same person
- Lawyer/admin restrictions for writing answers remain unchanged

### Discussions

- When a discussion is created as a root follow-up, write a `discussion_received` activity for the post author if the actor differs
- When a discussion is created as a reply, prefer notifying the parent discussion author; if that is the same person as the actor, fall back to the post author if different
- Do not fan out to multiple recipients for one discussion in this iteration

## API Design

Add a new `LeaseQA/Activity` module with:

- `GET /api/activity`
  - requires an authenticated user
  - returns recent activity entries for `/account`
  - accepts `limit` and optional cursor/pagination parameters
- `GET /api/activity/notifications`
  - requires an authenticated user
  - returns unread notification entries for the bell
- `POST /api/activity/notifications/read`
  - requires an authenticated user
  - accepts one or more activity ids and sets `readAt`

No public notification endpoints are exposed to guests.

## Frontend Design

### Header Bell

- Keep the bell in the current header position and visual language
- Replace the empty dropdown with a real unread list, maximum five visible entries
- Show a small unread dot on the bell when unread items exist
- Each item displays a compact title and relative/short timestamp
- Empty state remains lightweight and friendly

### Account Page

- Replace `recentActions` with a real activity timeline section
- Keep the existing profile card and edit controls
- Render activity items as compact v2 cards with icon, title, summary, timestamp, and optional deep-link
- If the user is a guest, show a clear empty state explaining that saved history starts after sign-in

### AI Review

- Remove placeholder Redux history data
- Logged-in users continue to read real RAG sessions from the server as their history source
- Guest users continue to see only current guest-session history
- No visual redesign is needed beyond aligning empty/loading states with the rest of v2

## Auth Flow Completion

Auth routes already exist, so this project completes them primarily through tests and UX consistency:

- register should create a user, establish a session, and land the user in an authenticated state
- login should establish the session and survive refresh via `SessionLoader`
- logout should clear the server session, clear any guest-session client markers, and return the UI to the signed-out state
- account, notifications, and persisted history should gracefully handle `unauthenticated` and `guest` states

## Error Handling

- If `/api/activity` fails on `/account`, keep profile content visible and show an inline feed error with retry
- If `/api/activity/notifications` fails, keep the bell operable and show a small dropdown error state
- Failed mark-read calls should not crash navigation; preserve unread state and show the item again next open
- Activity write failures on the backend should not roll back the primary user action in this iteration; they should log and fail soft

## Testing Strategy

This project will be implemented with TDD.

### Backend Tests

- activity DAO and route tests
- auth tests for register, login, session restore, and logout
- activity generation tests on:
  - RAG session creation
  - post creation
  - post status changes
  - answer creation
  - discussion creation and reply routing

### Frontend Tests

- unit tests for notification badge/dropdown states
- unit tests for account activity rendering
- e2e tests for:
  - register -> login -> refresh -> logout
  - AI review creation -> account history visibility
  - post creation -> account history visibility
  - answer/discussion received -> bell notification and mark-read flow

## Rollout Notes

- The implementation should not change public routing structure
- The existing UI language in `refresh.css` remains the source of truth
- Because the feature spans both repos, the design doc lives once in the client repo docs and the server README/API notes can link back to it if needed
