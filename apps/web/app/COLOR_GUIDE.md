# Color and Surface Guide

The shipped identity is a **warm editorial** one: paper-toned neutrals, an olive
accent, and terracotta reserved for attention. It is not a blue-grey SaaS
palette, and nothing in the product should read as one.

Every value here was read out of `app/globals.css`. If you change a token,
change it here too.

## Tokens

`globals.css` has one `:root` block holding two namespaces. Both are live.

### `--site-*` — the production surface

Reach for these. Every route refreshed since 2026-08 uses them.

| Token | Value | Use |
| --- | --- | --- |
| `--site-bg` | `#f5f0eb` | Page background |
| `--site-panel` | `#fffcf8` | Cards, menus, raised surfaces |
| `--site-panel-strong` | `#f9f5f0` | Tinted header zones inside a panel |
| `--site-panel-soft` | `#f5f0eb` | Recessed areas |
| `--site-ink` | `#2c2825` | Headings and body text |
| `--site-muted` | `#6b6460` | Secondary text |
| `--site-text-tertiary` | `#9a928c` | Timestamps, meta, hints |
| `--site-border` | `rgba(44,40,37,.1)` | Interior hairlines |
| `--site-border-strong` | `rgba(44,40,37,.18)` | Panel and control edges |
| `--site-accent` | `#5c6e4e` | Olive. Primary actions, active nav |
| `--site-accent-strong` | `#3d4a33` | Olive pressed/hover, text on soft olive |
| `--site-accent-soft` | `#e8ede4` | Olive wash for hover and avatars |
| `--site-highlight` | `#c4704b` | Terracotta. Unread, sign-out, errors |
| `--site-highlight-soft` | `#faf0eb` | Terracotta wash |
| `--site-shadow` | `0 8px 24px rgba(44,40,37,.06)` | Resting card shadow |
| `--site-radius` | `0.75rem` | Default corner |
| `--shell-max-width` | `1140px` | Content column |

### `--color-*` and legacy aliases

An older generation, still referenced by unrefreshed styles. Do not use in new
work, and do not delete without checking references — several are load-bearing.

Notable: `--accent-purple` maps to olive and `--accent-blue` maps to olive. The
names lie; the product has no purple or blue. Prefer `--site-accent`.

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
hover washes. Terracotta is for things the renter should notice — an unread
notification, a load failure, sign-out. Using terracotta as a second brand
colour flattens that signal.

Destructive actions use `--color-accent-error` (`#b5473a`, a warm red) rather
than terracotta or Bootstrap's `#dc3545`. Never leave Bootstrap's `text-danger`
in place; it clashes with every neutral in the file.

## Typography

Two families, both loaded in `app/layout.tsx` via `next/font/google`:

- `--font-body` — **DM Sans**. All UI text.
- `--font-display` — **Nunito Sans**, falling back to `Iowan Old Style, Georgia,
  serif`. Headings and editorial titles.

Prominent navigation and action labels use Title Case (`Review My Lease`,
`Go to Account`). Small section labels are uppercase with wide tracking
(`0.09em`–`0.14em`) at `0.61rem`–`0.69rem`, in `--site-muted`.

## Radius

`--site-radius` (`0.75rem`) is the default. Controls in the header cluster use
`0.625rem`, menu rows `0.5rem`, and pills `999px`. Nothing is fully square.

## Touch targets and motion

- Interactive rows are at least **44×44 CSS pixels** below 768px. Desktop rows
  may relax to `2.375rem`.
- Focus must stay visible. The convention is an inset ring:
  `inset 0 0 0 2px rgba(92,110,78,.45)`.
- Transitions are short and on named properties — `background 0.15s ease`, not
  `transition: all`.
- `globals.css` carries a global `prefers-reduced-motion: reduce` block that
  collapses every transition and animation. Any new animation must survive it.

## Adding a colour

Don't, if an existing token is close. The palette is deliberately small: two
accents, four neutrals, three text weights. If you genuinely need a new value,
add it to the `--site-*` group in the single `:root` block, document it in the
table above, and run:

```bash
node scripts/check-visual-regression.mjs --out before.json
```

before and after, then `--compare` the two, so you can show what moved.
