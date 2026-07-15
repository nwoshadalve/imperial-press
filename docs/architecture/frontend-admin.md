# Architecture — frontend/admin (Admin Panel)

**Tech:** React 19.2 · Vite 8.1 · TypeScript 6.0 · Tailwind CSS 4.3 · Radix UI  
**Serves:** Imperial Press internal staff (admins / editors)  
**URL:** `admin.imperialpress.com` (Nginx → port 3001)

---

## 1. Overview

The admin panel is a private **Single Page Application (SPA)**. It has no SEO requirement and no public visibility — Nginx blocks all traffic that does not present a valid admin-role JWT. All content and data operations go through the FastAPI backend; the admin panel is a pure UI layer.

The admin panel is **fully mobile-responsive**. Staff can manage submissions, review papers, and confirm payments from any device.

---

## 2. Styling Architecture — Tailwind v4 + Radix UI (shadcn/ui pattern)

No pre-styled component library (no Ant Design, no Mantine, no MUI). Instead, the same approach as `frontend/web`: **Tailwind for all styling**, plus **unstyled Radix UI primitives** for the handful of components that need real accessible behaviour (focus trapping, keyboard nav, portals) — dialogs, dropdowns, popovers, selects, tabs, toasts, tooltips. Components are written directly in this repo (the "shadcn/ui" pattern: copy the component, own the code — not an installed design system) in `src/components/ui/`.

| Concern | Tool | Why |
|---|---|---|
| Responsive layout, breakpoints, grid, flex, spacing | **Tailwind CSS v4** | Purpose-built responsive utilities; mobile-first breakpoints in two characters |
| Accessible interactive primitives — Dialog, DropdownMenu, Popover, Select, Tabs, Toast, Tooltip | **Radix UI** | Unstyled, WAI-ARIA compliant behaviour; we own all visual styling via Tailwind, no CSS-in-JS |
| Data tables (sortable, paginated, filterable) | **TanStack Table** | Headless table logic; rows/cells rendered as plain Tailwind-styled markup; renders as stacked cards below `md`, as a full table at `md+` — same column config, two render paths |
| Date pickers | **react-day-picker** | Headless calendar logic; styled with Tailwind, matches the rest of the admin panel |
| Rich text editing | **Tiptap** | Headless ProseMirror-based editor; all toolbar and editor UI styled with Tailwind; used for journal rich-text sections (About, Aims & Scope, Peer Review Process, Guidelines, Ethics, Policies, FAQs, Why Publish With Us) |
| Icons | **lucide-react** | Consistent icon set, tree-shakeable, no extra font/CSS to reconcile |
| Class name composition | **class-variance-authority + tailwind-merge (`cn`)** | Type-safe variant props on components (`<Button variant="outline" size="sm">`) without a runtime style engine |
| Dark / light theme switching | `.dark` class on `<html>` + Tailwind `@theme` tokens | Same mechanism as `frontend/web` — one theming approach across both apps |

### Why not a pre-styled library (Ant Design, Mantine, etc.)?

Pre-styled libraries ship their own CSS variable system and component visual language, which then has to be reconciled with Tailwind (layer ordering, token syncing, overriding built-in styles to match brand colours). That reconciliation is itself ongoing maintenance cost. Building on unstyled Radix primitives means there is exactly **one** styling system — Tailwind — and zero conflicts to manage. It also keeps the admin panel visually and technically consistent with `frontend/web`, which already uses Tailwind-only.

### Why not build everything from scratch (no primitives at all)?

Accessible behaviour for overlays (dialogs, dropdowns, popovers, comboboxes) — focus trapping, roving tabindex, `Esc` to close, portal rendering, scroll locking — is easy to get subtly wrong. Radix solves exactly that layer and nothing else: it renders no DOM styling, so every visual decision still belongs to Tailwind. Same logic for data tables (TanStack Table) and date pickers (`react-day-picker`): headless logic, our own markup.

### Component ownership model

`src/components/ui/` holds small, local, fully-owned components (`button.tsx`, `card.tsx`, `dialog.tsx`, `select.tsx`, `data-table.tsx`, …), each a thin Tailwind-styled wrapper around a Radix primitive (or plain HTML for simple cases like `Button`/`Card`). These are **not** an installed package — there is no version to bump, no upstream breaking change to absorb. Extending or restyling a component means editing the file directly.

