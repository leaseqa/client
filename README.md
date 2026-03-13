# LeaseQA Client

LeaseQA is a renter-facing web app for Boston housing questions, lease review, and community moderation workflows.

Production:
- Web: https://leaseqa-client.vercel.app
- AI Review: https://leaseqa-client.vercel.app/ai-review
- API backend: https://leaseqa-server.onrender.com

## What ships in v2

- AI Review chat for pasted lease clauses and uploaded `PDF` / `DOCX` files.
- Automatic first answer for pasted text, then follow-up chat in a left/right message layout.
- Structured answers with short summaries, bullet points, and compact source links.
- RAG-backed citations that combine the uploaded clause with supporting handbook sources when the answer relies on housing-law guidance.
- Community Q&A with posts, answers, and follow-up discussion threads.
- Admin and moderation surfaces for section management, role changes, lawyer verification, bans, pinning, and post status changes.

## How the AI review works

The client sends AI review requests to the Express backend at `/api/rag/*`.

The backend grounds answers in two source types:
- The uploaded source: pasted clause text, uploaded PDF, or uploaded DOCX.
- The ingested housing-rights corpus: MassLegalHelp handbook chapters, handouts, forms, and booklets.

When the answer makes a legal comparison or explains a rule, the UI expects handbook support instead of only showing the uploaded source.

## Stack

- Next.js App Router
- React
- `pnpm`
- Vercel for the public web deployment
- Proxy-based API access to the Render backend

## Local development

Requirements:
- Node `20.x`
- `pnpm`

Install and run:

```bash
pnpm install
pnpm dev
```

Frontend env:

Create `apps/web/.env.local` or update the existing local env values.

Minimum useful value:

```bash
NEXT_PUBLIC_HTTP_SERVER=http://localhost:4000
```

The Next.js app also proxies `/api/*` to `API_PROXY_URL`, which defaults to `http://localhost:4000`.

## Repository layout

```text
.
├── apps/web              # Next.js application
├── packages/config       # shared config
├── packages/ui           # shared UI package
└── README.md
```

## Verification used for the current release

- `pnpm --filter @leaseqa/web test`
- `pnpm --filter @leaseqa/web e2e --grep "admin smoke"`
- `pnpm --filter @leaseqa/web lint`
- `pnpm --filter @leaseqa/web build`

## Related repositories

- Server/API repo: https://github.com/leaseqa/server
