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

- The working tree was clean before this document was added.
- The branch has no configured upstream and has not been confirmed as pushed.
- The branch is 9 commits ahead of local `main`.
- The branch changes 31 files relative to `main`: 2,814 insertions and 565 deletions before this document.
- Current verification passed on 2026-08-22:
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`: 16 test files, 82 tests passed
  - `npm run build`
- Playwright E2E was not rerun during this handoff pass.

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

## Current open item: header dropdown menus

The two 42px header triggers are already implemented as separate framed controls with a short vertical divider between them. Their opened menus are still the older React Bootstrap presentation and have not been refreshed.

### Relevant production files

- `apps/web/components/navigation/HeaderBar.tsx`
- `apps/web/components/navigation/HeaderBar/AvatarToggle.tsx`
- `apps/web/components/navigation/HeaderBar/ProfileHeader.tsx`
- `apps/web/components/navigation/HeaderBar/ProfileMenuItems.tsx`
- `apps/web/components/navigation/HeaderBar/NotificationsMenu.tsx`
- `apps/web/components/navigation/HeaderBar/NotificationsMenu.test.tsx`
- `apps/web/app/globals.css`
- `apps/web/e2e/activity-notifications.spec.ts`

### Existing behavior that must survive

- Notifications load when the menu opens.
- Unread items retain title, optional summary, date, destination, and read-on-select behavior.
- Notification states remain distinguishable: loading, error, empty, and populated.
- Guest profile actions remain `View Profile`, `Sign In`, and `Create Account` unless a separately approved copy change is made.
- Authenticated profile actions remain account navigation and sign-out.
- Menu actions must close the profile dropdown before navigating.

### Design exploration status

Design-only files live outside the repository:

`/Users/Z1nk/.gstack/projects/leaseqa-client/designs/header-menus-20260821/`

Important iterations:

- `target-profile-panel-v2.png`: rejected as too busy. It showed avatar, name, email, and `Tenant · Read-only access`.
- `target-profile-panel-v3.png`: reduced the identity block to avatar plus `Guest`. The user approved the information density but said the visual result still did not look good.
- `target-notifications-panel-v2.png`: compact notification proposal; not explicitly approved for implementation.
- `finalized.html`: preview artifact only. It currently reflects the v3 information reduction, not an approved final design.

No dropdown mockup is approved. Do not copy `finalized.html` into the project yet.

### Latest user feedback

The profile identity region had too many simultaneous signals. Removing email, role, and permission copy solved the density problem, but the remaining composition still looked visually weak. The next iteration should improve proportion, alignment, typography, separators, and relationship to the trigger controls without adding information back.

## Immediate TODO

1. Inspect both current production dropdowns at desktop and mobile sizes.
2. Produce a new compact visual direction for both profile and notifications menus.
3. Show current-versus-target images at 1280x720 and 390x844.
4. Wait for explicit user approval before changing rendered source or CSS.
5. After approval, add or update focused component tests first.
6. Implement the approved menu design without changing data flow or routes.
7. Capture real post-implementation screenshots at both sizes and compare them with the approved target.
8. Run focused navigation tests, the notification Playwright coverage where the backend fixture is available, then the full verification suite.
9. Commit the dropdown work as one isolated stage.

### Suggested design direction, not an approved design

- Keep the menu compact and visually anchored to its 42px trigger.
- Use one quiet surface, a restrained border, and minimal shadow.
- Keep guest identity to avatar plus `Guest`; do not restore email, role badges, or permission badges.
- Improve composition through spacing and typography, not extra labels or icons.
- Avoid a stack of floating mini-cards inside the dropdown.
- Keep menu rows at least 44px tall on touch layouts.
- Let notification content carry the hierarchy. The empty state should remain neutral and informational.
- Verify that a 284px-wide menu is actually the best proportion; density was accepted, but the v3 width and geometry were not approved.

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

- Root `package.json` requires Node `24.x`, while the root README still says Node `20.x`.
- `docs/README.md` contains absolute links using an older `leaseqa-client` directory path.

These are outside the current menu-design scope, but the next documentation cleanup should correct them.

## Handoff acceptance checklist

- [ ] New profile and notification menu targets shown at desktop and mobile sizes.
- [ ] User explicitly approved both targets.
- [ ] No email/role/permission clutter restored to the guest identity block.
- [ ] Existing notification loading/error/empty/populated behavior preserved.
- [ ] Existing guest and authenticated actions preserved.
- [ ] Keyboard, focus, 44px targets, viewport bounds, and reduced motion verified.
- [ ] Actual implementation screenshots match the approved targets.
- [ ] Typecheck, lint, 82+ unit tests, and build pass.
- [ ] Relevant notification E2E passes or is clearly recorded as not run.
- [ ] Work is committed on `codex/leaseqa-frontend-refresh` or a clearly named successor branch.
