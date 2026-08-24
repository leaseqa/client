# Colour and Surface Guide

The shipped identity is **warm editorial**: paper-toned neutrals, an olive
accent, terracotta held back for attention. Not a blue-grey SaaS palette, and
nothing in the product should read as one.

Every value here was read out of `app/globals.css`. If you change a token,
change it here too — the last time these drifted apart, this file was still
describing an indigo system the product had not used for months.

Several of these rules are enforced by `scripts/design-system-invariants.test.mjs`,
which runs as part of `npm test`. Where that is the case it is called out below.

## Tokens

`globals.css` has exactly **one** `:root` block. Adding a second is a test
failure, not a style opinion — two blocks is how the file ended up with tokens
that silently shadowed each other.

It holds two namespaces. Both are live.

### `--site-*` — the production surface

Reach for these. Everything refreshed since 2026-08 uses them.

| Token | Value | Use |
| --- | --- | --- |
| `--site-bg` | `#f5f0eb` | Page background |
| `--site-panel` | `#fffcf8` | Cards, menus, raised surfaces |
| `--site-panel-strong` | `#f9f5f0` | Tinted zones inside a panel; disabled controls |
| `--site-panel-soft` | `#f5f0eb` | Recessed areas |
| `--site-ink` | `#2c2825` | Headings and body text |
| `--site-muted` | `#6b6460` | Secondary text |
| `--site-text-tertiary` | `#706861` | Timestamps, meta, hints |
| `--site-border` | `rgba(44,40,37,.1)` | Interior hairlines |
| `--site-border-strong` | `rgba(44,40,37,.18)` | Panel and control edges |
| `--site-accent` | `#5c6e4e` | Olive. Primary actions, active nav |
| `--site-accent-strong` | `#3d4a33` | Olive hover/pressed; text on olive wash |
| `--site-accent-soft` | `#e8ede4` | Olive wash for hover and avatars |
| `--site-highlight` | `#c4704b` | Terracotta. Unread, sign-out |
| `--site-highlight-soft` | `#faf0eb` | Terracotta wash |
| `--site-shadow` | `0 8px 24px rgba(44,40,37,.06)` | Resting card shadow |
| `--site-radius` | `0.75rem` | Default corner |
| `--shell-max-width` | `1140px` | Content column |

`--site-text-tertiary` is `#706861`, not the lighter grey it started as. At the
original value, timestamps and meta text sat at 2.9:1 on `--site-panel` — below
AA for body copy. Do not lighten it back.

### `--color-*` and the legacy aliases

An older generation, still referenced by styles that have not been revisited. Do
not use in new work, and do not delete without checking references — several are
load-bearing.

The alias names lie: `--accent-purple` and `--accent-blue` both resolve to
olive. The product has no purple and no blue. The aliases stay defined for
back-compat, but **using** one is a test failure. Reach for `--site-accent`.

## Applying colour

```css
/* page */
background: var(--site-bg);

/* raised surface */
background: var(--site-panel);
border: 1px solid var(--site-border-strong);
border-radius: var(--site-radius);
box-shadow: var(--site-shadow);

/* primary action */
background: var(--site-accent);
color: #fff;

/* hover on a menu row */
background: var(--site-accent-soft);
color: var(--site-accent-strong);

/* attention, not danger */
color: var(--site-highlight);
background: var(--site-highlight-soft);
```

### Olive versus terracotta

Olive is the default accent: primary buttons, active navigation, focus rings,
hover washes. Terracotta marks what the renter should notice — an unread
notification, sign-out. Treating terracotta as a second brand colour flattens
that signal.

Destructive actions use `--color-accent-error` (`#b5473a`, a warm red), not
terracotta and not Bootstrap's `#dc3545`. Never leave `text-danger` on a
control; it clashes with every neutral in the file.

### Inverted surfaces

A few surfaces run dark on `--site-ink`. Warm-on-paper defaults do not survive
there: `--site-muted` on `--site-ink` measures 2.52:1. Anything placed on a dark
panel needs its own colours — light text at ~74% opacity and a lightened accent
both clear AA comfortably.

## Bootstrap load order

`app/layout.tsx` imports Bootstrap **before** `globals.css`:

```ts
import "bootstrap/dist/css/bootstrap.min.css";
import "@/app/globals.css";
```

The order matters and is not incidental. Bootstrap and the overrides collide at
equal specificity on selectors like `.text-secondary`, so whichever loads last
wins. With the old order, `.text-secondary` resolved to Bootstrap's `#6c757d`
everywhere despite an override sitting right there in `globals.css`. Do not
reorder these two lines.

