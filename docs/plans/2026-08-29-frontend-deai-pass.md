# Frontend De-AI Pass

**Date:** 2026-08-29
**Status:** all four tiers landed 2026-08-29. Typecheck, lint, 150 unit tests,
12 design-system invariants, `next build`, and all 53 Playwright e2e tests green.

## Why

Every route except the homepage still reads as generated: Title Case headings,
placeholder-grade empty states, badges that carry no signal, two icon libraries,
two CSS frameworks, two data-fetching layers. The homepage
(`app/home/home.module.css`) already has a voice. Nothing else speaks it.

## Rules for this pass

1. **No component source edits until the before/after comparison is approved.**
   `after` is produced by injecting CSS/JS into the running app, so the
   comparison is real rendering, not a mockup.
2. No new dependencies. This pass only removes.
3. Routes, backend contracts, palette, and wordmark stay as they are.
4. One tier at a time. Explain what changed, then wait for `ok`.

## Baseline (measured 2026-08-29)

| Signal | Value |
|---|---|
| `app/globals.css` | 7098 lines, 697 class names |
| Unreferenced classes | 242 / 697 (35%) |
| Button class families | 4 custom + Bootstrap's own |
| Icon libraries | `react-icons` (26 files) + `lucide-react` (16); 8 files import both |
| Data layers | Redux (17 files) + TanStack Query (7) + raw axios; `swr` installed, 0 usages |
| `posts.urgency` | 6 of 6 rows are `low` |

---

## Tier 1 — copy and chrome

No structural change. Highest de-AI yield per unit of risk.

- **One icon library.** Drop `react-icons`, keep `lucide-react` — the line style
  matches the editorial tone; Font Awesome's solid glyphs are what reads as
  template kit. 26 files to rewrite, 8 of which currently import both.
- **One voice.** Sentence case everywhere, matching the homepage. Rewrite the
  five boilerplate states (`Questions Could Not Load`, `No Open Questions Here`,
  `Stats Unavailable`, `Welcome Back`, `Try Again`) so each names the actual next
  action instead of restating the failure.
- **Cut chrome that carries no information.**
  - Urgency badge renders only when `urgency === "high"`. All six rows are `low`,
    so today it is pure weight with zero signal.
  - `Uncategorized` stops being a user-facing topic chip — it is a storage
    fallback.
  - Drop the visible `Search community questions` label; keep it
    `visually-hidden`. The placeholder already says it.

## Tier 2 — interaction honesty

- **Remove the fake typewriter.** `app/ai-review/page.tsx` drips an
  already-complete answer at 18ms/char via `getNextRevealLength`. It is not
  streaming, it re-renders per tick, and it delays the user for nothing. Either
  wire real SSE streaming, or render immediately and keep a skeleton during the
  request.
- **De-anthropomorphise progress copy.** "Researching the best supported
  answer…" → say what the system is doing, not what a person would be thinking.
- **`/qa` shows one list, not two.** The `Recent` sidebar and the
  `Popular questions` block render the same posts under two orderings. Keep the
  sidebar as navigation; make the main block the actual filtered feed.

## Tier 3 — style-system convergence

The root cause. Without this, Tiers 1–2 regrow within a quarter.

- Delete the 242 unreferenced classes from `globals.css`.
- Collapse four button families into one.
- **Decide Bootstrap vs Tailwind.** Both ship today; `app/layout.tsx` already
  carries a comment about them fighting over `!important` specificity. Needs a
  written decision before any migration, then route-by-route with a gated
  comparison each.

## Tier 4 — data-layer consistency

`/qa` hand-rolls `useState`/`useEffect` loading and error handling while
`/ai-review` uses TanStack Query — which is exactly why the two routes present
loading, empty, and error states differently.

- Remove the unused `swr` dependency.
- Move `/qa` onto TanStack Query.
- Route every remote read through one shared state component so the four states
  render identically everywhere.

## Out of scope

**Aceternity components** (`AceternityFileUpload`, `AceternityStatefulButton`)
stay. `docs/notes/frontend-design-notes.md` lists Aceternity UI as an
anti-AI-texture library, so if their motion diverges from the rest of the app,
normalise the motion — do not remove the components.


---

## Outcome

All four tiers are implemented. Three things turned out differently than planned:

