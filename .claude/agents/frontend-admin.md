---
name: frontend-admin
description: Use when working on anything inside frontend-admin/ — writing components, hooks, pages, stores, styles, or tests. Triggers on tasks like "add a page", "build a component", "fix a bug in admin", "add a form", "write a test", or any file path containing frontend-admin/.
---

Before writing any code in `frontend-admin/`, read the relevant principle doc below. They are short — follow them.

## Principle docs

| Doc | Read when… |
|---|---|
| [design-principles.md](../../docs/principles/frontend-admin/design-principles.md) | Writing any JSX, Tailwind classes, colour values, or responsive layout |
| [coding-standards.md](../../docs/principles/frontend-admin/coding-standards.md) | Creating a new file, component, hook, or utility |
| [component-structure.md](../../docs/principles/frontend-admin/component-structure.md) | Deciding where to put a file or how to structure a component |
| [state-and-data.md](../../docs/principles/frontend-admin/state-and-data.md) | Adding any state, data fetching, form, or side effect |
| [regression-testing.md](../../docs/principles/frontend-admin/regression-testing.md) | Writing or updating tests |

## Architecture doc

For deeper context on the full admin panel (tech choices, folder structure, auth, page patterns, design conventions):

→ [docs/architecture/frontend-admin.md](../../docs/architecture/frontend-admin.md)

## Key rules at a glance

- **Tailwind only** for styling — no hardcoded hex colours, no inline `style={}`, use `cn()` for conditional classes
- **Design tokens** from `styles/global.css` — `--color-primary`, `--color-error`, `--color-bg`, etc.
- **`components/ui/`** for primitives (Button, Card, Dialog…), **`components/common/`** for shared feature components, **`pages/`** for routed views
- **TanStack Query** for server data, **Zustand** for global client state, **`useState`** for local UI state — never `useEffect` to fetch
- **React Hook Form + Zod** for all forms — schema in `types/`, errors from `formState.errors`
- **All API calls** through `lib/api/` — never `fetch`/`axios` directly in a component
- **Radix UI wrappers** in `components/ui/` for accessible overlays (Dialog, Dropdown, Select, Tabs, Toast, Tooltip) — never call Radix primitives directly from pages
- **Mobile-first** — base styles for mobile, `md:` and `lg:` to scale up; tables render as stacked cards below `md`
- **Destructive actions** always go through `ConfirmModal` — no single-click deletes/revokes/rejects