## Typography

Two families, loaded in `app/layout.tsx` via `next/font/google`:

- `--font-body` — **DM Sans**. All UI text.
- `--font-display` — **Nunito Sans**, falling back to `Iowan Old Style, Georgia,
  serif`. Headings and editorial titles.

Prominent navigation and action labels use Title Case (`Review My Lease`,
`Go to Account`). Small section labels are uppercase with wide tracking
(`0.09em`–`0.14em`) at `0.61rem`–`0.69rem`, in `--site-muted`.

## Type scale — body layer

Everything below 16px sits on six steps. Nothing between them.

| rem | px | Use |
| --- | --- | --- |
| `0.625rem` | 10 | Micro labels, tracked uppercase eyebrows |
| `0.6875rem` | 11 | Meta, timestamps, counts |
| `0.75rem` | 12 | Captions, secondary detail |
| `0.8125rem` | 13 | Secondary body |
| `0.875rem` | 14 | Body |
| `0.9375rem` | 15 | Emphasised body, menu rows |

This band held **34 distinct values** before: 13.12, 13.28, 13.44 and 13.6px all
existed side by side, which is not a hierarchy anyone chose. Collapsing them
moved no value by more than 0.68px, because the band was dense enough that every
size already had a neighbour.

## Type scale — heading layer

16px and above sits on five steps.

| rem | px | Use |
| --- | --- | --- |
| `1rem` | 16 | Lead copy, inline titles |
| `1.125rem` | 18 | Small section headings |
| `1.25rem` | 20 | Section headings |
| `1.5rem` | 24 | Page and card titles |
| `2rem` | 32 | Hero |

These were assigned **by role, not by nearest number**. The band is sparse, so
rounding produces real jumps and lands on the wrong answer: an automatic pass
put `.compose-form-title` and `.journey h2` — both card-level headings — into
different steps purely because one was 21.6px and the other 20.8px.

**Four values sit outside the scale on purpose.** They use `font-size` to size a
glyph or a figure, not to place text in a hierarchy:

- `.account-avatar`, `.avatar-circle`, `.team-avatar`, `.emoji-icon-lg`,
  `.sidenav-icon` — avatar and icon glyphs
- `.site-wordmark` — the brand mark
- `.primaryAction span` — the CTA arrow
- `.admin-v2-card-value`, `.stat-box-value`, `.landing-stat-val`,
  `.review-summary-count span` — display figures

Sizing an icon with `font-size` works but hides it from the type scale. Moving
those to explicit `width`/`height` would let the exclusion list go away; until
then the invariant skips them by name.

Two tests assert both bands hold only their steps.

## Radius

`--site-radius` (`0.75rem`) is the default. Header controls use `0.625rem`, menu
rows `0.5rem`, pills `999px`. Nothing is fully square.

## Touch targets, focus, motion

- Interactive controls are at least **44×44 CSS pixels** below 768px. Desktop
  may go tighter. Inline links inside a sentence are exempt (WCAG 2.5.8);
  padding them out breaks the line box.
- Where the visible control is small, the **hit area** is what must reach 44px —
  a 16px checkbox inside a 44px label is fine.
- Focus stays visible. The convention is an inset ring:
  `inset 0 0 0 2px rgba(92,110,78,.45)`.
- Transitions name their properties. `transition: all` is a test failure.
- `globals.css` carries a global `prefers-reduced-motion: reduce` block that
  collapses every transition and animation. New animation must survive it.

## Grid tracks

Use `minmax(0, 1fr)`, never a bare `1fr`, for any track holding text or form
controls. A bare `1fr` means `minmax(auto, 1fr)`, and an `auto` minimum refuses
to shrink below the item's min-content width — which is exactly how the compose
form came to be 351px wide inside a 301px container, hidden behind an
`overflow: hidden`. Bare `grid-template-columns: 1fr` is a test failure.

## Adding a colour

Don't, if an existing token is close. The palette is deliberately small: two
accents, four neutrals, three text weights. If you genuinely need a new value,
add it to the `--site-*` group in the single `:root` block, document it in the
table above, and prove the change is inert everywhere else:

```bash
node scripts/check-visual-regression.mjs --out before.json
# make the change
node scripts/check-visual-regression.mjs --out after.json
node scripts/check-visual-regression.mjs --compare before.json after.json
```

It fingerprints computed styles for every element across twelve routes at three
viewports and names the element and property that moved.