**Tier 3.3 needed no decision.** The plan budgeted an ADR for "Bootstrap vs
Tailwind". No stylesheet contained `@tailwind` or `@apply`, so Tailwind emitted
nothing — it was dead weight in `postcss.config.js`, `tailwind.config.ts`, and a
`packages/config` workspace that existed only to hold its config. `packages/ui`
was an orphan with no source. All removed; `tsconfig.json` needed its dangling
project reference dropped too.

**The dead-CSS count was wrong in the plan.** 242 was a crude token count. A
careful pass found 72 unreferenced classes, 13 of which are Bootstrap and Quill
overrides that must stay. 59 were removed (528 lines, 77 rules), plus 8 orphan
custom properties.

**Tier 4 uncovered a live bug.** With the API unreachable, a TanStack query can
settle at `status: "pending"` / `fetchStatus: "paused"` — no data, no error,
`isLoading === false`. `/qa` read that as "loaded and empty" and told renters
there were no questions while the server was down. The page now derives its
states from `isSuccess` / `isPaused` rather than from the absence of an error.
`networkMode: "always"` did not prevent the pause (react-query 5.90.21); the fix
deliberately does not depend on why it pauses. A second trap in the same
migration — an infinite mount/refetch loop between the page's spinner branch and
`ScenarioFilter` — is prevented by `retryOnMount: false`.

Both are written up in the vault: `proj/leaseqa/client-honest-remote-data-states.md`.

## Ratchets added

`scripts/design-system-invariants.test.mjs` went from 8 to 12 tests: no
`react-icons` imports, no `react-icons` dependency, no retired button families,
and unreferenced classes in `globals.css` held under a budget of 5.

## RemoteDataState adoption (completed)

Every remote-read state now goes through the shared component: the community
feed's empty result, the post detail's loading and not-found states, the answers
and follow-up sections, both admin list sections, and both admin tables — plus
`/qa/stats` and `/ai-review`'s session list from earlier. Six now-orphaned rules
(`manage-empty-state`, `admin-v2-loading-copy`, `post-empty-note`,
`qa-empty-title`, `qa-empty-desc`, `post-detail-empty-title`) came out of
`globals.css` with them.

**Deliberately left alone**, because they are not remote-read states:

- `PageLoadingState` on full-page routes — a separate component with its own
  role, as `client-honest-remote-data-states.md` records.
- `<Alert variant="danger">` on the auth forms — submit errors, not reads.
- `RiskCard`'s "No issues found" — a finding, not an absence of data.
- `/ai-review`'s "Clause context starts here." panel — onboarding content with a
  numbered list; converting it would delete design, not boilerplate.
- `/qa/[id]`'s "Redirecting…" spinner — a navigation, not a fetch.

## Not done

- `/qa`'s sidebar and main column still list the same posts when no post is
  pinned or an announcement. They are now disjoint by construction, but with the
  current six-row dataset that is invisible.


## End-to-end

`npx playwright test` from `apps/web`: **52 passed, 1 failed.**

Two `qa-stats` specs failed on the first run and were fixed: they selected
`.qa-error-state`, a class this pass deleted when `/qa/stats` moved to
`RemoteDataState`, and one asserted `/administrators/i` against copy that now
reads "administrator accounts". They now assert `[data-state='permission']`,
which checks the *kind* as well as the words — a stronger test than before, and
one that would have caught the signed-out case being rendered as an error.

The third failure, `ai-review-conversation.spec.ts:60`, was a server config bug
this pass did not cause and has now fixed. `getStableRagErrorCode` had replaced
the provider's `UnsupportedModel` / 404 with the generic
`RAG_INITIAL_QUESTION_FAILED`; calling the RAG path directly surfaced it. The
server's `.env` carried `RAG_CHAT_MODEL=auto`, which Ark's Agent Plan endpoint
rejects. Retrieval was healthy throughout — only generation failed, and the
session was returned anyway, so every AI review answer failed silently.
`RAG_CHAT_MODEL=doubao-seed-2.0-lite` (one of the values `.env.example` already
documents) fixes it.

**Production was not affected** — verified via the Render API: `leaseqa-server`
does not set `RAG_CHAT_MODEL` at all and falls through to the code default
`doubao-seed-2.0-lite`; `leaseqa-server-study` runs `gemini-2.5-pro`. `auto` was
a local-only mistake. Written up in the vault as
`proj/leaseqa/rag-chat-model-auto-breaks-ark-agent-plan.md`.
