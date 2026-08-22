# LeaseQA Frontend Refresh Handoff

Updated: 2026-08-22  
Repository: `/Users/Z1nk/Desktop/proj/leaseqa/client`  
Branch: `codex/leaseqa-frontend-refresh`  
HEAD before this handoff document: `6f7061d820a7231b4f24ad16d4d87b3b18530156`  
Base branch: `main` at `fa299ca5707c22fa8cd780e9375d1d0305d7284e`

## Purpose

Continue the renter-facing frontend refresh while preserving the current routes, backend contracts, warm editorial identity, and legal-information boundaries. The product should feel like a calm renter tool rather than a generic SaaS dashboard.

This document separates committed implementation from unapproved design work. Do not treat files under `~/.gstack/projects/...` as production code.

## Current repository state

- Working tree clean as of 2026-08-22.
- The branch has no configured upstream and has not been pushed.
- Verification on 2026-08-22 after this session's work:
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`: 20 test files, 138 tests passed
  - `npm run build`
  - `CI_SKIP_RAG=true npm run e2e`: 21 passed, 1 skipped
- The single skip is the RAG activity test, which needs Milvus. Playwright's
  browsers and the paired server's dependencies both had to be installed first;
  neither was present.

## Completed and committed

| Commit | Result |
| --- | --- |
| `d9b87fb` | Added the frontend experience refresh plan and staged visual approval workflow. |
| `2197c3c` | Kept the public shell visible while session restoration runs. |
| `a555a6c` | Recorded approved homepage copy and UPL-safe content constraints. |
| `41b47f2` | Made the login route safe for production builds. |
| `b5400bc` | Rebuilt the homepage around a renter journey and stable lease-language preview. |
| `8f21abf` | Renamed the homepage lease action. The visible CTA is `Review My Lease`. |
| `276c436` | Aligned desktop navigation states with the refreshed visual system. |
| `3c6169c` | Reworked AI review into a focused source/history/conversation workspace. |
| `6f7061d` | Improved Community Questions states, mobile access, navigation semantics, and header triggers. |
| `b7b7cdb` | Refreshed both header menus and fixed the 829px and 427px overflow bugs. |
| `fae893f` | Reshaped the homepage journey as a path and removed the duplicate disclaimer band. |
| `a8c43d5` | Dropped the tsconfig `baseUrl` that `next typegen` strips on every run. |
| `c76e1ad` | One canonical token block, plus a computed-style regression guard. |
| `ae4bb22` | Removed the unused `@leaseqa/ui` package. |
| `4b695c2` | Rewrote the colour and button guides from the shipped values. |
| `f234ecf` | Repaired two stale selectors in the notification spec. |
| `2bbb220` | Added public-route smoke coverage. |
| `65668d2` | Repaired 153 stale doc links and recorded the real release commands. |
| `0375bad` | Added the shared `RemoteDataState` (not yet adopted). |

### Implemented visual evidence

- Homepage and navigation:
  - `/Users/Z1nk/.codex/visualizations/2026/08/21/01a022f4-a6ee-7b41-97c1-1f76d202f0a5/homepage-refresh/implemented-desktop-v2.png`
  - `/Users/Z1nk/.codex/visualizations/2026/08/21/01a022f4-a6ee-7b41-97c1-1f76d202f0a5/homepage-refresh/implemented-mobile-v2.png`
- AI review:
  - `/Users/Z1nk/.codex/visualizations/2026/08/21/01a022f4-a6ee-7b41-97c1-1f76d202f0a5/ai-review-implemented/implemented-desktop-v3.png`
  - `/Users/Z1nk/.codex/visualizations/2026/08/21/01a022f4-a6ee-7b41-97c1-1f76d202f0a5/ai-review-implemented/implemented-mobile-v3.png`
- Community Questions:
  - `/Users/Z1nk/.codex/visualizations/2026/08/21/01a022f4-a6ee-7b41-97c1-1f76d202f0a5/community-implemented/implemented-desktop.png`
  - `/Users/Z1nk/.codex/visualizations/2026/08/21/01a022f4-a6ee-7b41-97c1-1f76d202f0a5/community-implemented/implemented-mobile.png`

## Header dropdown menus — done

Both menus were refreshed and committed as `b7b7cdb`. Two sizing bugs turned up
that this document had not recorded, and both were only visible under real
content:

- The notifications menu set an inline `minWidth: 280` with no maximum. Because
  Bootstrap's `.dropdown-item` does not wrap, a long title grew the panel to
  **829px**, which on a 390px viewport ran off the *left* edge and clipped the
  content out of reach.
- The profile menu's width was driven by the untruncated email, reaching
  **427px** on desktop. On mobile only `max-width: calc(100vw - 2rem)` stopped
  it, leaving an edge-to-edge panel with the address cut off.

Both panels now hold a fixed width — 264px and 312px — at every viewport, with
clamped titles and a truncating name. The identity block is avatar plus name;
the email and both badges are gone at the user's direction.

Anchoring detail worth keeping: `Dropdown` sits inside `Navbar`, so React
Bootstrap disables Popper (`data-bs-popper="static"`) and positions the menu with
plain CSS offsets measured from the 42px trigger. The menus are therefore
anchored to `.site-auth` instead, which gives them one shared right edge and
keeps the wider notifications panel on screen down to a 320px viewport.

Verified: 264/312 at both sizes matching the approved target, Enter opens,
ArrowDown roves, Escape closes and returns focus to the trigger, rows are 44px
on touch, and both notification E2E tests pass.

Also found: `components/**` was outside vitest's `include`, so the existing
`NotificationsMenu.test.tsx` had never run — and could not have passed, since
`Dropdown.Menu` renders children only when open. It runs now.

## Remaining plan work beyond the menus

The canonical implementation plan is `docs/superpowers/plans/2026-08-21-frontend-experience-refresh.md`.

### Task 2: shared remote-data states

Still unchecked. Some routes now implement honest local states, especially Community Questions, but the planned shared `RemoteDataState` component and route-wide adoption were not completed. Re-evaluate the plan against the current code before implementing; do not assume every original file/line reference is still current.

### Task 6: design-system consolidation

Not started. Intended outcome:

- extract canonical tokens, base rules, and shell rules from `globals.css`;
- remove duplicate/winning selector ambiguity only after visual regression coverage exists;
- reconcile or remove unused `packages/ui` primitives;
- update color and button guides to match production.

`globals.css` currently contains multiple generations of dropdown and profile-menu rules. This is a known cascade risk for the menu task. Keep initial implementation scoped, then consolidate separately after approval.

### Task 7: final QA and handoff

Not started. It includes public-route smoke coverage, complete E2E verification, review, and release-checklist updates.

## Product and copy constraints

These constraints came directly from prior review and must be preserved:

- Do not call generated content `Suggested Actions`.
- Do not present personalized directives telling a renter what to do, say, or write.
- Prefer general information, cited sources, questions to verify, and unranked available options.
- Keep the homepage CTA as `Review My Lease`, using Title Case for prominent navigation and action labels.
- Preserve `Community Questions` as the page title without the removed eyebrow or side description.
- Keep the top navigation labels `Home`, `Check Lease`, and `Ask` unless the user separately approves a copy change.
- Preserve the warm neutral palette, olive accent, and restrained editorial character.
- Do not add another UI framework or change backend contracts.

## Accessibility and responsive constraints

- Minimum touch target: 44 by 44 CSS pixels on mobile.
- Preserve visible focus states and keyboard operation for both dropdowns.
- Use semantic menu/button behavior supplied by React Bootstrap unless replacing it with an equally accessible implementation.
- Keep loading announcements polite and errors perceivable.
- Respect `prefers-reduced-motion`.
- Check dropdown viewport bounds at 390px width and right alignment near the screen edge.
- Verify long authenticated names, long emails where still used, long notification titles, and long summaries without overflow.

## Working method

Use this sequence for every visible UI stage:

1. **Inspect current behavior**: source, tests, cascade, desktop, and mobile.
2. **Reduce the problem**: identify the one hierarchy or interaction issue being solved.
3. **Explore in a design artifact**: use `superpowers:brainstorming` for the bounded interaction decision and `design-html` or an equivalent mockup workflow for visuals.
4. **Show comparisons**: current and target, desktop and mobile.
5. **Approval gate**: no rendered source change until the user explicitly approves the target.
6. **TDD implementation**: focused failing tests, minimal code, then refactor.
7. **Visual verification**: capture the actual app, not only the standalone mockup.
8. **Engineering verification**: typecheck, lint, unit tests, build, and relevant E2E.
9. **Small commit**: one visual stage per commit with the plan checkboxes updated only when the actual scope is complete.

For review of an implemented page, use `design-review`. For behavior verification, use `qa` or `qa-only`. For implementation from an already approved target, follow `superpowers:executing-plans`; do not reopen brainstorming unless the user asks to change the direction.

## Verification commands

Run from `/Users/Z1nk/Desktop/proj/leaseqa/client`:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Focused menu coverage:

```bash
npm exec vitest run -- apps/web/components/navigation/HeaderBar
npm run e2e --workspace @leaseqa/web -- --grep "notification"
```

The notification E2E suite depends on the paired backend/test environment. If it cannot run, record that boundary rather than reporting it as passed.

## Known documentation drift

Both fixed on 2026-08-22. The README now says Node `24.x`, and the 153 absolute
links under the old `leaseqa-client` and `leaseqa-server` directory names are now
relative to the file that contains them.

Six links still point at files that do not exist — `AGENTS.md`,
`apps/web/app/refresh.css`, and two `page.test.tsx` files. They were already
broken and were left as found rather than guessed at.

## Handoff acceptance checklist

- [x] New profile and notification menu targets shown at desktop and mobile sizes.
- [x] User explicitly approved both targets.
- [x] No email/role/permission clutter restored to the guest identity block.
- [x] Existing notification loading/error/empty/populated behavior preserved.
- [x] Existing guest and authenticated actions preserved.
- [x] Keyboard, focus, 44px targets, viewport bounds, and reduced motion verified.
- [x] Actual implementation screenshots match the approved targets.
- [x] Typecheck, lint, 138 unit tests, and build pass.
- [x] Relevant notification E2E passes.
- [x] Work is committed on `codex/leaseqa-frontend-refresh`.

## Open decisions

- **Pushing.** The branch still has no upstream and has not been pushed. No PR
  has been opened.
- **`RemoteDataState` adoption.** Committed on
  `codex/remote-data-state-adoption` and waiting on approval of the before/after
  images. Unmerged.
- **`design-review` in regression mode** (Task 6 step 7) and the `review` pass
  (Task 7 step 4) have not been run.
- **Roughly 158 duplicated selectors** remain in `globals.css`. Each needs a
  judgement call about which declaration should win, so they were left in place.
