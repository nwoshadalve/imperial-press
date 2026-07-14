# Frontend Admin — Principles

Read these before writing any code in `frontend-admin/`. Each doc is short and to the point.

| Doc | What it covers |
| --- | --- |
| [design-principles.md](./design-principles.md) | Tailwind rules, design tokens, dark mode, responsive layout |
| [coding-standards.md](./coding-standards.md) | TypeScript, naming, imports, what to avoid |
| [component-structure.md](./component-structure.md) | Folder layout, pages vs components, when to split |
| [state-and-data.md](./state-and-data.md) | useState, TanStack Query, Zustand, forms, useEffect rules |
| [regression-testing.md](./regression-testing.md) | Testing layers, what to test, MSW setup, naming, what to skip |

## One-line summary of each

**Design:** Tailwind first, always. Tokens in `styles/global.css`. Never hardcode colours. Mobile-first breakpoints.

**Coding:** Strict TypeScript, no `any`, functional components only. API calls through `lib/api/` — never directly in components.

**Components:** `pages/` for routed views, `components/ui/` for owned primitives, `components/common/` for shared feature components. Pages are thin — logic lives in hooks.

**State & Data:** `useState` for UI, TanStack Query for server data, Zustand for global client state, React Hook Form + Zod for forms.

**Regression Testing:** Static → Component → E2E. MSW shared across all layers. Golden paths only in E2E. Never test implementation details.
