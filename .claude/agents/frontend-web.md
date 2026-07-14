---
name: frontend-web
description: Use when working on anything inside frontend-web/ — writing pages, components, hooks, stores, styles, or tests. Triggers on tasks like "add a page", "build a component", "fix a bug in the public website", "add a form", "write a test for", or any file path containing frontend-web/.
---

Before writing any code in `frontend-web/`, read the relevant principle doc below. They are short — follow them.

## Principle docs

| Doc | Read when… |
|---|---|
| [design-principles.md](../../docs/principles/frontend-web/design-principles.md) | Writing any JSX, Tailwind classes, colour values, or responsive layout |
| [coding-standards.md](../../docs/principles/frontend-web/coding-standards.md) | Creating a new file, component, hook, or page — especially Server vs Client component decisions |
| [component-structure.md](../../docs/principles/frontend-web/component-structure.md) | Deciding where to put a file or how to structure a component |
| [state-and-data.md](../../docs/principles/frontend-web/state-and-data.md) | Choosing a rendering strategy (SSG/ISR/SSR/CSR), adding data fetching, forms, or state |
| [regression-testing.md](../../docs/principles/frontend-web/regression-testing.md) | Writing or updating tests |

## Architecture doc

For deeper context on rendering strategies, auth flow, MeiliSearch integration, submission wizard draft state, and view/download count tracking:

→ [docs/architecture/frontend-web.md](../../docs/architecture/frontend-web.md)

## Key rules at a glance

- **Server Components by default** — add `"use client"` only for hooks, browser APIs, or event handlers; push the boundary as far down the tree as possible
- **Rendering strategy per route** — SSG for marketing pages, ISR for journals/papers, SSR for certificate verify, CSR for dashboard/search; see `state-and-data.md`
- **All API calls through `lib/api/`** — no raw `fetch` calls in components or pages
- **Access token in memory only** — Zustand `authStore`; never `localStorage`, never a JS-readable cookie
- **Tailwind only** — no inline `style={}`, no hardcoded hex values; tokens in `styles/globals.css`
- **`next/image` always** — never a bare `<img>` tag
- **MeiliSearch search-only key** in browser — never expose the master key via `NEXT_PUBLIC_*`
- **Submission draft persists server-side** — autosave to FastAPI every 30 s; do not rely on `localStorage`
- **Zod + React Hook Form** for all forms — schema in `lib/validation/`, errors from `formState.errors`
