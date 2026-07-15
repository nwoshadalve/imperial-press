---
name: frontend-web
description: Load all frontend-web principle docs and set context before working on the public-facing Next.js website. Use at the start of any frontend-web task or when you need a principles refresher.
---

Read the following docs **in order** before writing any code. They are short — do not skip.

| Doc | Covers |
|---|---|
| [design-principles.md](../../docs/principles/frontend-web/design-principles.md) | Design tokens, dark mode blocking script, Tailwind conventions |
| [coding-standards.md](../../docs/principles/frontend-web/coding-standards.md) | Server vs Client component rules, env var safety, `"use client"` boundary |
| [component-structure.md](../../docs/principles/frontend-web/component-structure.md) | App Router folder layout, co-location, `page.tsx` vs layout patterns |
| [state-and-data.md](../../docs/principles/frontend-web/state-and-data.md) | When to use SSG / ISR / SSR / CSR per route type, SWR/React Query |
| [regression-testing.md](../../docs/principles/frontend-web/regression-testing.md) | Vitest for Client Components, Playwright for Server Components / E2E |

After reading, summarise in one sentence what the task is, confirm which principle docs are relevant, then begin.

## Stack at a glance

- Next.js App Router + TypeScript
- Tailwind CSS v4 with `@theme {}` tokens in `styles/globals.css`
- Server Components by default — `"use client"` only when necessary
- `next/image` always — never a bare `<img>` tag
- MeiliSearch search-only key in browser — never expose master key via `NEXT_PUBLIC_*`
- Zustand `authStore` — access token in memory only, never `localStorage`
- Submission wizard draft autosaves to FastAPI every 30 s
- React Hook Form + Zod for all forms — schema in `lib/validation/`
