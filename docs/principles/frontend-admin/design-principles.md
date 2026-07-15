# Design Principles

## Core Rule: Tailwind First

Always reach for Tailwind utility classes before writing any custom CSS.
Only write CSS when Tailwind cannot do it.

---

## Where to Write CSS

| Situation | Where to write it |
|---|---|
| Design tokens (colours, semantics) | `src/styles/global.css` inside `@theme {}` and `.dark {}` |
| Reusable patterns used in 3+ components | `src/styles/global.css` inside `@layer components {}` |
| Tailwind class composition | `cn()` helper in the component — not a separate CSS file |

**Never** write inline `style={{}}` for anything Tailwind can handle.
**Avoid** per-component `.css` files — Tailwind covers 99% of cases; component CSS files add a second styling system to maintain.

---

## Tailwind Usage

### Do this
```tsx
<div className="flex items-center gap-4 rounded-lg bg-[var(--color-bg)] p-4 shadow-sm">
```

### Not this
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
```

### Avoid long className strings — use `cn()` and extract to a variable
```tsx
import { cn } from '@/lib/utils/cn';

const cardClass = cn('flex flex-col gap-3 rounded-xl bg-[var(--color-bg)] p-6 shadow-md');

<div className={cardClass}>
```

---

## Design Tokens

All colours are defined as CSS variables in `src/styles/global.css`. Light-mode values are set under `@theme {}`; dark-mode overrides live under `.dark {}`. Use semantic token names via Tailwind utilities — do **not** hardcode hex values.

```tsx
// Good — uses semantic token
<p className="text-[var(--color-primary)] font-semibold">

// Bad — hardcoded colour
<p style={{ color: '#1e40af' }}>
```

### Token reference

| CSS variable | Tailwind utility | Light value | Dark value |
|---|---|---|---|
| `--color-primary` | `text-primary` / `bg-primary` | `#1e40af` (blue-800) | `#60a5fa` (blue-400) |
| `--color-success` | `text-success` / `bg-success` | `#16a34a` | `#4ade80` |
| `--color-warning` | `text-warning` / `bg-warning` | `#ea580c` | `#fb923c` |
| `--color-error` | `text-error` / `bg-error` | `#dc2626` | `#f87171` |
| `--color-info` | `text-info` / `bg-info` | `#0284c7` | `#38bdf8` |
| `--color-bg` | `bg-[var(--color-bg)]` | `#ffffff` | `#1e293b` |
| `--color-bg-base` | — | `#ffffff` | `#0f172a` |
| `--color-text` | `text-[var(--color-text)]` | `#0f172a` | `#f1f5f9` |
| `--color-text-muted` | `text-[var(--color-text-muted)]` | `#64748b` | `#94a3b8` |
| `--color-border` | `border-[var(--color-border)]` | `#e2e8f0` | `#334155` |

For colour scales (e.g. sidebar shades), use the `--color-primary-*` and `--color-neutral-*` scale utilities directly: `bg-primary-900`, `text-neutral-400`.

---

## Responsive Design

### Mobile-first always

Write base styles for mobile. Add breakpoint prefixes to override for larger screens.
Never write desktop styles first and shrink down.

```tsx
// Base = mobile, then scale up
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 lg:p-8">
```

### Breakpoints

| Prefix | Min width | Usage in admin |
|---|---|---|
| *(none)* | 0px | Mobile — sidebar hidden, single column, stacked cards |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablet — sidebar visible, tables switch from card to row layout |
| `lg:` | 1024px | Laptop — sidebar fully expanded by default |
| `xl:` | 1280px | Desktop — wider content area |

For this project, most layouts only need `md:` and `lg:`. Do not add breakpoints you do not need.

### Layout primitives

Use CSS Grid for page-level layouts, Flexbox for component-level layouts.

```tsx
// Page layout — grid
<div className="grid grid-cols-1 gap-6 lg:grid-cols-[224px_1fr]">
  <Sidebar />
  <MainContent />
</div>

// Component layout — flex
<div className="flex items-center gap-3">
  <Icon />
  <Label />
</div>
```

### Touch targets

On mobile, all interactive elements (buttons, links, inputs) must be at least 44 px tall.
Use `min-h-11` (`44px`) or `py-3` as a minimum for anything tappable.

```tsx
<button className="min-h-11 rounded-lg px-4 py-3 text-sm">
```

### Hiding and showing elements

Use `hidden` / `block` (or `flex`, `grid`) with breakpoint prefixes — never use JS to toggle visibility for pure layout purposes.

```tsx
// Mobile only
<MobileDrawer className="block md:hidden" />

// Tablet and above
<Sidebar className="hidden md:block" />
```

### Avoid

- Fixed widths (`w-[600px]`) for content areas — use `max-w-*` instead
- Relying on `overflow-hidden` to hide content on small screens — restructure the layout
- Testing only on desktop — always check mobile during development

---

## Dark Mode

Dark mode is controlled by the `.dark` class on `<html>`, toggled by `uiStore.toggleTheme()` and synced in `App.tsx`.

Use `dark:` prefix for overrides when a semantic token is not available, but prefer semantic tokens which switch automatically.

```tsx
// Preferred — token handles dark automatically
<div className="bg-[var(--color-bg)] text-[var(--color-text)]">

// Fallback — explicit dark: override
<div className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
```

---

## Component Layout Pattern

Keep layout concerns (flex, grid, gap, padding) in the parent.
Keep visual concerns (colour, border, shadow, font) in the element itself.

```tsx
// Parent handles layout
<div className="flex gap-4 p-6">
  // Child handles its own look
  <Card className="flex-1 rounded-xl border border-[var(--color-border)] shadow-sm" />
</div>
```

---

## Spacing & Sizing

Stick to the Tailwind spacing scale (`p-2`, `p-4`, `gap-6`, etc.).
Avoid arbitrary values like `p-[13px]` unless you have a specific pixel-perfect reason.

---

## Typography

Scale font sizes across breakpoints only when genuinely needed.

```tsx
<h1 className="text-xl font-bold md:text-2xl lg:text-3xl">
```

The admin panel uses the system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`) configured in Tailwind. Do not import external web fonts in the admin — they add latency for an internal-only tool.
