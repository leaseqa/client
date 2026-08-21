# LeaseQA Frontend Experience Refresh Design

## Goal

Improve the renter-facing experience without replacing the current product architecture or visual identity. Preserve the warm editorial palette, routes, backend contracts, and core feature set while making anonymous entry, AI review, community states, responsive behavior, and the shared UI system more trustworthy and maintainable.

## Product direction

LeaseQA should feel like a calm renter tool, not a generic SaaS dashboard. The interface should make the next action obvious, show legal-information boundaries without dominating the task, and distinguish unavailable data from genuinely empty content.

## Delivery model

Work ships in independently testable stages:

1. Public-shell and state reliability.
2. Homepage composition.
3. AI review workspace.
4. Community states and mobile accessibility.
5. Design-system consolidation.

Every stage that changes rendered layout or styling has a visual approval gate. Before source changes, produce a current-versus-target comparison at desktop and mobile sizes, show it to the user, and wait for explicit approval. Functional tests, diagnostics, and documentation may precede that gate; rendered UI changes may not.

## Stage 1: Public-shell and state reliability

- Anonymous users must see the homepage shell immediately while session restoration runs.
- `/`, `/auth/login`, and `/ai-review` must not render a blank document when `/api/auth/session` is slow, unavailable, or returns an unauthenticated response.
- Data-backed areas distinguish loading, empty, and error states.
- Retryable failures expose a specific retry action and never appear as valid zero data.
- The homepage must not label day-cached or unavailable statistics as live.

## Stage 2: Homepage composition

- Preserve the current wordmark, warm neutral palette, olive accent, and two primary destinations.
- Use the approved headline `Understand your lease. Know what to do next.`
- Use the approved supporting copy `LeaseQA explains the clauses that matter, connects them to Massachusetts tenant guidance, and helps you find a clear next step.`
- Label the primary and secondary actions `Review my lease` and `Browse renter questions`.
- The hero must remain visually balanced when community data is unavailable.
- Replace the generic three-column process grid with a concrete renter journey: clause, explanation, clear next step.
- Keep one visually dominant CTA. The community action remains available but secondary.
- Hide community metrics until valid data exists; never present four zero values as a healthy live state.

## Stage 3: AI review workspace

- Desktop uses a source/history rail and a primary conversation workspace.
- Mobile uses a linear source to analysis to follow-up flow without duplicating controls.
- Upload and paste are explicit alternative input modes.
- After a source exists, the large input area collapses to a compact source summary.
- History is secondary context, not a full-width interruption between source creation and conversation.
- Raw transport messages such as `Request failed with status code 500` are replaced with task-specific copy and retry actions.

## Stage 4: Community and accessibility

- Community error, empty, and permission states are separate components.
- Guest empty states offer a sign-in path instead of promising an unavailable post action.
- Interactive controls have a minimum 44 by 44 CSS-pixel target on touch layouts.
- Search and text areas have persistent accessible labels; placeholders remain examples only.
- Motion respects `prefers-reduced-motion`.
- Status changes use appropriate live regions without announcing decorative changes.

## Stage 5: Design-system consolidation

- Split the monolithic global stylesheet into tokens, base/shell, shared component styles, and route-scoped modules.
- Keep one canonical warm color system and one spacing/radius/type scale.
- Remove duplicate and overridden QA, navigation, button, and card definitions only after route-level visual regression coverage exists.
- Move reusable Button, Field, EmptyState, ErrorState, and Surface primitives into `packages/ui` or remove the unused package boundary. Do not maintain two component systems.
- Update the color and button documentation to match rendered production behavior.
- Do not add another UI framework.

## Verification

- Unit/component tests cover public-shell rendering and state variants.
- Playwright covers anonymous homepage, login, guest AI review, community empty/error states, and mobile navigation.
- Visual approval uses 1280 by 720 desktop and 390 by 844 mobile comparisons.
- Each stage runs typecheck, lint, unit tests, build, and relevant Playwright tests before commit.

## Non-goals

- No backend contract redesign.
- No route renaming.
- No dark mode.
- No multi-file AI review.
- No wholesale replacement of Bootstrap or React Bootstrap in one change.
- No decorative animation program unrelated to task feedback.
