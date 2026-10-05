# Colour and Surface Guide

The shipped identity is **warm editorial**: paper-toned neutrals, an olive
accent, terracotta held back for attention, a warm red for errors. Not a
blue-grey SaaS palette, and nothing in the product should read as one.

The layout on top of it is **Swiss**: one grotesque, flush-left on the shell's
grid, structure drawn with ink rules rather than cards, square corners and no
shadows. The Swiss pass changed structure and type, not colour — every token
value below predates it.

Every value here was read out of `app/globals.css`. If you change a token,
change it here too — the last time these drifted apart, this file was still
describing an indigo system the product had not used for months.

Several of these rules are enforced by `scripts/design-system-invariants.test.mjs`,
which runs as part of `npm test`. Where that is the case it is called out below.

## Tokens

`globals.css` has exactly **one** `:root` block. Adding a second is a test
failure, not a style opinion — two blocks is how the file ended up with tokens
that silently shadowed each other.

It holds one namespace, `--site-*`. The older `--color-*` generation and its
aliases (`--text-dark`, `--qa-border`, `--accent-blue`, …) were collapsed onto
it, so a rule now names the role it wants directly.

**Every colour comes from this block.** A hex, `rgb()` or `white` written into
a rule anywhere else is a test failure.

| Token | Value | Use |
| --- | --- | --- |
| `--site-bg` | `#f5f0eb` | Page background |
| `--site-panel` | `#fffcf8` | Surfaces, menus, framed tools |
| `--site-panel-strong` | `#f9f5f0` | Tinted zones inside a panel; disabled controls |
| `--site-panel-soft` | `#f5f0eb` | Recessed areas |
| `--site-ink` | `#2c2825` | Headings, body text, structural rules |
| `--site-muted` | `#6b6460` | Secondary text |
| `--site-text-tertiary` | `#706861` | Timestamps, meta, labels |
| `--site-border` | `rgba(44,40,37,.1)` | Hairlines between rows |
| `--site-border-strong` | `rgba(44,40,37,.18)` | Control edges: inputs, outline buttons |
| `--site-accent` | `#5c6e4e` | Olive. Primary actions, active navigation, focus |
| `--site-accent-strong` | `#3d4a33` | Olive hover/pressed; text on olive wash |
| `--site-accent-soft` | `#e8ede4` | Olive wash for hover and selection |
| `--site-highlight` | `#c4704b` | Terracotta marks and rules |
| `--site-highlight-strong` | `#a85735` | Terracotta **text** (5.0:1 on `--site-panel`) |
| `--site-highlight-soft` | `#faf0eb` | Terracotta wash |
| `--site-danger` | `#b5473a` | Warm red. Errors and destructive actions — marks **and** text (4.7:1 on `--site-bg`) |
| `--site-danger-soft` | `#fbf4f2` | Warm red wash behind an error |
| `--site-mark` | `#ead7a8` | Highlighter band on quoted lease language |
| `--site-on-accent` | `#ffffff` | Text on an olive or warm-red fill |
| `--site-radius` | `0` | The only corner |
| `--shell-max-width` | `1140px` | Content column |

None of the names the Swiss pass added is a new colour. `--site-danger` is the
old `--color-accent-error`, moved into this namespace; the others are values
the stylesheet already used as literals, now named: `#a85735` on the urgent
badge, `#ead7a8` on the home example's highlighter, `#fff` on olive, `#fbf4f2`
behind the admin error panel.

`--site-text-tertiary` is `#706861`, not the lighter grey it started as. At the
original value, timestamps and meta text sat at 2.9:1 on `--site-panel` — below
AA for body copy. Do not lighten it back.

Type and rule tokens live in the same block: `--type-display`, `--type-title`,
`--type-figure`, `--stretch-display`, `--stretch-label`, `--tracking-display`,
`--tracking-label`, `--rule-heavy`, `--focus-ring`.

The block also re-themes Bootstrap through its own custom properties, so the
spinners, alerts and form controls it renders stay in palette. Every value is
one of the colours above:

| Bootstrap property | Value |
| --- | --- |
| `--bs-primary` | olive, `#5c6e4e` |
| `--bs-danger`, `--bs-danger-text-emphasis`, `--bs-danger-border-subtle` | warm red, `#b5473a` |
| `--bs-danger-bg-subtle` | warm red wash, `#fbf4f2` |
| `--bs-link-color` / `--bs-link-hover-color` | ink, `#2c2825` / olive, `#3d4a33` |
| `--bs-border-radius` and its sizes | `0` |

## Applying colour

```css
/* page */
background: var(--site-bg);

/* a framed tool: a form, the review workspace */
background: var(--site-panel);
border: 1px solid var(--site-ink);

/* a section: opens on a rule, rows split by hairlines */
border-top: 2px solid var(--site-ink);
border-bottom: 1px solid var(--site-border);

/* primary action */
background: var(--site-accent);
color: var(--site-on-accent);

/* hover on a menu row */
background: var(--site-accent-soft);
color: var(--site-accent-strong);

/* attention, not danger */
color: var(--site-highlight-strong);

/* an error: a warm-red rule and warm-red text */
border-left: var(--rule-heavy) solid var(--site-danger);
color: var(--site-danger);
```

### Olive, terracotta, warm red

Olive is the default accent: primary buttons, active navigation, focus rings,
hover washes, selection bars, and states that went right (resolved, verified).
Terracotta marks what the renter should notice — an unread notification, an
urgent or pinned question, the clause under review, an unverified lawyer,
sign-out. Treating terracotta as a second brand colour flattens that signal.

