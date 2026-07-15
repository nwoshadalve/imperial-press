---
name: frontend-admin
description: Load all frontend-admin principle docs and set context before working on the admin panel. Use at the start of any frontend-admin task or when you need a principles refresher.
---

Read the following docs **in order** before writing any code. They are short — do not skip.

| Doc | Covers |
|---|---|
| [design-principles.md](../../docs/principles/frontend-admin/design-principles.md) | Design tokens, dark mode, Tailwind conventions, no hardcoded colours |
| [coding-standards.md](../../docs/principles/frontend-admin/coding-standards.md) | File naming, import aliases, `cn()`, CVA, no inline styles |
| [component-structure.md](../../docs/principles/frontend-admin/component-structure.md) | Where files live — `ui/`, `common/`, `pages/`, co-location rules |
| [state-and-data.md](../../docs/principles/frontend-admin/state-and-data.md) | Zustand for global state, TanStack Query for server data, RHF+Zod for forms |
| [regression-testing.md](../../docs/principles/frontend-admin/regression-testing.md) | Vitest component tests, what must be covered |

After reading, summarise in one sentence what the task is, confirm which principle docs are relevant, then begin.

## Stack at a glance

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (`@theme {}` tokens in `styles/global.css`, `.dark` class on `<html>`)
- Radix UI primitives wrapped in `components/ui/`
- Zustand stores: `authStore`, `uiStore`, `notificationStore`
- Router: React Router v6 with lazy-loaded routes in `app/router.tsx`
