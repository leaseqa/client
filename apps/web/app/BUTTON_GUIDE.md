# Button Guide

Buttons use the `.btn-warm-*` family in `app/globals.css`. Colours come from
the warm system in `COLOR_GUIDE.md`; shape comes from the Swiss layout — square
corners, no shadow, no lift.

## Three appearances

| Class | What renders | Hover |
| --- | --- | --- |
| `btn-warm-primary` | Olive fill, white text | Deepens to `--site-accent-strong` |
| `btn-warm-outline` | Transparent, `--site-border-strong` edge, ink text | Olive edge on an olive wash |
| `btn-warm-highlight` | Terracotta edge, `--site-highlight-strong` text | Terracotta wash |

That is the whole family. The invariant test fails if a retired family
(`btn-unified`, `btn-pill`, `btn-gradient`) comes back.

### Older control classes

`.post-btn`, `.compose-form-btn` and `.manage-btn` (each with `.primary` and
`.secondary`) and `.remote-data-state-action` predate the one-family rule. They
render the primary or outline appearance under their own class — same colours,
same hover — and nothing new should join them. A new button is a `btn-warm-*`.

`.qa-toolbar-btn` is the feed toolbar. Its `.primary` is the primary
appearance; `.secondary` and `.active` are the off and on states of a
segmented toggle (olive wash when on), not a fourth appearance.

Two styles look like buttons and are not new appearances:

- The home hero CTA (`.primaryAction` in `home.module.css`) is the primary
  appearance at hero size, with its arrow.
- `.admin-v2-link-btn` is a button that reads as a link — underlined olive
  text — because it sits in a sentence-like row.

## Structure

Base class and nothing else:

```html
<button type="button" class="btn-warm-primary">Review my lease</button>
```

A `btn-warm-*` is at least `2.75rem` tall at every width, square, `0.875rem`
semibold. The older control classes may sit tighter on desktop and reach
`2.75rem` below 768px, as the touch-target rule in `COLOR_GUIDE.md` allows.

## Variants in practice

- **Primary** — one per view. The main thing the renter came to do. On the
  account page, opening the profile form hands the primary to Save changes;
  the masthead's Review my lease steps down to outline while the form is open.
- **Outline** — everything alongside it: Cancel, Back, Edit profile.
- **Highlight** — sign-out on the account page, and nothing else. Sign-out is
  not destructive; it takes terracotta because it is something to notice.

**Destructive and irreversible actions** use the warm red (`--site-danger`),
never terracotta. Today they are all icon buttons that turn warm red on hover:
delete and ban in the admin tables, which ask for confirmation first, and
delete on a question, an answer or a follow-up. If a text button ever needs
that, add a `btn-warm-danger` in warm red; do not reuse `btn-warm-highlight`.

## States

**Hover.** Primary deepens to `--site-accent-strong`. No lift, no scale, no
shadow.

**Disabled.** An explicit muted surface, not reduced opacity:

```css
background: var(--site-panel-strong);
border-color: var(--site-border);
color: var(--site-muted);
```

Fading a filled button leaves white text on a washed accent — the AI review
submit measured **2.03:1** that way, which is unreadable rather than merely
quiet. The muted surface stays readable. Do not replace it with `opacity`;
that goes for icon buttons too.

**Focus.** `outline: var(--focus-ring)` (2px olive) offset 2px. Do not set
`outline: none` without a replacement.

**Reduced motion.** The global `prefers-reduced-motion: reduce` block flattens
transitions, so any hover effect has to read as a static state change too.

## Labels

Sentence case, and an action keeps its name through the flow: the home CTA,
the account page and the review page all say **Review my lease**; the register
form, its button and the header menu all say **Create account**.

Avoid directive phrasing that tells a renter what to do about their lease. The
product surfaces information, sources, and questions to verify — labels should
too.

## Do not

- Use raw Bootstrap `btn btn-primary`; it brings its own blue.
- Leave `text-danger` on a control.
- Add `transition: all` — it is a test failure, not a preference.
- Round a corner. A `border-radius` other than `var(--site-radius)` is a test
  failure.
- Introduce a new button class without checking whether one of the three
  appearances already covers it.
