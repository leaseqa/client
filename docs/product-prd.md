# LeaseQA V2 Product PRD

## Product Summary

LeaseQA helps Boston-area renters understand lease language, compare it against Massachusetts tenant-rights guidance, and ask follow-up questions in a community workflow that includes tenants, lawyers, and admins.

The live v2 product combines:

- AI lease review for pasted clauses and uploaded documents
- citation-backed follow-up chat
- community Q&A with answers and threaded discussion
- account history and notifications for signed-in users
- admin moderation and section management

## Users and Roles

### Guest

- Can open the site and use AI review in guest mode
- Cannot access saved account history
- Cannot post, answer, or manage community content

### Tenant

- Can register and sign in
- Can run AI review with saved history
- Can create posts, join discussions, and manage their own content
- Can see account activity and unread notifications

### Lawyer

- Has the same core flows as tenants
- Can post lawyer opinions where the backend allows lawyer-only answer types
- May carry verification state managed by admins

### Admin

- Can manage users and sections
- Can pin posts, change post status, verify lawyers, ban users, and remove content
- Uses the same public product shell with extra moderation controls

## Supported Inputs

### AI Review

- Pasted lease or clause text
- Single uploaded `PDF`
- Single uploaded `DOCX`

### Community

- Rich-text post details
- Rich-text answers
- Rich-text follow-up discussions and nested replies

## Supported Outputs

### AI Review Output

- A compact summary
- Short bullet points
- Inline citation links
- Supporting evidence from the uploaded source and, when relevant, handbook materials

### Account Output

- Recent activity timeline
- Unread notifications in the header bell

### Community Output

- Posts, answers, and threaded discussion
- Moderation state such as pinned or resolved

## Core User Flows

### 1. AI Review

1. User opens `/ai-review`
2. User pastes a clause or uploads a `PDF` / `DOCX`
3. For pasted text, the system immediately creates a session and returns a first answer
4. The user continues the conversation through follow-up prompts
5. Signed-in users can revisit saved sessions; guests only keep the current lightweight session flow

### 2. Account History and Notifications

1. Signed-in users open `/account`
2. The account page shows a recent activity feed
3. The header bell shows unread inbound notifications such as new answers or discussion replies
4. Opening a notification marks it read and navigates to the related content

### 3. Community Q&A

1. Signed-in user creates a post in `/qa`
2. Other users answer or join the follow-up discussion
3. Threaded discussions support multiple roots and nested replies
4. Relevant inbound actions create account activity and notifications

### 4. Admin Moderation

1. Admin opens `/qa/manage`
2. Admin manages sections and user roles
3. Admin moderates posts from the post detail surface

## RAG Grounding Model

The AI review experience is grounded in two source classes:

- Uploaded user material: pasted clause text, uploaded `PDF`, or uploaded `DOCX`
- Ingested tenant-rights materials: MassLegalHelp handbook chapters, handouts, forms, and booklets

When an answer makes a legal comparison or explains a rule, the system is expected to show handbook support instead of only citing the uploaded text.

## Auth and Session Behavior

- Registration creates a user and immediately establishes a session
- Login creates a session backed by the Express server
- Refresh restores the authenticated session through `/api/auth/session`
- Logout destroys the server session and resets the client session state
- Guest mode is a first-class AI review path, but not a substitute for saved account features

## Constraints

- The system provides legal information, not legal advice
- Image OCR is not part of the live product
- AI review currently supports one uploaded document at a time
- Notifications are in-app only for v2

## Non-Goals

- Realtime websocket notifications
- Email or SMS notification delivery
- Image or screenshot upload for OCR review
- Multi-file AI review sessions
- PDF report export
- One-click publishing from AI review directly into community posts

## Acceptance Criteria

### AI Review

- Guest and signed-in users can open `/ai-review`
- Pasted text returns a first answer without requiring a second submit step
- Uploaded `PDF` and `DOCX` files create RAG sessions successfully
- Answers are short, structured, and citation-backed

### Auth and Account

- Users can register, log in, refresh, and stay signed in
- Logout clears the authenticated session
- Signed-in users can see a real recent activity feed in `/account`
- Signed-in users can see unread notifications in the header bell

### Community

- Signed-in users can create posts
- Users can create multiple root follow-up threads and nested replies
- Users can edit and delete their own eligible content according to role rules

### Admin

- Admins can manage sections
- Admins can manage user roles and lawyer verification state
- Admins can moderate post status and pinning from the existing moderation surfaces

## Release Notes Boundary

This PRD describes the current live v2 product. Historical design docs and milestone plans remain useful references, but they are not the source of truth for current behavior.