### Responsive breakpoints

Tailwind v4 breakpoints used across the admin panel:

| Tailwind prefix | Min width | Usage in admin |
|---|---|---|
| *(default)* | 0px | Mobile: single column, sidebar hidden behind a drawer |
| `sm:` | 640px | Large phone: sidebar as full-height overlay drawer |
| `md:` | 768px | Tablet: sidebar visible, collapses to icon-only |
| `lg:` | 1024px | Laptop: sidebar fully expanded by default |
| `xl:` | 1280px | Desktop: wider content area |

---

## 3. Folder Structure

```
frontend/admin/
├── public/               # favicon, admin-specific static assets
└── src/
    ├── app/
    │   └── App.tsx       # Root: router, auth guard, global providers
    │
    ├── pages/                              # One folder per domain area
    │   ├── auth/
    │   │   └── LoginPage.tsx              # Admin login (separate from public login)
    │   ├── dashboard/
    │   │   └── DashboardPage.tsx          # Overview stats, quick-action cards
    │   ├── content/                       # Content management section
    │   │   ├── subjects/                  # Academic subject CRUD
    │   │   ├── journals/                  # Journal create/edit (all rich-text sections)
    │   │   ├── issues/                    # Volume & issue management
    │   │   ├── papers/                    # Paper create/edit/publish
    │   │   ├── blog/                      # Blog post create/edit/publish
    │   │   ├── services/                  # Service page builder
    │   │   ├── static-pages/              # About, Ethics, APC, Careers, etc.
    │   │   ├── announcements/             # Per-journal announcements
    │   │   ├── call-for-papers/           # Per-journal CFP entries
    │   │   ├── packages/                  # Per-journal publishing packages
    │   │   └── partners/                  # Partner logos & indexing entries
    │   ├── editorial/                     # Submission workflow section
    │   │   ├── submissions/               # All submissions table + detail view
    │   │   ├── reviewers/                 # Reviewer account management
    │   │   ├── assignments/               # Reviewer assignment to submissions
    │   │   └── decisions/                 # Editorial decision (Accept/Revise/Reject)
    │   ├── payments/                      # Payment proof review + confirm/reject
    │   ├── certificates/                  # Certificate templates, view, revoke
    │   ├── users/                         # Author & reviewer account list
    │   └── settings/                      # Email templates, journal settings,
    │                                      #   reviewer forms, manuscript templates
    │
    ├── components/
    │   ├── ui/                             # Owned, Tailwind-styled primitives (shadcn/ui pattern)
    │   │   ├── button.tsx                 # cva variants: default | outline | ghost | destructive
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx                 # Wraps @radix-ui/react-dialog
    │   │   ├── dropdown-menu.tsx          # Wraps @radix-ui/react-dropdown-menu
    │   │   ├── select.tsx                 # Wraps @radix-ui/react-select
    │   │   ├── tabs.tsx                   # Wraps @radix-ui/react-tabs
    │   │   ├── toast.tsx                  # Wraps @radix-ui/react-toast
    │   │   ├── tooltip.tsx                # Wraps @radix-ui/react-tooltip
    │   │   ├── date-picker.tsx            # Wraps react-day-picker + Popover
    │   │   └── data-table.tsx             # Wraps @tanstack/react-table (sort/paginate/filter)
    │   ├── layout/
    │   │   ├── AdminLayout.tsx            # Shell: collapsible sidebar, top bar
    │   │   ├── Sidebar.tsx                # Plain nav list with grouped/collapsible sections
    │   │   └── TopBar.tsx                 # User menu, notifications badge, theme toggle
    │   ├── common/
    │   │   ├── StatusBadge.tsx            # Coloured badge for submission statuses
    │   │   ├── ConfirmModal.tsx           # Reusable confirm-before-action modal (ui/dialog.tsx)
    │   │   ├── RichTextEditor.tsx         # Tiptap wrapper for journal rich-text sections
    │   │   ├── FileUpload.tsx             # Drag-and-drop upload with progress (own implementation)
    │   │   └── PageHeader.tsx             # Consistent page title + action buttons row
    │   ├── tables/
    │   │   ├── SubmissionsTable.tsx       # All submissions with status filter tabs
    │   │   ├── ReviewersTable.tsx         # Reviewer list with workload indicator
    │   │   ├── PaymentsTable.tsx          # Payment proofs pending / confirmed
    │   │   ├── CertificatesTable.tsx      # Issued certificates with revoke action
    │   │   └── UsersTable.tsx             # Author & reviewer account list
    │   ├── forms/
    │   │   ├── JournalForm.tsx            # Journal metadata + per-section rich text
    │   │   ├── PaperForm.tsx              # Paper metadata + file upload
    │   │   ├── ReviewerForm.tsx           # Create/edit reviewer account
    │   │   ├── ReviewDecisionForm.tsx     # Accept / Revision / Reject with comment
    │   │   ├── PaymentConfirmForm.tsx     # Confirm or reject payment proof
    │   │   └── EmailTemplateForm.tsx      # Edit notification email bodies
    │   └── page-builder/
    │       ├── PageBuilder.tsx            # Drag-and-drop block editor for service pages
    │       ├── blocks/
    │       │   ├── RichTextBlock.tsx
    │       │   ├── ImageTextBlock.tsx
    │       │   ├── FAQBlock.tsx
    │       │   ├── CTAButtonBlock.tsx
    │       │   └── IconGridBlock.tsx
    │       └── BlockPicker.tsx            # "Add block" palette
    │
    ├── lib/
    │   ├── api/              # Typed axios/fetch wrappers for every FastAPI endpoint
    │   ├── auth/             # Admin JWT storage, role check, auto-refresh
    │   └── utils/            # Date helpers, file size formatting, status → colour map
    │
    ├── hooks/                # useSubmissions, useReviewers, useJournals, usePagination
    ├── stores/               # Zustand: authStore, notificationStore, uiStore (sidebar collapse)
    ├── types/                # Re-exports from packages/types + admin-specific UI types
    ├── config/               # API base URL, route constants
    └── styles/               # global.css — @theme tokens, dark-mode overrides, global resets
```

