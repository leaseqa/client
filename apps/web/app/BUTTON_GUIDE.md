# Button Guide

Buttons use the `.btn-unified` family in `app/globals.css`. Colours come from
the warm system in `COLOR_GUIDE.md`.

## The important caveat

`globals.css` declares `.btn-unified` twice. The **second** generation wins, and
it deliberately collapses variants:

| Class | What actually renders |
| --- | --- |
| `btn-unified-primary` | Olive fill, white text |
| `btn-unified-success` | **Identical to primary** |
| `btn-unified-info` | **Identical to primary** |
| `btn-unified-secondary` | Transparent, strong border, ink text |
| `btn-unified-outline` | **Identical to secondary** |
| `btn-unified-ghost` | **Identical to secondary** |
| `btn-unified-danger` | Warm red fill (`--color-accent-error`) |

Three appearances, not seven. Picking `success` over `primary` changes nothing
on screen — it only misleads the next reader. Use `primary`, `secondary`, or
`danger` and let the label carry the meaning.

If you need a genuinely distinct fourth appearance, add it to the winning
generation rather than reviving one of the collapsed aliases.

## Structure

Base class, one variant, one size:

```html
<button type="button" class="btn-unified btn-unified-primary btn-unified-md">
  Review My Lease
</button>
```

## Sizes

| Class | Min height | Padding |
| --- | --- | --- |
| `btn-unified-md` | `2.75rem` | `0.7rem 1.05rem` |
| `btn-unified-lg` | `3.1rem` | `0.85rem 1.3rem` |

The base `.btn-unified` sets `min-height: 3rem`, so a size class is what brings
it *down* — omitting one gives a taller button than you probably intended.

There is no `sm`. It used to exist at `2.35rem` (38px), under the 44px touch
minimum, with a mobile media query lifting it to `2.75rem` — which made it
identical to `md` on exactly the viewports where the difference would have
mattered. One call site used it. A size tier meaning "38px on desktop, 44px on
mobile" next to one meaning "44px always" is not a distinction anyone can apply,
so it is gone rather than patched. If a genuinely denser desktop control is
needed later, add it back deliberately with a touch story that holds up.

## Variants in practice

- **Primary** — one per view. The main thing the renter came to do.
- **Secondary** — everything alongside it: Cancel, Back, alternative routes.
- **Danger** — destructive and irreversible only. Not for Cancel.

Sign-out is not destructive. It uses the terracotta treatment
(`--site-highlight`), not `danger`. See the header profile menu.

## States

**Hover.** Primary deepens to `--site-accent-strong`. No lift, no scale —
`transform: none` is set on purpose.

**Disabled.** An explicit muted surface, not reduced opacity:

```css
background: var(--site-panel-strong);
border-color: var(--site-border-strong);
color: var(--site-muted);
```

Fading a filled button leaves white text on a washed accent — the AI review
submit measured **2.03:1** that way, which is unreadable rather than merely
quiet. Disabled controls are formally exempt from WCAG contrast, but the point
of a disabled label is that you can still read what the button would do. The
muted surface lands at 5.3:1. Do not replace it with `opacity`.

**Focus.** Must stay visible. Do not set `outline: none` without an inset ring
replacement.

**Reduced motion.** The global `prefers-reduced-motion: reduce` block flattens
transitions, so any hover effect has to read as a static state change too.

## Labels

Title Case for prominent navigation and actions: `Review My Lease`,
`Create Account`, `Go to Account`, `Sign Out`. Match the surrounding surface
rather than inventing a new casing.

Avoid directive phrasing that tells a renter what to do about their lease. The
product surfaces information, sources, and questions to verify — labels should
too.

## Do not

- Use raw Bootstrap `btn btn-primary`; it brings its own blue.
- Leave `text-danger` on a control.
- Add `transition: all` — it is a test failure, not a preference.
- Introduce a new button class without checking whether one of the three real
  appearances already covers it.
