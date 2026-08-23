# LeaseQA V2 Release Checklist

Use this checklist before calling a client-facing release ready.

## Automated verification

Run from the client root. All four must pass before the manual passes below.

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

End-to-end coverage needs the paired backend and a local MongoDB on
`127.0.0.1:27017`. Playwright starts the server itself from the sibling
`server` checkout, so install its dependencies first:

```bash
npm install --prefix ../server
CI_SKIP_RAG=true npm run e2e
```

`CI_SKIP_RAG=true` skips the one test that needs Milvus-backed RAG
(`activity notifications › tenant sees ai review and post activity in account
history`). Drop the flag only when Milvus is reachable — otherwise it fails on
`POST /api/rag/sessions` rather than on anything the release changed.

Expected: **21 passed, 1 skipped**. Record it here if that count changes.

If Playwright reports missing browsers, install them once:

```bash
npx playwright install chromium
```

## Visual approval

Any change to a rendered surface needs current-versus-target images approved
before the source changes, then real post-implementation captures compared
against the approved target. Capture at **1280x720** and **390x844** at
minimum; add **900px** when a layout has a tablet breakpoint.

For CSS consolidation, prove the change is inert rather than eyeballing it:

```bash
node scripts/check-visual-regression.mjs --out before.json
# make the change
node scripts/check-visual-regression.mjs --out after.json
node scripts/check-visual-regression.mjs --compare before.json after.json
```

It fingerprints computed styles for every element across nine routes at three
viewports and names the element and property that moved.

## Home and Navigation

- Open `/`
- Confirm the primary actions to `/ai-review` and `/qa`
- Confirm public navigation works on desktop and mobile

## Auth

- Register a fresh tenant account
- Confirm registration lands in an authenticated state
- Refresh and confirm the session survives
- Log out and confirm the session clears
- Log in with an existing account and confirm refresh still restores the session

## AI Review

- Open `/ai-review` as a guest and confirm the page loads
- Paste a clause and confirm the first answer returns immediately
- Confirm the answer is short, structured, and citation-backed
- Upload a `PDF` and confirm a session is created
- Upload a `DOCX` and confirm a session is created
- Ask a follow-up question and confirm the response attaches the expected source support

Note: the source picker opens on **Upload File**. The paste textarea only
mounts after selecting **Paste Text**.

## Account, Activity, and Notifications

- Log in as a tenant and open `/account`
- Confirm recent activity shows real entries, not placeholders
- Trigger an inbound answer notification and confirm the header bell shows an unread item
- Open the notification and confirm it marks as read and navigates to the correct page

## Community Q&A

- Create a post in `/qa`
- Confirm the post detail view loads
- Add an answer
- Add a root follow-up discussion
- Add a nested reply
- Refresh and confirm discussion threads persist

## Admin and Moderation

- Log in as an admin and open `/qa/manage`
- Create, edit, and delete a section
- Change a user role or verification state in the admin UI
- Open a post detail page and confirm moderation controls render
- Toggle post status and pinning

## Deployment Sanity

- Confirm the public client URL loads: `https://leaseqa-client.vercel.app`
- Confirm the server health check loads: `https://leaseqa-server.onrender.com/api/health`
- Confirm client and server `main` are at the intended commits

## Documentation

- Review [README.md](../README.md)
- Review [product-prd.md](product-prd.md)
- Review [architecture.md](architecture.md)
- Review [api-design.md](api-design.md)
- Review [leaseqa-server/README.md](../../server/README.md) if backend behavior
  changed
