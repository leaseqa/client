# Unified Button System Guide

## Overview

The button system follows a consistent design pattern with standardized variants and sizes, aligned with the 60-30-10 color rule.

## Button Variants

### Primary (Main CTA)
- **Usage**: Primary actions, main CTAs
- **Color**: Uses 10% accent color (`--color-accent-primary`)
- **Example**: "Start AI Review", "Submit", "Save"

```html
<a href="/action" class="btn-unified btn-unified-primary btn-unified-md">
    Primary Action
</a>
```

### Secondary
- **Usage**: Secondary actions, alternative options
- **Color**: White background with border
- **Example**: "Cancel", "Back", alternative navigation

```html
<a href="/action" class="btn-unified btn-unified-secondary btn-unified-md">
    Secondary Action
</a>
```

### Outline
- **Usage**: Outlined style, less prominent actions
- **Color**: Transparent with colored border
- **Example**: "Learn More", "View Details"

```html
<a href="/action" class="btn-unified btn-unified-outline btn-unified-md">
    Outline Action
</a>
```

### Ghost
- **Usage**: Minimal style, subtle actions
- **Color**: Transparent, text only
- **Example**: "Skip", "Dismiss"

```html
<a href="/action" class="btn-unified btn-unified-ghost btn-unified-md">
    Ghost Action
</a>
```

### Danger
- **Usage**: Destructive actions
- **Color**: Error color (`--color-accent-error`)
- **Example**: "Delete", "Remove", "Cancel Subscription"

```html
<a href="/action" class="btn-unified btn-unified-danger btn-unified-md">
    Delete
</a>
```

### Success
- **Usage**: Success/confirmation actions
- **Color**: Success color (`--color-accent-success`)
- **Example**: "Confirm", "Approve"

```html
<a href="/action" class="btn-unified btn-unified-success btn-unified-md">
    Confirm
</a>
```

## Button Sizes

### Small (`btn-unified-sm`)
- **Padding**: `0.375rem 0.875rem`
- **Font Size**: `0.8125rem`
- **Usage**: Compact spaces, inline actions

### Medium (`btn-unified-md`) - Default
- **Padding**: `0.5rem 1.25rem`
- **Font Size**: `0.875rem`
- **Usage**: Standard buttons, most common size

### Large (`btn-unified-lg`)
- **Padding**: `0.75rem 1.75rem`
- **Font Size**: `0.9375rem`
- **Usage**: Hero sections, prominent CTAs

## Usage Examples

### Hero Section CTA
```html
<a href="/ai-review" class="btn-unified btn-unified-primary btn-unified-lg">
    Start AI Review
</a>
```

### Card Action Button
```html
<a href="/qa" class="btn-unified btn-unified-primary btn-unified-md">
    Open Q&A →
</a>
```

### Secondary Navigation
```html
<a href="/explore" class="btn-unified btn-unified-outline btn-unified-lg">
    Explore Q&A
</a>
```

### Form Actions
```html
<div class="d-flex gap-2">
    <button type="submit" class="btn-unified btn-unified-primary btn-unified-md">
        Submit
    </button>
    <button type="button" class="btn-unified btn-unified-secondary btn-unified-md">
        Cancel
    </button>
</div>
```

### Destructive Action
```html
<button type="button" class="btn-unified btn-unified-danger btn-unified-sm">
    Delete Post
</button>
```

## Button States

### Hover
- Primary/Secondary/Danger/Success: Slight lift (`translateY(-1px)`) with shadow
- Outline/Ghost: Background color change

### Active
- Slight press effect (`translateY(0)`)

### Disabled
- `opacity: 0.6`
- `cursor: not-allowed`
- No hover effects

## Design Principles

1. **Consistency**: All buttons use the same base class (`btn-unified`)
2. **Hierarchy**: Primary buttons are most prominent (10% accent color)
3. **Accessibility**: High contrast, clear states, keyboard navigable
4. **Minimal**: Clean design aligned with the minimal & fresh aesthetic
5. **Responsive**: Works well on all screen sizes

## Migration from Old System

### Old (React Bootstrap)
```jsx
<Button href="/action" variant="danger" className="btn-pill-lg">
    Action
</Button>
```

### New (Unified System)
```html
<a href="/action" class="btn-unified btn-unified-primary btn-unified-lg">
    Action
</a>
```

## Color Mapping

- `variant="primary"` → `btn-unified-primary`
- `variant="secondary"` → `btn-unified-secondary`
- `variant="outline"` → `btn-unified-outline`
- `variant="danger"` → `btn-unified-danger`
- `variant="success"` → `btn-unified-success`
