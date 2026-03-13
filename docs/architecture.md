# LeaseQA V2 Architecture

## Overview

LeaseQA v2 runs as two separate application repositories:

- `leaseqa-client`
  - Next.js App Router frontend
  - deployed to Vercel
- `leaseqa-server`
  - Express API and RAG backend
  - deployed to Render

This is no longer a unified frontend/backend monorepo runtime. The client proxies `/api/*` requests to the Express backend.

## Runtime Topology

### Client

- Framework: Next.js App Router
- State: lightweight Redux session state plus page-local state
- Hosting: Vercel
- Public entry points:
  - `/`
  - `/ai-review`
  - `/qa`
  - `/account`
  - `/qa/manage`

### Server

- Framework: Express
- Persistence: MongoDB
- Session auth: `express-session` with Mongo-backed session storage
- Hosting: Render
- Public API base: `/api/*`

### Retrieval Layer

- Vector retrieval: Milvus / Zilliz
- Knowledge corpus: MassLegalHelp handbook chapters, handouts, forms, and booklets
- Document ingestion: pasted text, uploaded `PDF`, uploaded `DOCX`

## Authentication Model

The client does not use NextAuth in the live v2 architecture.

Current auth flow:

1. The user registers or logs in through the Express backend
2. The backend writes the authenticated user into the session
3. The client restores session state through `GET /api/auth/session`
4. Logout destroys the server session and clears the client session state

Guest mode is supported for AI review, but guest users do not receive persisted account history or community write access.

## Major Product Flows

## 1. AI Review

1. User opens `/ai-review`
2. Client creates a RAG session through `/api/rag/sessions`
3. Backend parses the input, stores the session, and runs retrieval against:
   - uploaded source material
   - ingested legal corpus
4. Backend returns a structured answer with short summary, bullets, and citations
5. Follow-up questions continue through `/api/rag/sessions/:sessionId/messages`

For signed-in users, successful AI review creation also writes account activity.

## 2. Account Activity and Notifications

1. Signed-in users open `/account`
2. Client fetches recent activity from `/api/activity`
3. The header bell fetches unread notifications from `/api/activity/notifications`
4. Selecting a notification marks it read through `/api/activity/notifications/read`

Activity events are written from backend success paths such as:

- AI review creation
- post creation
- answer received
- discussion reply received
- post status changes

## 3. Community Q&A

1. Users create posts in `/qa`
2. Backend stores posts, answers, and discussion trees in MongoDB
3. Client renders post detail, answers, and nested follow-up discussions
4. Admin and other role-based controls are enforced on the backend and reflected in the UI

## 4. Admin and Moderation

Admin workflows live primarily in:

- `/qa/manage`
- post detail moderation surfaces in `/qa`

These flows use the same application shell as the public site, with extra controls for:

- section management
- role changes
- lawyer verification
- bans
- post status changes
- pinning

## Data Boundaries

### Client responsibilities

- page composition
- local UI state
- session restoration into Redux
- rendering account activity and notifications
- rendering AI review sessions and community content

### Server responsibilities

- auth and session persistence
- domain writes for posts, answers, discussions, folders, and users
- activity and notification persistence
- RAG session creation, retrieval, and answer grounding

## Deployment Notes

### Production

- Client: `https://leaseqa-client.vercel.app`
- Server: `https://leaseqa-server.onrender.com`

### Local

- Client: `http://localhost:3000`
- Server: `http://localhost:4000`

The client can call the backend directly through `NEXT_PUBLIC_HTTP_SERVER` and also proxies `/api/*` through `API_PROXY_URL` or the same backend origin.

## Documentation Boundaries

For current behavior, use these docs together:

- [product-prd.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/product-prd.md)
- [api-design.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/api-design.md)
- [README.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/README.md)

Historical plans and time-stamped design specs are not the source of truth for the live architecture.
