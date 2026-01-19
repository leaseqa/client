# Color System Guide - Minimal & Fresh Design

## Overview

This color system follows the **60-30-10 rule** for a minimal and fresh design aesthetic.

## Color Palette

### 60% - Dominant Color (Backgrounds)
```
Primary Background:   #f8fafc  (Soft blue-gray)
Secondary Background: #f1f5f9  (Slightly darker)
Tertiary Background:  #e2e8f0  (Hover states)
```
**Usage**: Page backgrounds, large empty spaces, subtle sections

### 30% - Secondary Color (Content Areas)
```
Card Background:        #ffffff  (Pure white)
Panel Background:   #f9fafb  (Very light gray)
Panel Hover:        #f1f5f9  (Light gray)
```
**Usage**: Cards, content containers, panels, modals

### 10% - Accent Color (Highlights & CTAs)
```
Primary Accent:     #6366f1  (Soft indigo) - Main CTAs
Secondary Accent:   #8b5cf6  (Soft purple) - Secondary actions
Success:             #10b981  (Fresh green)
Warning:             #f59e0b  (Warm amber)
Error:               #ef4444  (Soft red)
Info:                #3b82f6  (Blue)
```
**Usage**: Buttons, links, icons, highlights, badges

## Text Colors

```
Primary Text:   #1e293b  (Dark slate) - Headings, main text
Secondary Text: #64748b  (Medium slate) - Body text
Muted Text:     #94a3b8  (Light slate) - Hints, labels
Inverse Text:   #ffffff  (White) - On dark backgrounds
```

## Border Colors

```
Primary Border:   #e2e8f0  (Light gray-blue)
Secondary Border: #cbd5e1  (Medium gray-blue)
Subtle Border:    #f1f5f9  (Very light gray-blue)
```

## CSS Variables Usage

### Backgrounds
```css
/* Page background (60%) */
background: var(--color-bg-primary);

/* Card background (30%) */
background: var(--color-panel);

/* Hover state */
background: var(--color-bg-secondary);
```

### Text
```css
/* Primary text */
color: var(--color-text-primary);

/* Secondary text */
color: var(--color-text-secondary);

/* Muted text */
color: var(--color-text-muted);
```

### Accents (10%)
```css
/* Primary button/CTA */
background: var(--color-accent-primary);
color: var(--color-text-inverse);

/* Success state */
color: var(--color-accent-success);

/* Error state */
color: var(--color-accent-error);
```

### Borders
```css
border: 1px solid var(--color-border-primary);
```

## Gradients

All gradients are soft and subtle:

```css
/* Primary gradient (indigo to purple) */
background: var(--gradient-primary);

/* Success gradient */
background: var(--gradient-success);

/* Info gradient */
background: var(--gradient-info);
```

## Color Application Examples

### Buttons
- **Primary Button**: `var(--color-accent-primary)` background, white text
- **Secondary Button**: White background, `var(--color-border-primary)` border
- **Text Button**: Transparent, `var(--color-accent-primary)` text

### Cards
- **Card Background**: `var(--color-panel)` (white)
- **Card Border**: `var(--color-border-primary)`
- **Card Hover**: `var(--color-panel-hover)`

### Icons
- **Primary Icon**: `var(--color-accent-primary)`
- **Secondary Icon**: `var(--color-text-secondary)`
- **Success Icon**: `var(--color-accent-success)`

## Migration Notes

All legacy color variables are mapped to the new system for backward compatibility:
- `--ink` → `--color-text-primary`
- `--panel` → `--color-panel`
- `--accent-purple` → `--color-accent-secondary`
- `--primary` → `--color-accent-primary`

You can gradually migrate to the new variable names.
