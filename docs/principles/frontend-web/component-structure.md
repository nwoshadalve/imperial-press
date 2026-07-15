# Component Structure — frontend-web

## Folder Layout

```
frontend-web/src/
├── app/                          # Next.js App Router root
│   ├── layout.tsx                # Root layout (Navbar, Footer, ThemeProvider, blocking theme script)
│   ├── page.tsx                  # Home page (/)
│   ├── (marketing)/              # Route group — public marketing pages, no auth required
│   ├── (auth)/                   # Route group — login, register, verify-email, reset-password
│   ├── (dashboard)/              # Route group — authenticated authors and reviewers
│   │   └── layout.tsx            # Dashboard shell (sidebar, notification bell, user dropdown)
│   ├── journals/                 # ISR — journal listing + [slug] detail
│   ├── papers/                   # ISR — [id] paper detail
│   ├── search/page.tsx           # CSR — typeahead search against MeiliSearch
│   └── verify/[certId]/page.tsx  # SSR — real-time certificate validity check
│
├── components/
│   ├── ui/               # Owned Tailwind primitives — Button, Badge, Card, Modal…
│   ├── layout/           # Navbar, Footer, Sidebar, ThemeToggle, ThemeProvider
│   ├── home/             # HeroSection, StatsBar, FeaturedJournals, WhyPublish, LatestPosts
│   ├── journal/          # JournalCard, JournalNav, LatestIssue, EditorialTeam, AbstractingIndexing
│   ├── paper/            # PaperHeader, AuthorList, AbstractBlock, KeywordTags, DownloadButton
│   ├── submission/       # SubmissionWizard, StepIndicator, PreCheckScreen, step components
│   ├── dashboard/        # SubmissionTable, CertificateTable, NotificationsPanel, ReviewForm
│   ├── search/           # SearchBar, SearchResults
│   └── shared/           # OpenAccessBadge, DOILink, ISSNBlock, CertVerifyResult
│
├── lib/
│   ├── api/              # Typed fetch wrappers for every FastAPI endpoint
│   ├── auth/             # Token refresh logic, session helpers
│   ├── utils/            # Date formatting, count formatting, slug helpers, cn()
│   └── validation/       # Zod schemas for all forms
│
├── hooks/                # useAuth, useSubmission, useNotifications, useSearch, useTheme
├── stores/               # Zustand: authStore, submissionDraftStore, notificationStore
├── types/                # TypeScript types shared across components
├── config/               # API base URL, site constants, feature flags
└── styles/               # globals.css — @theme tokens, .dark overrides
```

## What Goes Where

| Code | Location |
|---|---|
| Route segment | `src/app/<segment>/page.tsx` |
| Shared layout | `src/app/<segment>/layout.tsx` |
| Primitive UI (Button, Badge, Card) | `src/components/ui/` |
| App layout (Navbar, Footer, ThemeProvider) | `src/components/layout/` |
| Page-section components | `src/components/<domain>/` (home/, journal/, paper/, etc.) |
| Shared cross-domain UI | `src/components/shared/` |
| Typed API functions | `src/lib/api/` |
| Zod form schemas | `src/lib/validation/` |
| Custom hook | `src/hooks/` |
| Global Zustand store | `src/stores/` |

## Page vs Component vs Hook

- A **page** (`app/*/page.tsx`) maps to a route. It composes components. Server Component pages fetch data with `fetch()`; Client pages delegate to SWR/React Query hooks.
- A **component** receives props and renders UI. It has no knowledge of routing.
- A **hook** encapsulates data fetching and stateful logic — the component just reads the result.

```
page.tsx → useSubmissions() → fetchSubmissions() in lib/api/ → FastAPI
```

## Server vs Client Boundary

Place `"use client"` as low in the tree as possible:

```
app/(dashboard)/dashboard/page.tsx   ← Server Component (no directive)
  └── DashboardShell.tsx             ← Server Component
        └── SubmissionTable.tsx      ← "use client" (uses useQuery, click handlers)
```

Do not mark a parent as `"use client"` just because one child needs it — extract the interactive child into its own file.

## Component File Structure

```tsx
'use client'; // only if needed

// 1. Imports
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

// 2. Types
interface Props {
  slug: string;
  title: string;
  isOpen?: boolean;
}

// 3. Component
export function JournalCard({ slug, title, isOpen = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn('rounded-xl border p-4', expanded && 'shadow-lg')}>
      ...
    </div>
  );
}
```

## Splitting Components

Split when a component:
- Has more than ~80 lines of JSX
- Has clearly separable sections (header, body, CTA strip)
- Has a chunk that would be reusable elsewhere

Keep split components in the same folder until they become reusable across feature areas — then move to `components/shared/` or `components/ui/`.

## Avoid

- Marking a parent Server Component `"use client"` just to satisfy one interactive child
- Calling `fetch` or `axios` directly in components — use `lib/api/` wrappers
- Using `<img>` — always use `next/image`
- Prop drilling beyond 2 levels — lift to a hook or Zustand store
- "God components" that handle an entire page section in one 300-line file
