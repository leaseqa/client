# Documentation Governance and V2 Canonical Docs Design

## Summary

LeaseQA now has a working v2 product across two versioned repositories, but the documentation is split across:

- an unversioned workspace root
- client repo README and docs
- server repo README and AGENTS notes
- historical design records and milestone plans

That split is why product documentation drifts. There is no single versioned source of truth, no doc ownership boundary, and no repository-level instruction that says "if you change feature X, you must also review document Y."

This design fixes the problem in two layers:

1. establish one canonical, versioned documentation set for the live product
2. add repo-level governance so future feature work checks documentation impact by default

## Goals

- Move current product truth into versioned repositories
- Define which docs are canonical, operational, or historical
- Refresh stale product and architecture docs to match the live v2 implementation
- Add repo instructions so future work automatically checks doc impact
- Reduce future drift without introducing a heavyweight documentation platform

## Non-Goals

- Build a docs website
- Generate docs automatically from code annotations
- Backfill every historical design note so it reads like a current product guide
- Create a third shared repository just for docs

## Current Problems

### Unversioned product brief

The workspace root contains `PRD.md`, but `/Users/Z1nk/Desktop/proj/leaseqa` is not a git repository. That means the product brief is not versioned with either client or server code and can quietly drift.

### Stale implementation docs

Several docs still describe v1 or early prototype assumptions:

- unified monorepo frontend/backend architecture
- NextAuth-based auth
- `/api/ai-review`
- Claude-based AI flow
- a student milestone timeline as if it were current delivery guidance

### No documentation contract

There is no root `AGENTS.md` in version control, no client `AGENTS.md`, and the existing server `AGENTS.md` only covers RAG notes. Nothing tells future agents or contributors which docs are authoritative or which must be reviewed when features change.

## Recommended Approach

Use the client repo as the canonical home for current product docs and keep the server repo focused on backend-specific operational docs.

This is preferred over keeping canonical docs in the workspace root because:

- the root is not versioned
- the client repo already carries the main user-facing product entry points
- most cross-cutting product decisions are driven by user experience and public behavior

The server repo should still keep its own service-level docs, but they should point back to the canonical product docs where appropriate.

## Canonical Documentation Set

### Client repo canonical docs

The following files become the current source of truth for the live product:

- `README.md`
  - public deployment entry points
  - high-level shipped capabilities
  - local development and verification
- `docs/product-prd.md`
  - current v2 product scope, roles, supported flows, non-goals, acceptance criteria
- `docs/architecture.md`
  - current client/server split, deployment topology, auth/session model, data flow
- `docs/api-design.md`
  - current public app-level API contract summary
- `docs/release-checklist.md`
  - pre-release manual verification checklist
- `docs/README.md`
  - documentation map showing what is canonical vs historical

### Server repo canonical docs

The following remain authoritative for backend-only concerns:

- `README.md`
  - backend responsibilities, env vars, commands, deployment notes
- `AGENTS.md`
  - server-specific implementation and documentation update rules

## Historical vs Current Docs

Not every document should be rewritten as if it were current.

### Historical records to preserve as historical

- time-stamped specs under `docs/superpowers/specs/`
- time-stamped plans under `docs/superpowers/plans/`
- early milestone plan in `docs/project-plan.md`
- ad hoc design notes such as `前端去AI味.md`

These should stay available, but the docs map should label them as historical references, not current product truth.

### Workspace-root PRD

The root `PRD.md` should no longer be treated as the canonical product spec. Since it is not versioned, it should either:

- become a short pointer to the versioned canonical PRD in `leaseqa-client/docs/product-prd.md`, or
- be kept only as a local convenience copy with a clear header stating that the tracked version lives in the client repo

## Documentation Governance Rules

Add repo-local instructions so documentation review becomes part of future feature work.

### Client `AGENTS.md`

Create a new client `AGENTS.md` that defines:

- current canonical docs
- historical docs that should not be overwritten casually
- a feature-to-doc impact checklist:
  - AI review / RAG changes -> review `README.md`, `docs/product-prd.md`, `docs/api-design.md`, `docs/architecture.md`
  - auth/account/notifications changes -> review the same docs plus `docs/release-checklist.md`
  - Q&A/admin/moderation changes -> review `README.md`, `docs/product-prd.md`, `docs/api-design.md`, `docs/release-checklist.md`
- a rule that documentation impact must be checked before claiming feature work is complete

### Server `AGENTS.md`

Extend the existing server `AGENTS.md` so it also states:

- backend-facing canonical docs live in `README.md`
- product-facing canonical docs live in `leaseqa-client/docs/*`
- when backend behavior changes public capabilities or API contracts, both repos may require doc updates

## Document Content Changes

### `docs/product-prd.md`

Rewrite as the current v2 product brief:

- guest AI review allowed
- logged-in history and notifications
- PDF and DOCX uploads
- community Q&A and moderation
- admin management
- current non-goals such as no realtime notifications, no image OCR

### `docs/architecture.md`

Rewrite to reflect the real architecture:

- separate Next.js client repo and Express server repo
- Vercel + Render deployment
- session-based auth against the Express backend
- RAG flow through `/api/rag/*`
- activity and notification flow through `/api/activity/*`

### `docs/api-design.md`

Rewrite away from the old `/api/ai-review` and NextAuth assumptions. Cover the current auth, account, activity, posts, answers, discussions, folders, moderation, stats, and rag endpoints at a summary level.

### `docs/project-plan.md`

Convert this into an explicitly archived v1 milestone record so it is no longer mistaken for the live roadmap.

### `README.md` files

Refresh client and server README files so they are consistent with the canonical docs and include the newly shipped auth/activity/notification capabilities.

## Verification

Documentation work should be verified with lightweight consistency checks:

- no canonical doc should describe NextAuth, Claude, or `/api/ai-review` as current behavior
- canonical docs should consistently describe:
  - guest AI review
  - PDF + DOCX support
  - account activity and notification bell
  - Vercel client + Render server
- docs map should clearly label current vs historical docs
- repo-local `AGENTS.md` files should include documentation impact guidance

## Recommended Rollout

1. Create the canonical docs map and product PRD in the client repo
2. Refresh architecture and API docs to current behavior
3. Mark old milestone docs as historical instead of pretending they are current
4. Add documentation governance rules to client and server `AGENTS.md`
5. Update the unversioned root `PRD.md` to point at the versioned canonical PRD
