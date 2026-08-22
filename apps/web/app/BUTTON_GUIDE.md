# Button Guide

Buttons use the `.btn-unified` family in `app/globals.css`. Colours come from
the warm system documented in `COLOR_GUIDE.md`.

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

So there are three appearances, not seven. Picking `success` over `primary`
changes nothing visually — it only misleads the next reader. Use `primary`,
`secondary`, or `danger` and let the label carry the meaning.

If you need a genuinely distinct fourth appearance, add it to the winning
generation rather than reviving one of the collapsed aliases.

## Structure

Every button takes the base class, one variant, and one size:

```html
<button type="button" class="btn-unified btn-unified-primary btn-unified-md">
  Review My Lease
</button>
```

## Sizes

| Class | Min height | Padding |
| --- | --- | --- |
| `btn-unified-sm` | `2.35rem` | `0.5rem 0.8rem` |
| `btn-unified-md` | `2.75rem` | `0.7rem 1.05rem` |
| `btn-unified-lg` | `3.1rem` | `0.85rem 1.3rem` |

The base `.btn-unified` sets `min-height: 3rem`, so a size class is what brings
it down — omitting one gives you a taller button than you probably intended.

**`btn-unified-sm` is below the 44px touch minimum.** Don't use it as a primary
touch target on mobile; keep it for dense desktop toolbars, or pair it with
extra padding on small viewports.

## Variants in practice

- **Primary** — one per view. The main thing the renter came to do.
- **Secondary** — everything alongside it: Cancel, Back, alternative routes.
- **Danger** — destructive and irreversible only. Not for Cancel.

Sign-out is not destructive. It uses the warm terracotta treatment
(`--site-highlight`), not `danger`. See the header profile menu.

## Labels

Title Case for prominent navigation and actions: `Review My Lease`,
`Create Account`, `Go to Account`, `Sign Out`. Match the surrounding surface
rather than inventing a new casing.

Avoid directive phrasing that tells a renter what to do about their lease. The
product surfaces information, sources, and questions to verify — labels should
too.

## States

- `:disabled` gets `cursor: not-allowed` and reduced opacity from the base rule.
  Keep the element focusable-adjacent; do not remove the label.
- Hover on primary deepens to `--site-accent-strong`. There is no lift or scale
  transform — `transform: none` is set on purpose.
- Focus must remain visible. Do not set `outline: none` without an inset ring
  replacement.
- The global `prefers-reduced-motion: reduce` block flattens transitions, so any
  hover effect has to read as a static state change too.

## Do not

- Use raw Bootstrap `btn btn-primary` — it brings its own blue.
- Leave `text-danger` on a control; it clashes with the warm neutrals.
- Add `transition: all`.
- Introduce a new button class without checking whether one of the three real
  appearances already covers it.
