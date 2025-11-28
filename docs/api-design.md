# API Design Draft

> REST-style design, all paths based on `/api`. GraphQL or Server Actions versions may be added later.

## 1. Authentication

### POST `/api/auth/register`
- **Description**: Register a new user (tenant or lawyer applicant).
- **Request Body**:
  ```json
  {
    "username": "Alice",
    "email": "alice@example.com",
    "password": "*******",
    "role": "tenant",
    "lawyerVerification": {
      "barNumber": "12345",
      "state": "MA"
    }
  }
  ```
- **Response**: `201 Created`, returns basic user info (excluding password).

### POST `/api/auth/login`
- Handled by NextAuth Credentials Provider, returns session.

### GET `/api/auth/session`
- Returns current logged-in user info.

## 2. AI Contract Review

### POST `/api/ai-review`
- **Auth**: Both tenants and lawyers can call this.
- **Request Body** (multipart/form-data):
  - `file`: PDF file (one of two options)
  - `contractText`: Text content
  - `contractType`: String (optional)
- **Flow**:
  1. Validate that at least file or text is provided.
  2. If file uploaded, extract text (backend TBD).
  3. Call Claude API to get analysis results.
  4. Write to `AIReviews` collection.
- **Response**:
  ```json
  {
    "reviewId": "6550...",
    "summary": "...",
    "riskLevels": {
      "high": ["..."],
      "medium": ["..."],
      "low": ["..."]
    },
    "recommendations": ["..."]
  }
  ```

### GET `/api/ai-review/:id`
- Returns specified review result, including original report.

## 3. Posts

### GET `/api/posts`
- **Query Parameters**:
  - `folder`: Category filter
  - `role`: Perspective (optional)
  - `search`: Search keyword
- **Response**: List of posts sorted by newest first.

### POST `/api/posts`
- **Request Body**:
  ```json
  {
    "summary": "Need to confirm if lease transfer clause is legal",
    "details": "<p>...</p>",
    "postType": "question",
    "visibility": "class",         // class | private
    "folders": ["lease_review", "rent_increase"],
    "fromAIReview": "6550...",     // optional, linked review
    "urgency": "high"              // optional
  }
  ```
- **Response**: `201 Created`, returns new post details.
- **Validation**: Summary ≤ 100 characters, at least one folder required.

### GET `/api/posts/:id`
- Returns post details, including answers and discussions (can be split into separate queries).

### PUT `/api/posts/:id`
- Update summary, details, folders, visibility, etc.

### DELETE `/api/posts/:id`
- Author/lawyer/admin permission; admins can delete rule-violating content.

## 4. Answers

### POST `/api/answers`
- **Request Body**:
  ```json
  {
    "postId": "654f...",
    "content": "<p>...</p>",
    "answerType": "lawyer_opinion"  // or community_answer
  }
  ```
- **Permissions**: `lawyer_opinion` for lawyers only, `community_answer` for both tenants and lawyers.

### PUT `/api/answers/:id`
- Edit answer, author or admin only.

### DELETE `/api/answers/:id`
- Author or admin can delete.

## 5. Discussions

### POST `/api/discussions`
- **Request Body**:
  ```json
  {
    "postId": "654f...",
    "parentId": "6550...",   // null for top-level
    "content": "I had a similar experience...",
    "isResolved": false
  }
  ```
- Top-level discussions for "follow-up discussions", nested levels for replies.

### PATCH `/api/discussions/:id/resolve`
- **Request Body**: `{ "isResolved": true }`
- **Permissions**: Post author, lawyer, or admin.

### DELETE `/api/discussions/:id`
- Author or admin.

## 6. Folders (Categories)

### GET `/api/folders`
- Returns all folders for frontend filter rendering.

### POST `/api/folders`
- **Permissions**: Admin only.
- **Request Body**: `{ "name": "utilities", "displayName": "Utilities" }`

### PUT `/api/folders/:id`
- Update name/description.

### DELETE `/api/folders/:id`
- Delete folder (need to handle associated posts strategy).

## 7. Statistics

### GET `/api/stats/overview`
- Returns metrics required by Rubric:
  ```json
  {
    "unreadPosts": 3,
    "unansweredPosts": 5,
    "totalPosts": 42,
    "lawyerResponses": 18,
    "tenantResponses": 64,
    "enrolledUsers": 137
  }
  ```
- Admin permission, other roles see filtered data as needed.

## 8. Moderation Tools

### POST `/api/moderation/posts/:id/hide`
- Admin hides or restores posts.

### POST `/api/moderation/users/:id/ban`
- Admin disables user (optional extension).

## 9. Error Response Standard

- Unified response structure:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Summary cannot be empty",
      "details": { ... }
    }
  }
  ```
- Common error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`.

## 10. Future Extensions

- WebSocket/Server-Sent Events for real-time updates (new answers, discussions).
- Admin endpoints for exporting/importing test data.
- AI review result versioning and feedback endpoints.