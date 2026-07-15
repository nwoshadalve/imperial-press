# Frontend Web Principles

## Stack

Next.js 16.2 LTS · React 19.2 · TypeScript 6.0 · Tailwind CSS 4.3 · App Router

## Index

| Doc | Covers |
|---|---|
| [design-principles.md](./design-principles.md) | Tokens, dark mode, typography, responsive breakpoints |
| [coding-standards.md](./coding-standards.md) | TypeScript rules, Server vs Client components, file naming, imports |
| [component-structure.md](./component-structure.md) | App Router folder layout, what goes where, page vs component vs hook |
| [state-and-data.md](./state-and-data.md) | Rendering strategy per route (SSG/ISR/SSR/CSR), data fetching patterns, Zustand stores |
| [regression-testing.md](./regression-testing.md) | Testing layers, E2E golden paths, MSW handlers for Next.js |

## Core Rules

- **Server Components by default** — add `"use client"` only when using hooks, browser APIs, or event handlers
- **Rendering strategy is per-route** — choose SSG / ISR / SSR / CSR from the table in `state-and-data.md`; do not SSR a page that could be SSG
- **All API calls through `lib/api/`** — no raw `fetch` calls scattered in components or pages
- **Access token in memory only** — never `localStorage`, never a JS-accessible cookie; that is the refresh token's job
- **Tailwind only** — no inline `style={}`, no hardcoded hex values; tokens defined in `styles/globals.css`
- **MeiliSearch search-only key** in browser — never expose the master key via a `NEXT_PUBLIC_*` variable
- **Submission draft persists server-side** — autosave to FastAPI every 30 s; never rely on `localStorage` for wizard state
