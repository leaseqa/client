# Documentation Governance and V2 Canonical Docs Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate LeaseQA's current product documentation into versioned canonical docs, mark stale docs as historical, and add repo-level instructions so future feature work checks documentation impact by default.

**Architecture:** The client repo will become the canonical home for current product docs, while the server repo will keep backend-specific operational docs. Historical design and milestone notes remain available but are explicitly labeled as non-canonical. Repo-local `AGENTS.md` files will encode documentation update rules so future work automatically checks doc impact.

**Tech Stack:** Markdown, git, existing repo documentation structure

---

## File Map

### Client repo

- Create: `docs/product-prd.md`
- Create: `docs/README.md`
- Create: `docs/release-checklist.md`
- Create: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/api-design.md`
- Modify: `docs/project-plan.md`

### Server repo

- Modify: `README.md`
- Modify: `AGENTS.md`

### Workspace root

- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/PRD.md`

---

## Chunk 1: Canonical Client Docs

### Task 1: Create the canonical product PRD

**Files:**
- Create: `docs/product-prd.md`
- Reference: `README.md`
- Reference: `docs/superpowers/specs/2026-03-13-documentation-governance-design.md`

- [ ] **Step 1: Draft the v2 product sections**

Write sections for:
- summary
- users and roles
- supported inputs
- supported outputs
- core user flows
- auth and guest behavior
- admin/community behavior
- non-goals
- acceptance criteria

- [ ] **Step 2: Ensure the PRD matches live behavior**

Check that the draft explicitly reflects:
- guest AI review access
- PDF and DOCX support
- account activity and notifications
- admin moderation
- no realtime notifications or image OCR

- [ ] **Step 3: Save `docs/product-prd.md`**

Keep the language concise and testable. Avoid speculative roadmap language.

### Task 2: Create the docs index

**Files:**
- Create: `docs/README.md`
- Reference: `docs/product-prd.md`
- Reference: `docs/project-plan.md`

- [ ] **Step 1: List canonical docs**

Document which files are current source of truth:
- `README.md`
- `docs/product-prd.md`
- `docs/architecture.md`
- `docs/api-design.md`
- `docs/release-checklist.md`

- [ ] **Step 2: List historical docs**

Mark as historical:
- `docs/project-plan.md`
- `docs/superpowers/specs/*`
- `docs/superpowers/plans/*`

- [ ] **Step 3: Save `docs/README.md`**

Make it obvious where contributors should start and which docs they should not casually rewrite.

### Task 3: Create the release checklist

**Files:**
- Create: `docs/release-checklist.md`

- [ ] **Step 1: Define release verification areas**

Include at minimum:
- home and navigation
- auth
- AI review
- account activity and notifications
- Q&A
- admin moderation
- deployment sanity checks

- [ ] **Step 2: Write concrete checklist items**

Each item should be a direct verification step, not a vague objective.

- [ ] **Step 3: Save `docs/release-checklist.md`**

---

## Chunk 2: Refresh Existing Client Docs

### Task 4: Rewrite the client README to point to canonical docs

**Files:**
- Modify: `README.md`
- Reference: `docs/product-prd.md`
- Reference: `docs/release-checklist.md`

- [ ] **Step 1: Keep the README repo-specific**

Retain:
- production URLs
- local setup
- shipped feature summary
- verification commands

- [ ] **Step 2: Add links to canonical docs**

Point readers to:
- `docs/product-prd.md`
- `docs/architecture.md`
- `docs/api-design.md`
- `docs/release-checklist.md`

- [ ] **Step 3: Remove stale or duplicate explanations**

Avoid duplicating the entire PRD inside the README.

### Task 5: Rewrite the architecture doc

**Files:**
- Modify: `docs/architecture.md`

- [ ] **Step 1: Replace stale architecture assumptions**

Remove or rewrite outdated references to:
- unified monorepo frontend/backend architecture
- NextAuth
- app-local API routes as the main backend
- Claude-specific AI integration

- [ ] **Step 2: Describe the real topology**

Document:
- Next.js client repo on Vercel
- Express server repo on Render
- Mongo + session auth
- `/api/rag/*`
- `/api/activity/*`

- [ ] **Step 3: Keep it implementation-facing, not roadmap-facing**

### Task 6: Rewrite the API design doc

**Files:**
- Modify: `docs/api-design.md`

- [ ] **Step 1: Replace old endpoint descriptions**

Remove stale descriptions for:
- `/api/ai-review`
- NextAuth session flow

- [ ] **Step 2: Cover current endpoint groups**

Summarize:
- auth
- account activity
- rag
- posts
- answers
- discussions
- folders
- moderation
- stats

- [ ] **Step 3: Keep this doc high-level**

It should be a current contract overview, not a generated full API reference.

### Task 7: Mark the old project plan as historical

**Files:**
- Modify: `docs/project-plan.md`

- [ ] **Step 1: Add a historical banner**

State clearly that this was the original v1 delivery plan and is no longer the live project roadmap.

- [ ] **Step 2: Point to current docs**

Link to:
- `docs/product-prd.md`
- `docs/release-checklist.md`
- `docs/README.md`

---

## Chunk 3: Governance and Cross-Repo Sync

### Task 8: Add client repo documentation instructions

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Define canonical docs**

List which client docs are authoritative.

- [ ] **Step 2: Add doc impact rules**

Encode rules such as:
- AI review changes require checking README, PRD, architecture, API docs
- auth/account/notification changes require checking README, PRD, API docs, release checklist
- Q&A/admin changes require checking README, PRD, API docs, release checklist

- [ ] **Step 3: Save the file in a concise, directive style**

### Task 9: Extend server repo instructions and README

**Files:**
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/AGENTS.md`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/README.md`

- [ ] **Step 1: Add doc ownership guidance to `AGENTS.md`**

Explain:
- server README is canonical for server operations
- client docs are canonical for product behavior
- public behavior changes may require updates in both repos

- [ ] **Step 2: Refresh the server README**

Add or update:
- `/api/activity/*`
- activity feed events
- current auth/account integration notes
- links back to canonical client docs

### Task 10: Update the workspace-root PRD pointer

**Files:**
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/PRD.md`

- [ ] **Step 1: Add a top note**

State that the tracked canonical PRD now lives in:
- `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/product-prd.md`

- [ ] **Step 2: Keep a short local pointer or synchronized summary**

Do not let this file remain the silent source of truth.

---

## Chunk 4: Verification and Completion

### Task 11: Run consistency checks

**Files:**
- Verify all modified docs

- [ ] **Step 1: Search for stale implementation claims**

Run searches for terms like:
- `NextAuth`
- `Claude`
- `/api/ai-review`
- `unified deployment`

- [ ] **Step 2: Read the canonical docs set**

Verify that:
- roles and flows are consistent
- guest behavior is consistent
- deployment topology is consistent
- notification/activity behavior is consistent

- [ ] **Step 3: Check git status in both repos**

Ensure only intended files changed.

### Task 12: Commit documentation updates

**Files:**
- Client repo documentation files
- Server repo documentation files

- [ ] **Step 1: Commit client repo changes**

Use a message such as:
`docs: refresh canonical v2 documentation`

- [ ] **Step 2: Commit server repo changes**

Use a message such as:
`docs: align server docs with v2 product docs`

- [ ] **Step 3: Push both repos**

### Task 13: Final verification report

- [ ] **Step 1: Re-run git status in both repos**

Expected: clean working trees

- [ ] **Step 2: Summarize the new documentation contract**

Call out:
- where the canonical docs live
- which docs are historical
- how future feature work should trigger doc review
