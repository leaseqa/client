# LeaseQA Client

LeaseQA is a renter-facing web app for Boston housing questions, lease review, account history, and community moderation
workflows.

Production:

- Web: [https://leaseqa-client.vercel.app](https://leaseqa-client.vercel.app)
- AI Review: [https://leaseqa-client.vercel.app/ai-review](https://leaseqa-client.vercel.app/ai-review)
- Backend API: [https://leaseqa-server.onrender.com](https://leaseqa-server.onrender.com)

## What ships in v2

- AI review for pasted clauses and uploaded `PDF` / `DOCX` files
- Automatic first answer for pasted text, followed by citation-backed chat
- Guest AI review access plus saved signed-in history
- Account recent activity and unread notifications
- Community Q&A with posts, answers, and threaded follow-up discussion
- Admin and moderation surfaces for section management, role changes, lawyer verification, bans, pinning, and post
  status changes

## Canonical Docs

- Product PRD: [docs/product-prd.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/product-prd.md)
- Architecture: [docs/architecture.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/architecture.md)
- API design: [docs/api-design.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/api-design.md)
- Release
  checklist: [docs/release-checklist.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/release-checklist.md)
- Docs map: [docs/README.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/README.md)

## How the AI review works

The client sends AI review requests to the Express backend under `/api/rag/*`.

Answers are grounded in:

- the uploaded source: pasted clause text, uploaded `PDF`, or uploaded `DOCX`
- the ingested housing-rights corpus: MassLegalHelp handbook chapters, handouts, forms, and booklets

When the answer relies on housing-law guidance, the UI expects handbook support rather than only showing the uploaded
source.

## Stack

- Next.js App Router
- React
- `npm`
- Vercel for the public client deployment
- Proxy-based API access to the Render backend

## Local Development

Requirements:

- Node `20.x`
- `npm`

Install and run:

```bash
npm install
npm run dev
```

Frontend env:

Create `apps/web/.env.local` or update the existing local env values.

Minimum useful value:

```bash
NEXT_PUBLIC_HTTP_SERVER=http://localhost:4000
```

The Next.js app also proxies `/api/*` to `API_PROXY_URL`, which defaults to the same backend origin when not set.

## Repository Layout

```text
.
├── apps/web
├── docs
├── packages/config
├── packages/ui
└── README.md
```

## Verification Used for the Current Release

- `npm run test --workspace @leaseqa/web`
- `npm run lint --workspace @leaseqa/web`
- `npm run build --workspace @leaseqa/web`
- `npm run e2e --workspace @leaseqa/web`

## Related Repository

- Server/API repo: [https://github.com/leaseqa/server](https://github.com/leaseqa/server)
