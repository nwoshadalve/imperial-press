# Component Structure

## Folder Layout

```
frontend-admin/src/
├── app/
│   ├── App.tsx               # Root — providers, theme sync
│   └── router.tsx            # createBrowserRouter — all routes, lazy-loaded
│
├── pages/                    # One folder per domain area — maps 1:1 to sidebar nav
│   ├── auth/
│   ├── dashboard/
│   ├── content/
│   │   ├── subjects/
│   │   ├── journals/
│   │   ├── issues/
│   │   ├── papers/
│   │   ├── blog/
│   │   ├── services/
│   │   ├── static-pages/
│   │   ├── announcements/
│   │   ├── call-for-papers/
│   │   ├── packages/
│   │   └── partners/
│   ├── editorial/
│   │   ├── submissions/
│   │   ├── reviewers/
│   │   ├── assignments/
│   │   └── decisions/
│   ├── payments/
│   ├── certificates/
│   ├── users/
│   └── settings/
│
├── components/
│   ├── ui/                   # Owned Tailwind-styled primitives (shadcn/ui pattern)
│   │   ├── button.tsx        # cva variants: default | outline | ghost | destructive
│   │   ├── card.tsx
│   │   ├── dialog.tsx        # Radix Dialog wrapper
│   │   ├── dropdown-menu.tsx # Radix DropdownMenu wrapper
│   │   ├── select.tsx        # Radix Select wrapper
│   │   ├── tabs.tsx          # Radix Tabs wrapper
│   │   ├── toast.tsx         # Radix Toast wrapper
│   │   ├── tooltip.tsx       # Radix Tooltip wrapper
│   │   ├── date-picker.tsx   # react-day-picker + Popover
│   │   └── data-table.tsx    # TanStack Table — card on mobile, table on md+
│   ├── layout/
│   │   ├── AdminLayout.tsx   # Shell — sidebar + topbar + <Outlet>
│   │   ├── Sidebar.tsx       # Collapsible nav, mobile drawer
│   │   └── TopBar.tsx        # Theme toggle, user menu, notifications
│   ├── common/               # Shared feature components used across pages
│   │   ├── StatusBadge.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── FileUpload.tsx
│   │   └── PageHeader.tsx
│   ├── tables/               # Domain-specific table components
│   ├── forms/                # Domain-specific form components
│   └── page-builder/         # Block editor for service pages
│
├── hooks/                    # Reusable data hooks — useSubmissions, useJournals, etc.
├── stores/                   # Zustand stores — authStore, uiStore, notificationStore
├── lib/
│   ├── api/                  # Typed axios wrappers — one file per backend module
│   ├── auth/                 # JWT helpers, auto-refresh logic
│   └── utils/                # cn(), formatDate, formatFileSize, status colour map
├── types/                    # Admin-specific TypeScript types
├── config/                   # API base URL, route constants
└── styles/
    └── global.css            # @theme tokens, .dark overrides, @layer components
```

---

## What Goes Where

| Code | Location |
|---|---|
| Primitive UI (button, card, dialog, select) | `src/components/ui/` |
| App shell (sidebar, topbar, layout) | `src/components/layout/` |
| Shared feature UI (badge, modal, rich-text editor) | `src/components/common/` |
| Domain-specific tables | `src/components/tables/` |
| Domain-specific forms | `src/components/forms/` |
| Page tied to a route | `src/pages/<domain>/` |
| API call function | `src/lib/api/` |
| Hook using that API | `src/hooks/` |
| Global client state | `src/stores/` (Zustand) |
| TypeScript types | `src/types/` |
| Dev mock handlers | `src/mocks/` |

---

## Component File Structure

Write each component file in this order:

```tsx
// 1. Imports
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { StatusBadge } from '@/components/common/StatusBadge';

// 2. Types
interface Props {
  submissionId: string;
  status: SubmissionStatus;
}

// 3. Component
export function SubmissionCard({ submissionId, status }: Props) {
  // 3a. Hooks first
  const [expanded, setExpanded] = useState(false);

  // 3b. Derived values / handlers
  const handleToggle = () => setExpanded(prev => !prev);

  // 3c. Return JSX
  return (
    <div className={cn('rounded-xl border border-[var(--color-border)] p-4', expanded && 'shadow-md')}>
      ...
    </div>
  );
}
```

---

## Page vs Component

- A **page** maps to a route. It composes components and hooks. It has minimal logic — its job is wiring, not thinking.
- A **component** is a reusable piece of UI. It receives props and renders them.
- Business logic and data fetching live in **hooks**, not in components or pages.

```
Page → calls hooks for data → passes data down to components
```

Pages live in `src/pages/`. They should almost never contain `useQuery` or `useMutation` directly — wrap those in named hooks in `src/hooks/`.

---

## Splitting Components

Split a component when it:
- Has more than ~80 lines of JSX
- Has clearly separate sections (header, body, footer)
- Has a chunk that would be reusable elsewhere

Keep split components in the same folder unless they become reusable — then move to `src/components/common/` or `src/components/ui/`.

---

## ui/ vs common/ vs feature-local

| Where | When to put it |
|---|---|
| `components/ui/` | Generic primitive with no domain knowledge — Button, Card, Dialog, DataTable |
| `components/common/` | Has domain awareness but is shared across 2+ page areas — StatusBadge, ConfirmModal, RichTextEditor |
| `components/tables/` | A specific table for one domain, used from its page — SubmissionsTable |
| `components/forms/` | A specific form for one domain — JournalForm |
| Inside `pages/<domain>/` | Component only ever used by that one page — inline or a sub-file |

---

## Avoid

- Deeply nested component trees (more than 4–5 levels is a sign to refactor)
- Components that do both UI and data fetching — use a hook for data
- "God components" that handle an entire page in one 300-line file
- Prop drilling beyond 2 levels — lift to a hook, context, or Zustand store
- Calling `fetch` or `axios` directly in a component — always go through `src/lib/api/`
