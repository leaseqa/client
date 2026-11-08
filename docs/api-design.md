# LeaseQA V2 API Design

This document summarizes the current app-level API contract used by the LeaseQA client. All paths are rooted at `/api`
and are served by the Express backend in the `leaseqa/server` repository.

## 1. Authentication

### `POST /api/auth/register`

Creates a new user and establishes a session.

Request fields:

- `username`
- `email`
- `password`
- optional `role`
- optional `lawyerVerification`

### `POST /api/auth/login`

Authenticates an existing user and establishes a session.

### `POST /api/auth/logout`

Destroys the current session.

### `GET /api/auth/session`

Returns the current signed-in user or an unauthorized error if no authenticated session exists.

## 2. Account and User Management

### `GET /api/users/me`

Returns the current signed-in user.

### `PATCH /api/users/me`

Updates the current user's editable profile fields.

### Admin-only user management

- `GET /api/users`
- `PATCH /api/users/:userId/role`
- `PATCH /api/users/:userId/verify-lawyer`
- `PATCH /api/users/:userId/ban`
- `DELETE /api/users/:userId`

## 3. Activity and Notifications

### `GET /api/activity`

Returns recent account activity for the signed-in user.

Typical entries include:

- created AI review
- posted a new question
- new answer on your question
- new follow-up on your thread
- post status changed

### `GET /api/activity/notifications`

Returns unread notification entries for the signed-in user.

### `POST /api/activity/notifications/read`

Marks one or more notification entries as read.

Request body:

```json
{
  "ids": ["activity-id-1", "activity-id-2"]
}
```

## 4. AI Review and RAG Sessions

### `GET /api/rag/sessions`

Returns the current user's recent AI review sessions where available.

### `GET /api/rag/sessions/:sessionId`

Returns a single AI review session.

### `POST /api/rag/sessions`

Creates a new RAG session from:

- pasted text, or
- a single uploaded `PDF` / `DOCX`

The request may also include an `initialQuestion`; the session then comes back with its first answer. The web client
sends one for both sources.

### `POST /api/rag/sessions/:sessionId/messages`

Adds a follow-up question to an existing AI review session and returns the updated conversation state.

### Streaming the two model calls

Both `POST` calls above can stream. A request with `Accept: text/event-stream` gets server-sent events; any other
request (the eval runner, curl) gets the JSON envelope as before. The web client always streams.

| Event    | `data`                                                                | Meaning                                                         |
|----------|-----------------------------------------------------------------------|-----------------------------------------------------------------|
| `status` | `{ "stage": "indexing" \| "retrieving" \| "generating" }`             | The work has reached this stage. `indexing` only on creation.   |
| `delta`  | `{ "part": "summary", "text" }` or `{ "part": "bullet", "index", "text" }` | Text to append to the answer's summary or to one bullet.  |
| `done`   | `{ "data": ... }`                                                     | The same body the JSON response carries. Always last.           |
| `error`  | `{ "error": { "code", "message" }, "status" }`                        | The call failed after streaming began; `status` is what the JSON response would have used. Always last. |

- Deltas are a draft. The `done` payload is the answer that counts: it can drop bullets the evidence does not support,
  or replace the answer with the abstention message.
- A failure before the first event (validation, a missing or foreign session, a source still indexing) keeps its own
  HTTP status and JSON error body.
- A `: keep-alive` comment line arrives every 15 seconds while the model works.
- If the client disconnects, the server still finishes the answer and stores it.

## 5. Posts

### `GET /api/posts`

Returns the post feed, optionally filtered by:

- `folder`
- `search`
- `role`
- `audience`

### `GET /api/posts/:postId`

Returns a full post detail payload including:

- post metadata
- answers
- discussion tree
- author information

### `POST /api/posts`

Creates a new post.

Key fields:

- `summary`
- `details`
- `folders`
- optional `urgency`
- optional `audience`

### `PUT /api/posts/:postId`

Updates an existing post.

### `DELETE /api/posts/:postId`

Deletes a post. Admin-only in the current implementation.

### `PATCH /api/posts/:postId/pin`

Pins or unpins a post. Admin-only.

### `POST /api/posts/:postId/attachments`

Adds attachments to a post through multipart upload.

## 6. Answers

### `POST /api/answers`

Creates a new answer for a post.

Key fields:

- `postId`
- `content`
- `answerType`

### `PUT /api/answers/:answerId`

Updates an answer.

### `DELETE /api/answers/:answerId`

Deletes an answer.

### `POST /api/answers/:answerId/accept`

Marks an answer as accepted and resolves the related post where allowed.

## 7. Discussions

### `POST /api/discussions`

Creates a root follow-up or nested reply.

Key fields:

- `postId`
- optional `parentId`
- `content`

### `PATCH /api/discussions/:discussionId`

Edits a discussion entry.

### `PATCH /api/discussions/:discussionId/resolve`

Toggles resolution state where allowed.

### `DELETE /api/discussions/:discussionId`

Deletes a discussion subtree.

## 8. Sections and Moderation

### Sections

- `GET /api/folders`
- `POST /api/folders`
- `PUT /api/folders/:_id`
- `DELETE /api/folders/:_id`

### Moderation

- `POST /api/moderation/posts/:postId/hide`

### Stats

- `GET /api/stats/overview`

## 9. Error Shape

The backend uses a structured error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Common codes include:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `INTERNAL_ERROR`

## 10. Notes

- This is a current behavior summary, not a generated OpenAPI spec
- Historical references to `/api/ai-review` and NextAuth are stale and should not be used for current client work
