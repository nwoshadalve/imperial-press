# Architecture — frontend/web (Public Website)

**Tech:** Next.js 16.2 LTS · React 19.2 · TypeScript 6.0 · Tailwind CSS 4.3  
**Serves:** Readers, Authors, Reviewers (public + authenticated)  
**URL:** `imperialpress.com` (Nginx → port 3000)

---

## 1. Rendering Strategy

| Route type | Strategy | Reason |
|---|---|---|
| Home, About, Partners, Services, Blog listing | **SSG** (static) | No per-user data; maximum performance and SEO |
| Journal pages (`/journals/[slug]`) | **ISR** (revalidated on publish) | Content changes when admin publishes; stale-while-revalidate keeps it fast |
| Paper pages (`/papers/[id]`) | **ISR** | Same as journal pages; view/download counts excluded from static HTML |
| Auth pages (login, register, verify-email) | **CSR** (client component) | No SEO value; interactive forms |
| Dashboard, reviewer-dashboard, submissions | **CSR** | Fully private; personalised per user; no SEO requirement |
| `/verify/[certId]` | **SSR** | Real-time certificate validity check; must not be cached |
| `/search` | **CSR** | Typeahead queries MeiliSearch as user types |

FastAPI triggers ISR revalidation via `NEXT_REVALIDATE_SECRET` webhook whenever a paper or journal is published or updated.

---

## 2. Folder Structure

```
frontend/web/
├── public/
│   ├── images/           # Static images (logos, og-images)
│   └── fonts/            # Self-hosted web fonts
└── src/
    ├── app/                          # Next.js App Router root
    │   ├── layout.tsx                # Root layout (nav, footer, theme provider)
    │   ├── page.tsx                  # Home page (/)
    │   ├── (marketing)/              # Route group — no shared layout change
    │   │   ├── about/page.tsx
    │   │   ├── apc/page.tsx
    │   │   ├── awards/page.tsx
    │   │   ├── blog/
    │   │   │   ├── page.tsx          # Blog listing
    │   │   │   └── [slug]/page.tsx   # Single post
    │   │   ├── careers/page.tsx
    │   │   ├── contact/page.tsx
    │   │   ├── partners/page.tsx
    │   │   ├── propose-special-issue/page.tsx
    │   │   ├── publication-ethics/page.tsx
    │   │   ├── publishing-partners/page.tsx
    │   │   └── services/
    │   │       ├── page.tsx          # Services overview
    │   │       └── [slug]/page.tsx   # Individual service (block-rendered)
    │   ├── (auth)/                   # Route group — unauthenticated only
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── verify-email/page.tsx
    │   │   └── reset-password/page.tsx
    │   ├── (dashboard)/              # Route group — authenticated users only
    │   │   ├── layout.tsx            # Dashboard shell (sidebar, notification bell)
    │   │   ├── dashboard/page.tsx    # Author dashboard
    │   │   ├── reviewer-dashboard/page.tsx
    │   │   ├── submissions/page.tsx  # Submission wizard entry
    │   │   └── profile/page.tsx
    │   ├── journals/
    │   │   ├── page.tsx              # Journal listing (/journals)
    │   │   └── [slug]/
    │   │       └── page.tsx          # Individual journal page
    │   ├── papers/
    │   │   └── [id]/page.tsx         # Paper detail page
    │   ├── search/page.tsx           # Keyword / full-text search results
    │   └── verify/
    │       └── [certId]/page.tsx     # Certificate verification (SSR)
    │
    ├── components/
    │   ├── ui/               # Base design system (Button, Badge, Card, Modal…)
    │   ├── layout/           # Navbar, Footer, Sidebar, ThemeToggle
    │   ├── home/             # HeroSection, StatsBar, FeaturedJournals, WhyPublish, LatestPosts
    │   ├── journal/          # JournalCard, JournalNav, LatestIssue, AllIssues,
    │   │                     #   EditorialTeam, AbstractingIndexing, CallForPapers
    │   ├── paper/            # PaperHeader, AuthorList, AbstractBlock, KeywordTags,
    │   │                     #   ArticleInfo, DownloadButton, ViewDownloadCount
    │   ├── submission/       # PreCheckScreen, SubmissionWizard, StepIndicator,
    │   │                     #   steps: Details, UploadFiles, Contributors,
    │   │                     #          ForEditors, ReviewSubmit
    │   ├── dashboard/        # SubmissionTable, CertificateTable, NotificationsPanel,
    │   │                     #   ReviewInvitationCard, ActiveReviewCard, ReviewForm
    │   ├── search/           # SearchBar, SearchResults, KeywordResultsPage
    │   └── shared/           # OpenAccessBadge, DOILink, ISSNBlock, CertVerifyResult
    │
    ├── lib/
    │   ├── api/              # Typed fetch wrappers for every FastAPI endpoint
    │   ├── auth/             # JWT storage, token refresh, session helpers
    │   ├── utils/            # Date formatting, slug helpers, count formatting
    │   └── validation/       # Zod schemas for all forms
    │
    ├── hooks/                # useAuth, useSubmission, useNotifications, useSearch, useTheme
    ├── stores/               # Zustand stores: authStore, submissionDraftStore, notificationStore
    ├── types/                # Local TypeScript types (re-exports from packages/types)
    ├── config/               # API base URL, feature flags, site constants
    └── styles/               # globals.css, Tailwind config extensions
```