---

## 4. Navigation & Layout

The admin shell is a plain Tailwind flex layout: a fixed-width sidebar (`aside`) next to a `main` content column. The sidebar is our own component — a scrollable nav list with collapsible groups (local `useState` per group) — not a pre-built menu component. Items are grouped to mirror the FastAPI module structure:

```
Dashboard
Content
  ├─ Subjects
  ├─ Journals
  ├─ Volumes & Issues
  ├─ Papers
  ├─ Blog Posts
  ├─ Service Pages
  ├─ Static Pages
  ├─ Announcements
  ├─ Call for Papers
  ├─ Publishing Packages
  └─ Partners & Indexing
Editorial
  ├─ Submissions
  ├─ Reviewers
  ├─ Assignments
  └─ Decisions
Payments
Certificates
Users
Settings
  ├─ Email Templates
  ├─ Journal Settings
  ├─ Reviewer Forms
  └─ Manuscript Templates
```

Routes are defined via React Router v6 `createBrowserRouter`. All routes under `/` (except `/login`) are wrapped in an `AdminGuard` component that checks the admin JWT and redirects to `/login` if absent or expired.

**Mobile layout behaviour:**
- `< md` (mobile / tablet): sidebar hidden by default; a hamburger button in the top bar opens it as a full-height overlay (fixed-position `aside` + backdrop, `md:hidden`), closed via backdrop click or an `X` button.
- `md` (tablet landscape+): sidebar is always rendered; a collapse toggle at its base shrinks it to icon-only width (`md:w-14` vs `md:w-56`), persisted in `uiStore`.
- `≥ lg` (laptop+): full sidebar expanded by default.

---

## 5. Authentication

Admin login is completely separate from public-facing author/reviewer login:

- URL: `admin.imperialpress.com/login`
- `POST /api/auth/admin/login` — returns access token (JWT with `role: admin` claim)
- Token stored in **memory** (Zustand `authStore`) + **HttpOnly cookie** for refresh
- Every API request attaches `Authorization: Bearer <token>` via an axios interceptor
- On 401, the interceptor attempts a silent refresh; on failure, redirects to `/login`

Nginx enforces `admin.imperialpress.com` only serves on HTTPS and blocks all unauthenticated API calls at the network level as a defence-in-depth layer. FastAPI also validates the `admin` role claim on every admin endpoint independently.

---

## 6. Key Page Patterns

### Submissions (most complex admin view)

