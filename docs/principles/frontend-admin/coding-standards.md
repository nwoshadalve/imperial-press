# Coding Standards

## Copyright Notice

Every source file in `frontend-admin/` must begin with the following block comment (before any imports or other code):

```ts
/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */
```

Apply this to all `.ts` and `.tsx` files under `src/` and to root config files such as `vite.config.ts`.

## Language & Tooling

- **TypeScript** everywhere — no `.js` or `.jsx` files in `src/`
- Strict mode is on — fix type errors, never use `any`
- **ESLint** runs on every save — fix warnings, do not suppress them

---

## File & Folder Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `SubmissionsTable.tsx` |
| Hooks | camelCase with `use` prefix | `useSubmissions.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types / Interfaces | PascalCase | `SubmissionStatus.ts` |
| Folders | kebab-case | `call-for-papers/` |

---

## Component Rules

- **One component per file**
- Use **functional components** only — no class components
- **Default export** for page components, **named export** for shared/common components
- Keep components focused — if a component is doing too many things, split it

```tsx
// Shared component — named export
export function StatusBadge({ status }: Props) { ... }

// Page component — default export
export default function SubmissionsPage() { ... }
```

---

## Props & Types

- Always define a `Props` interface for every component
- Use `interface` for object shapes, `type` for unions and aliases
- Do not use `React.FC` — type props directly

```tsx
// Good
interface Props {
  status: SubmissionStatus;
  compact?: boolean;
}

function StatusBadge({ status, compact = false }: Props) { ... }
```

---

## Imports Order

Keep imports organised in this order, with a blank line between each group:

1. React and external libraries
2. Internal aliases (`@/stores/`, `@/hooks/`, `@/lib/`, `@/components/`)
3. Local files (sibling components, local utils)

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils/cn';

import StatusBadge from './StatusBadge';
```

---

## API Calls

- All API functions live in `src/lib/api/`
- They return typed responses — always define the return type
- Never call `fetch` or `axios` directly inside a component or page
- Components call hooks; hooks call `src/lib/api/`

```ts
// src/lib/api/submissions.ts
export async function fetchSubmissions(params: SubmissionParams): Promise<SubmissionListResponse> {
  const res = await api.get('/submissions', { params });
  return res.data;
}
```

---

## Environment Variables

All configuration comes from the **repo-root** `.env` — never hardcode URLs, ports, or environment-specific values in source, and never add per-app `.env` files under `frontend-admin/`.

| Variable | Purpose |
|---|---|
| `ADMIN_PORT` | Vite dev/preview port |
| `ADMIN_BASE_PATH` | Vite `base` + React Router basename (default `/admin`) |
| `VITE_API_BASE_URL` | FastAPI base URL — auto-built from `API_PORT` via `scripts/resolve-env-urls.mjs` unless overridden |

- Read client config only via `src/config/` — use static `import.meta.env.VITE_*` (not dynamic `import.meta.env[key]`)
- `vite.config.ts` uses `loadRepoEnv` + `resolveApiBaseUrl` with `envDir` at the repo root — no localhost fallbacks in source
- Onboard by copying root `.env.example` → `.env` (and `.env.compose.example` → `.env.compose` for Docker ports)

```ts
// Good — src/config/index.ts
import { config } from '@/config'
const url = config.apiBaseUrl

// Bad
const url = 'http://localhost:8000'
```

---

## Error Handling

- Always handle loading and error states when fetching data
- Use TanStack Query's `isLoading`, `isError`, `error` — do not manage fetch state manually with `useState`
- Show meaningful UI for errors, not console logs

---

## Code Style

- Use `const` by default, `let` only when reassigning
- Arrow functions for handlers and callbacks inside components
- Destructure props and objects whenever practical
- Remove `console.log` before committing
- Keep functions short — if a function exceeds ~40 lines, consider splitting it
- Use `cn()` from `@/lib/utils/cn` for all conditional className composition — never string-concatenate

---

## Do Not

- Do not use `any` type
- Do not use `// @ts-ignore`
- Do not write class components
- Do not call `fetch` or `axios` directly in components or pages — use hooks that call `lib/api/`
- Do not hardcode hex colour values — use design tokens from `styles/global.css`
- Do not hardcode URLs, ports, or other config — use the repo-root `.env` via `src/config/`
- Do not commit commented-out code
- Do not string-concatenate `className` — use `cn()`
- Do not use `useEffect` to fetch data — use TanStack Query
