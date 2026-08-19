# LeaseQA Client Engineering Refresh Specification

## Goal

Make the Next.js client reproducible on Node 24, remove known vulnerable and unused dependencies, centralize its server boundary, prevent stored XSS, and split the AI review experience into testable state and rendering units.

## Required outcomes

- Node 24 LTS is the declared local, CI, and Vercel runtime; Node 26 is a compatibility CI lane.
- Root `npm run typecheck`, lint, unit tests, build, and Playwright scripts are deterministic and available to CI.
- Workspace TypeScript references are valid. React runtime and type packages use the same major.
- Unused `next-auth` and browser-side `mongoose` are removed. Direct vulnerable dependencies are upgraded to patched compatible releases.
- One API client owns base URL resolution, credentials, timeout, cancellation, response-envelope extraction, and normalized errors.
- UI modules do not create their own Axios instances or duplicate `API_BASE`.
- Server-rich HTML is sanitized again at the browser trust boundary before `dangerouslySetInnerHTML`.
- AI review networking, polling, session state, and presentation are separated into focused hooks/components without changing user-visible behavior.
- React Query is either the single server-state mechanism for AI review and account/QA reads or removed. This refresh adopts it for AI review and removes manual polling effects there.
- CI no longer fetches an unrelated server repository branch. Cross-repository E2E runs against explicitly paired revisions or a deployed test environment.
- No real credentials, `.env` contents, or production data enter tests or commits.

## Compatibility boundaries

- Preserve current routes, visible copy, and server JSON contracts.
- Preserve cookie-based authentication and same-origin `/api` proxy behavior.
- Keep the existing webpack build until a measured Turbopack migration is handled separately.