Errors and destructive actions use `--site-danger` (`#b5473a`, a warm red), not
terracotta and not Bootstrap's `#dc3545`: form and inline errors, the error
toast, a banned user, the hover on delete and ban. Never leave `text-danger` on
a control; it clashes with every neutral in the file.

`--site-highlight` (`#c4704b`) measures 3.5:1 on `--site-panel`, which is fine
for a rule, a square or a bar and too light for small text. Terracotta text
uses `--site-highlight-strong`.

### Rules, not boxes

- A **heavy rule** (`--rule-heavy`, 3px ink) closes every masthead.
- A **2px ink rule** opens a section: a feed, a side note, an account column.
- **Hairlines** (`--site-border`) separate rows inside a section.
- Only tools are framed (1px ink): forms, the review workspace.

Cards with fills and shadows are gone. `box-shadow` is used only for focus and
for the 3px inset bar that marks a row without moving its columns: olive on the
selected row, warm red on a banned user.

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
wins — and the `--bs-*` overrides in `:root` only take effect because they load
second. Do not reorder these two lines.

## Typography

One family, **Archivo**, loaded in `app/layout.tsx` via `next/font/google`
with its width axis, and used across that axis the way Univers was used across
its numbered matrix:

- **Display** — `font-stretch: var(--stretch-display)` (112.5%), 600–700,
  tracked tight. Headings get it from the base `h1`–`h6` rule.
- **Text** — normal width, 400.
- **Index labels** — `font-stretch: var(--stretch-label)` (87.5%), 600,
  uppercase, `--tracking-label`. Every eyebrow, kicker, column header and
  meta line is one of these.

Copy is sentence case everywhere — navigation, buttons, menu rows (`Review my
lease`, `Create account`, `Sign out`). Document names (a template called
"Security Deposit Demand Letter") keep their own casing.

## Type scale — body layer

Everything below 16px sits on six steps. Nothing between them.

| rem | px | Use |
| --- | --- | --- |
| `0.625rem` | 10 | Micro labels |
| `0.6875rem` | 11 | Index labels, meta, counts |
| `0.75rem` | 12 | Captions, secondary detail |
| `0.8125rem` | 13 | Secondary body, controls |
| `0.875rem` | 14 | Body |
| `0.9375rem` | 15 | Emphasised body, menu rows |

This band held **34 distinct values** before: 13.12, 13.28, 13.44 and 13.6px all
existed side by side, which is not a hierarchy anyone chose.

## Type scale — heading layer

16px and above sits on five steps, plus three display sizes that are tokens.

| rem | px | Use |
| --- | --- | --- |
| `1rem` | 16 | Lead copy, inline titles |
| `1.125rem` | 18 | Feed titles, subtitles |
| `1.25rem` | 20 | Section headings |
| `1.5rem` | 24 | Mobile post titles |
| `2rem` | 32 | Post titles, the clause number |
| `--type-title` | 32–44 | Page titles (fluid) |
| `--type-figure` | 44 | Display numerals: stats, journey steps |
| `--type-display` | 44–76 | The home headline (fluid) |

Two tests assert both literal bands hold only their steps. `.site-wordmark` is
the one exclusion: it sizes the brand mark, not a heading.

## Radius

`--site-radius` is `0`, and every `border-radius` in the stylesheets is that
token — a test failure otherwise. The one exception is `50%` on a spinner's
ring, the only shape that has to be round. Avatars, status marks and the unread
mark are squares.

## Touch targets, focus, motion

- Interactive controls are at least **44×44 CSS pixels** below 768px. Desktop
  may go tighter. Inline links inside a sentence are exempt (WCAG 2.5.8);
  padding them out breaks the line box.
- Where the visible control is small, the **hit area** is what must reach 44px —
  a 16px checkbox inside a 44px label is fine.
- Focus is `outline: var(--focus-ring)` — 2px olive, offset 2px. Menu and
  drawer rows take an inset 2px olive ring instead.
- Transitions name their properties. `transition: all` is a test failure.
- `globals.css` carries a global `prefers-reduced-motion: reduce` block that
  collapses every transition and animation. New animation must survive it.

## Grid tracks

Use `minmax(0, 1fr)`, never a bare `1fr`, for any track holding text or form
controls. A bare `1fr` means `minmax(auto, 1fr)`, and an `auto` minimum refuses
to shrink below the item's min-content width — which is exactly how the compose
form came to be 351px wide inside a 301px container, hidden behind an
`overflow: hidden`. Bare `grid-template-columns: 1fr` is a test failure.

Tables are grids too: the admin tables give the header and every row the same
`grid-template-columns`, so a badge in one row cannot push its cells out of line
with the others.

## Adding a colour

Don't, if an existing token is close. The palette is deliberately small: two
accents, a warm red for errors, four neutrals, three text weights. If you
genuinely need a new value,
add it to the `--site-*` group in the single `:root` block, document it in the
table above, and prove the change is inert everywhere else:

```bash
node scripts/check-visual-regression.mjs --out before.json
# make the change
node scripts/check-visual-regression.mjs --out after.json
node scripts/check-visual-regression.mjs --compare before.json after.json
```

It fingerprints computed styles for every element across twelve routes at three
viewports and names the element and property that moved. Point it at the host
the dev server was started with (`localhost` by default). Next blocks its
dev-only assets for any other hostname (see `allowedDevOrigins`), so through
`127.0.0.1` the client routes never hydrate and the run compares loading
shells.
