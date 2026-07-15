# Design Principles — frontend-web

## Theme & Tokens

Design tokens are defined in `src/styles/globals.css` using the same semantic naming convention as the admin panel so both frontends stay visually consistent.

```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));

@theme {
  --color-primary:  #1e40af;
  --color-success:  #16a34a;
  --color-warning:  #ea580c;
  --color-error:    #dc2626;
  --color-bg:       #ffffff;
  --color-text:     var(--color-neutral-900);
  --color-border:   var(--color-neutral-200);
  --color-muted:    var(--color-neutral-500);
}

.dark {
  --color-primary:  var(--color-primary-400);
  --color-bg:       var(--color-neutral-950);
  --color-text:     var(--color-neutral-100);
  --color-border:   var(--color-neutral-800);
  --color-muted:    var(--color-neutral-400);
}
```

Use semantic token names in `className` strings — never raw hex values.

```tsx
// Good
<p className="text-[var(--color-muted)]">Published 2024</p>

// Bad
<p className="text-gray-500">Published 2024</p>
```

## Dark Mode

Toggled via a `ThemeProvider` component in `components/layout/` that adds or removes the `.dark` class on `<html>`. Preference is persisted in `localStorage`. A **blocking `<script>` in `<head>`** reads `localStorage` before first paint to prevent a visible flash:

```tsx
// In root layout.tsx <head>
<script dangerouslySetInnerHTML={{ __html: `
  try {
    const t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch {}
`}} />
```

## Typography

- System font stack for all UI chrome — no extra web font loading required
- Marketing page headlines may use the self-hosted font from `public/fonts/`
- Body text: cap line length at `max-w-prose` (~65–70 ch) for readability

## Responsive Breakpoints

Mobile-first. Base styles target mobile; scale up with `md:` and `lg:`.

| Breakpoint | Width | Use |
|---|---|---|
| Base | < 640px | Mobile — stack everything |
| `sm` | ≥ 640px | Minor adjustments |
| `md` | ≥ 768px | Two-column grids, wider nav |
| `lg` | ≥ 1024px | Full desktop layout |
| `xl` | ≥ 1280px | Wide content areas |

## Spacing & Layout

- Use Tailwind spacing scale (`p-4`, `gap-6`, `mt-8`) — no arbitrary pixel values
- Page content max width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Cards: `rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6`

## Images

- All static images in `public/images/`; always include meaningful `alt` text
- Use Next.js `<Image>` for all images — it handles optimisation, lazy loading, and size hints automatically
- Never use a bare `<img>` tag