```
SubmissionsPage
  ├── Tabs: All | Submitted | Under Review | Revision Requested | Accepted | Payment Pending | Published | Rejected
  ├── SubmissionsTable (with filters: journal, date range, editor assigned)
  └── SubmissionDetailDrawer (own component: fixed-position panel + Radix Dialog for focus trapping, slides in from right)
       ├── Submission metadata (title, journal, author, dates)
       ├── File downloads (manuscript, supplementary)
       ├── Reviewer assignment section (search + assign)
       ├── Review reports (read-only when submitted)
       └── Editorial decision form
```

### Data Tables — Mobile Responsive Pattern

All data tables use `components/ui/data-table.tsx` (TanStack Table). The same column definitions drive two render paths selected by a CSS breakpoint:

- **Below `md` (mobile):** each row renders as a stacked card — label above value, status badge prominent, primary action button full-width at the bottom of the card.
- **`md` and above (tablet/desktop):** standard `<table>` with sortable column headers, paginated footer, and row-level action menus.

No separate mobile component is needed — a single `DataTable` component switches render mode based on a `useMediaQuery('(min-width: 768px)')` hook.

### Journal Edit (rich content)

The journal edit page handles many rich-text sections (About, Aims & Scope, Peer Review Process, Guidelines, Ethics, Policies, FAQs, Why Publish With Us). Each section is a separate tab inside `JournalForm` to keep the page manageable. `RichTextEditor.tsx` wraps **Tiptap** (headless ProseMirror editor); the toolbar and editor chrome are styled entirely with Tailwind. Tab switching swaps the Tiptap editor's content buffer — one editor instance, multiple content fields.

### Service Page Builder

`PageBuilder.tsx` renders a list of block components. Drag-and-drop is handled by `@dnd-kit/core`. Each block has an `edit` and a `preview` mode toggled inline. Block data is serialised as a JSON array and stored in PostgreSQL via FastAPI. The public website (`frontend/web`) deserialises the JSON and renders corresponding React components.

---

## 7. State Management

| Store | Contents |
|---|---|
| `authStore` | Admin user object, access token, role |
| `notificationStore` | In-app notification count and list |
| `uiStore` | Sidebar collapsed state, active drawer, loading flags |

Server state (submissions list, reviewer list, etc.) is managed by **React Query** (`@tanstack/react-query`). This gives automatic caching, background refetch, and optimistic updates for free — Zustand is reserved for client-only UI state.

---

## 8. Form & Validation Strategy

All forms use **React Hook Form** + **Zod** resolvers:

- Schema defined once in `packages/types/src/schemas/` and shared with the backend validation
- `FileUpload` component validates MIME type and size client-side before upload
- Rich text editor content is treated as a `string` field in the Zod schema (HTML string)
- Server-side errors from FastAPI (422 Unprocessable Entity) are mapped back to form field errors by the axios response interceptor

---

## 9. Design Conventions

**Styling rules:**
- Use Tailwind utilities for all layout, spacing, and responsiveness — `flex`, `grid`, `gap-4`, `md:flex-row`, `hidden lg:block`.
- For interactive UI needing accessible overlay behaviour (modal, dropdown, popover, select, tabs, toast, tooltip), use the wrapper in `components/ui/` — never call a Radix primitive directly from a page or feature component.
- For plain presentational components (buttons, cards, badges), use or extend the existing `components/ui/` primitive rather than writing new Tailwind class strings inline for the same pattern.
- Never hardcode hex colour values. Colours come from the semantic tokens in `styles/global.css` (`--color-primary`, `--color-error`, …), exposed as Tailwind utilities (`bg-primary`, `text-error`) and automatically re-themed by the `.dark` class.
- Compose conditional class names with the shared `cn()` helper (`lib/utils/cn.ts`, clsx + tailwind-merge) — never string-concatenate `className`.

**Data & interaction rules:**
- All data tables use `components/ui/data-table.tsx` (TanStack Table) and are paginated server-side; the table component passes `page` and `pageSize` params to the API query.
- Destructive actions (delete, revoke, reject) always require confirmation via `ConfirmModal` (built on `components/ui/dialog.tsx`) — no single-click destructive operations.
- Rich text editor HTML is sanitised server-side by FastAPI using `bleach` before being stored — the admin panel trusts its own users but the API is the last line of sanitisation.
- All API calls go through typed wrappers in `lib/api/` — no raw fetch/axios calls in components or pages.
