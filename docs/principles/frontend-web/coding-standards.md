# Coding Standards — frontend-web

## Copyright Notice

Every source file in `frontend-web/` must begin with the following block comment (before any `"use client"` directive, imports, or other code):

```ts
/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */
```

Apply this to all `.ts` and `.tsx` files under `src/` and to root config files such as `next.config.ts`.

## Language & Tooling

- **TypeScript everywhere** — no `.js` or `.jsx` files in `src/`
- Strict mode on — fix type errors, never use `any`
- **ESLint** runs on every save; fix warnings, do not suppress them

## Server vs Client Components

This is the most important decision in the App Router. Getting it wrong sends unnecessary JS to the browser or silently breaks SSR.

| Directive | When to use |
|---|---|
| No directive (Server Component) | Reading data, rendering static content, accessing env vars, no interactivity |
| `"use client"` | Using hooks (`useState`, `useEffect`, SWR, React Query), browser APIs, event handlers |

Rules:
- **Server Component by default** — do not add `"use client"` unless you have a specific, concrete reason
- Keep `"use client"` components as **leaf nodes** — push the boundary as far down the tree as possible so as little as possible is sent to the browser
- Data fetching in Server Components uses `fetch()` with the right cache option; data fetching in Client Components uses SWR or React Query
- `"use client"` components cannot import Server Components — keep the dependency direction one-way

```tsx
// Good — form is "use client", but parent page stays a Server Component
// app/(dashboard)/submissions/page.tsx (no directive — Server Component)
import { SubmissionWizard } from '@/components/submission/SubmissionWizard'; // "use client"

export default async function SubmissionsPage() {
  return <main><SubmissionWizard /></main>;
}
```

## File & Folder Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `JournalCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatCount.ts` |
| Zod schemas | camelCase | `submissionSchema.ts` |
| Route segment folders | kebab-case | `call-for-papers/` |
| Route files | always `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx` | |

## Props & Types

- Always define a `Props` interface for every component
- Use `interface` for object shapes, `type` for unions and aliases
- Do not use `React.FC` — type props directly
- Return type annotation not required on components; required on all utility functions

## Imports Order

1. React and external libraries
2. Next.js (`next/image`, `next/link`, `next/navigation`)
3. Internal aliases (`@/stores/`, `@/hooks/`, `@/lib/`, `@/components/`)
4. Local sibling files

```tsx
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/authStore';
import { fetchSubmissions } from '@/lib/api/submissions';

import type { SubmissionListItem } from './types';
```

## Environment Variables

All configuration comes from the **repo-root** `.env` — never hardcode URLs, secrets, or environment-specific values in source, never use inline `?? 'http://localhost:…'` fallbacks, and never add per-app `.env` files under `frontend-web/`.

| Kind | Variables | Notes |
|---|---|---|
| Public (browser) | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_MEILISEARCH_HOST`, `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` | Safe to expose; search key is read-only and scoped |
| Server-only | `NEXT_REVALIDATE_SECRET` | Never prefix with `NEXT_PUBLIC_` |
| Local port | `WEB_PORT` | Mapped to `PORT` in `next.config.ts` |
| Never in browser | `MEILISEARCH_MASTER_KEY` (backend only) | Must not appear as `NEXT_PUBLIC_*` |

- Read app config only via `src/config/` — do not scatter `process.env.*` through pages/components
- `next.config.ts` loads env from the monorepo root via `loadEnvConfig(..., forceReload: true)` and exposes `NEXT_PUBLIC_*` through `env` (Next may otherwise cache an empty load from `frontend-web/` which has no local `.env`)
- `npm run dev` / `start` go through `scripts/next-with-root-env.mjs` so `WEB_PORT` is applied before Next binds
- Onboard by copying root `.env.example` → `.env`
- Missing required vars must fail loudly at startup/import — do not silently fall back to localhost

```ts
// Good
import { config } from '@/config'
fetch(`${config.apiBaseUrl}/api/v1/journals/${slug}`)

// Bad
fetch(`${process.env.API_URL ?? 'http://localhost:8000'}/api/v1/journals/${slug}`)
```

## Code Style

- `const` by default; `let` only when reassigning
- Arrow functions for handlers and callbacks
- Destructure props and objects wherever practical
- Remove `console.log` before committing
- Use `cn()` from `@/lib/utils/cn` for conditional `className` — never string-concatenate

## Do Not

- Do not use `any` type
- Do not use `// @ts-ignore`
- Do not call `fetch` or `axios` directly in components — use `lib/api/` wrappers
- Do not hardcode hex colour values — use design tokens from `styles/globals.css`
- Do not hardcode URLs, secrets, or other config — use the repo-root `.env` via `src/config/`
- Do not commit commented-out code
- Do not use `<img>` — always use `next/image`
- Do not store the access token in `localStorage` or any JS-accessible cookie — Zustand memory only
- Do not expose the MeiliSearch master key to the browser
- Do not use `useEffect` to fetch data — use SWR or React Query, or fetch in a Server Component
