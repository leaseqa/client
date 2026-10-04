# Swiss Layout Pass

**Date:** 2026-10-04
**Status:** implemented on the working tree; not committed.

## Request

"Polish the frontend into one consistent Swiss style, building on what is
there, and fix bugs along the way." After the first comparison the owner
narrowed it: **change style and layout only — keep the colour scheme.** A
draft that replaced the palette with paper, black and red was rejected on that
ground and rolled back before any source was touched.

## Rules for this pass

1. **Palette unchanged.** Every colour keeps its value and its role: olive
   acts, terracotta marks what to notice, warm red marks errors and
   destructive actions. The old `--color-accent-error` (`#b5473a`) moved into
   the namespace as `--site-danger`; the other new names are values the
   stylesheet already used as literals (`--site-highlight-strong` `#a85735`,
   `--site-mark` `#ead7a8`, `--site-on-accent` `#fff`, `--site-danger-soft`
   `#fbf4f2`).
2. **Swiss is structure and type:** one grotesque on a flush-left grid; a heavy
   ink rule under every masthead; sections open on a 2px rule and split rows
   with hairlines instead of cards; square corners; no shadows; a fixed type
   scale with display sizes as tokens.
3. Comparison images first, approval, then tests, then implementation — as in
   the de-AI pass.
4. Routes, backend contracts and the wordmark text stay as they are.

## What changed

**Type.** Archivo replaces DM Sans and Nunito Sans (and the home hero's
Georgia), used across its width axis: semi-expanded display, normal text,
condensed uppercase index labels.

**Structure.** Mastheads, the community feed, the question thread, the lease
review workspace and transcript, account, auth, about, stats, resources,
compose and admin were consolidated onto ruled sections. In `globals.css` the
several generations of rules for each of these areas were replaced by one
block per area; the legacy `--color-*` aliases were collapsed onto `--site-*`;
every literal colour became a token; every radius became `--site-radius`.
Rules for 56 classes nothing renders, and 21 declarations a later rule with the
same selector always overrides, were deleted; the computed-style fingerprint
(`scripts/check-visual-regression.mjs`, 36 page/viewport pairs, live data) was
identical before and after.

**Copy.** Sentence case throughout, and one name per destination: navigation
reads "Lease review" and "Community"; the account CTA reads "Review my lease";
the register button reads "Create account"; a pasted clause is "Pasted clause"
in the history, the results header and the citation chip. Claims stay as they
were — only the names changed.

## Bugs fixed

| Defect | Fix |
| --- | --- |
| Mobile menu toggle announced as "Toggle navigation": react-bootstrap overwrites a passed `aria-label` | pass `label` |
| Avatar initials "DE" for "Demo Tenant" | `initialsFor` takes first and last word |
| `/qa/manage` hydration error on every full load (session resolved before the page segment hydrated) | Redux `Provider serverState` = initial store state |
| Unread dot used undefined `--site-warm`, and notifications loaded only after the menu was opened | defined colour; load on session change |
| Review status "Ready" green-on-green (Bootstrap Badge recoloured by a module rule) | palette status label |
| Feed and sidebar rows were `div`s with click handlers — unreachable by keyboard | links |
| Pinned announcements listed under both Pinned and Updates | Updates excludes pinned |
| Previews appended "..." to text that was never truncated | CSS line clamp, `toPlainText` |
| Post meta showed the topic slug (`security_deposit`) | display name |
| "1 discussions" | `countLabel` |
| Review history and results showed `pasted-text`; a "+" that did nothing | `formatSourceName`; removed |
| Status radios hidden with `display: none` — not keyboard operable | visually hidden, grouped by `name` |
| Spinners rendered Bootstrap blue | `--bs-primary` re-themed |
| Toast not announced; close button unnamed | `role`, `aria-label` |
| Unnamed icon buttons, unlabelled form fields and role select | names and `htmlFor` |
| Admin table columns drifted when one row carried a badge (flex rows) | grid rows |
| `/qa/stats` logged expected 401/403 as errors | log only the unexpected case |
| `check-visual-regression.mjs` defaulted to `127.0.0.1`, where Next blocks dev assets, so client routes were fingerprinted as loading shells | default to `localhost` |

## Review follow-up

The two-axis review (standards, spec) found the first draft had moved error
and destructive states from warm red to terracotta and dropped the colour of
the Pinned, Resolved and Verified badges; all restored. It also brought the
guides and code back in line: no bare `1fr` tracks, no `opacity` on disabled
icon buttons, a 44px toast close target, outline-style hover on the older
secondary buttons, one primary per view on the account page, and the
terracotta button renamed `btn-warm-highlight` so "danger" keeps meaning
destructive.

## Ratchets added

`scripts/design-system-invariants.test.mjs`: colours come only from the token
block; every `border-radius` is `--site-radius` (spinners may use `50%`). The
heading-scale exclusion list shrank to `.site-wordmark`.

## Related

The CI MongoDB service images (`client` paired e2e, `server` CI) moved from
`mongo:7` to `mongo:9.0` to match local development, and the local data
directory was upgraded from featureCompatibilityVersion 8.2 to 9.0.