---

## 3. Route Group Strategy

Route groups (`(name)`) affect layout and middleware without changing the URL.

- **`(marketing)`** — Public pages. No auth required. Share the standard Nav + Footer layout.
- **`(auth)`** — Redirect to `/dashboard` if already logged in (middleware). Share a minimal centred layout.
- **`(dashboard)`** — Redirect to `/login` if not authenticated (middleware). Share a dashboard shell with sidebar, notification bell, and user dropdown.

Middleware (`src/middleware.ts`) handles all redirect logic by inspecting the JWT cookie.

---

## 4. Authentication Flow

```
User submits login form
        │
        ▼
POST /api/auth/login  (FastAPI)
        │
   Returns: access_token (15 min) + refresh_token (30 days, HttpOnly cookie)
        │
Next.js stores access_token in memory (not localStorage)
Refresh token rotates automatically via /api/auth/refresh
        │
Middleware reads token → allows or redirects
```

The access token is kept **in memory only** (Zustand `authStore`). The refresh token lives in an **HttpOnly, Secure, SameSite=Strict cookie** — never accessible to JavaScript. This prevents XSS token theft.

---

## 5. Data Fetching Patterns

| Context | Pattern |
|---|---|
| Static pages (About, Blog post) | `fetch()` in Server Component with `cache: 'force-cache'` |
| ISR pages (Journal, Paper) | `fetch()` in Server Component with `next: { tags: ['journal-slug'] }` |
| SSR pages (Certificate verify) | `fetch()` with `cache: 'no-store'` |
| Client pages (Dashboard, Search) | SWR or React Query against FastAPI, JWT in `Authorization` header |
| View/download counts | Fire-and-forget `POST /api/papers/{id}/view` on mount (client-side only) |

---

## 6. Key Design Decisions

**View & download tracking** — Count increments happen client-side via a fire-and-forget fetch after hydration. The static HTML shows the count at build/revalidation time; live accuracy requires a client request. This avoids making ISR pages SSR just for counters.

**Submission wizard state** — The 5-step submission wizard persists draft state to FastAPI every 30 seconds via `submissionDraftStore`. On page reload, the draft is fetched from the API, not local storage, so progress survives browser restarts.

**Dark/light theme** — Managed by a `ThemeProvider` component using a CSS class on `<html>`. Preference stored in `localStorage` and read before first paint via a blocking script in `<head>` to prevent flash.

**MeiliSearch typeahead** — The `SearchBar` component calls MeiliSearch directly from the browser using a **search-only API key** (read-only, scoped). The master key never leaves the server.

**PDF download tracking** — PDF download links point to `GET /api/papers/{id}/download` (FastAPI), which increments the count and returns a redirect to the file. PDFs are never served as direct static URLs.

---

## 7. Component Conventions

- Server Components by default; add `"use client"` only when using browser APIs, hooks, or event handlers.
- All form validation via **Zod** schemas in `lib/validation/`; never duplicate schema between client and API.
- Shared design tokens (colours, spacing, typography) defined once in `tailwind.config.ts`; never hardcoded in className strings.
- All API calls go through typed wrappers in `lib/api/` — no raw `fetch` calls scattered in components.
