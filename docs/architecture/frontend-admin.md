# Architecture — frontend/admin (Admin Panel)

**Tech:** React 19.2 · Vite 8.1 · TypeScript 6.0 · Ant Design 6.5 · Tailwind CSS 4.3  
**Serves:** Imperial Press internal staff (admins / editors)  
**URL:** `admin.imperialpress.com` (Nginx → port 3001)

---

## 1. Overview

The admin panel is a private **Single Page Application (SPA)**. It has no SEO requirement and no public visibility — Nginx blocks all traffic that does not present a valid admin-role JWT. All content and data operations go through the FastAPI backend; the admin panel is a pure UI layer.

The admin panel is **fully mobile-responsive**. Staff can manage submissions, review papers, and confirm payments from any device.

---

## 2. Styling Architecture — Tailwind v4 + Ant Design 6

Two libraries, one clear division of ownership:

| Concern | Tool | Why |
|---|---|---|
| Responsive layout, breakpoints, grid, flex, spacing | **Tailwind CSS v4** | Purpose-built responsive utilities; mobile-first breakpoints in two characters |
| UI components — Table, Form, Modal, Drawer, Upload, Select, DatePicker | **Ant Design 6** | 80+ production-ready data-heavy components; saves weeks of build time |
| Dark / light / custom theme switching | **Ant Design `ConfigProvider`** | v6 CSS variable mode — instant theme swap, no re-render cost |
| Colour token sync between both libraries | AntD CSS vars → Tailwind `@theme` | One source of truth; Tailwind colour utilities match the AntD palette |

### Why not Tailwind alone?

Building data-heavy admin components (sortable paginated tables, file upload with progress, rich date pickers, nested drawers) from scratch with Tailwind alone would take weeks. Ant Design gives them production-ready and accessible on day one.

### Why not Ant Design alone?

Ant Design's grid system (`Row`/`Col`) handles basic breakpoints but gives coarse control. Tailwind makes complex responsive layouts — stacked sidebar on mobile, horizontal on desktop; hidden/visible panels at breakpoints; responsive form grids — fast and precise.

### Conflict resolution

Tailwind's preflight (CSS reset) and Ant Design styles conflict by default — the reset strips component padding, borders, and typography. The fix is two steps:

**Step 1 — declare CSS layer order** in `src/styles/global.css`:

```css
/* Layer order: AntD overrides reset; Tailwind utilities override AntD */
@layer theme, base, antd, components, utilities;
```

**Step 2 — wrap the app root** with Ant Design's `StyleProvider` to place AntD into the `antd` layer:

```tsx
// src/app/App.tsx
import { StyleProvider } from '@ant-design/cssinjs';

<StyleProvider layer>
  <ConfigProvider theme={antdTheme}>
    <RouterProvider router={router} />
  </ConfigProvider>
</StyleProvider>
```

This is the exact approach used by Ant Design Pro v6 with Tailwind v4.

### Token sync — one colour palette for both

Ant Design v6 exposes its active theme tokens as CSS variables. Reference them in Tailwind's `@theme` block so Tailwind colour utilities (`text-primary`, `bg-error`) always match the AntD theme — including when dark mode switches:

```css
/* src/styles/global.css */
@theme {
  --color-primary:    var(--ant-color-primary);
  --color-success:    var(--ant-color-success);
  --color-warning:    var(--ant-color-warning);
  --color-error:      var(--ant-color-error);
  --color-bg-base:    var(--ant-color-bg-base);
  --color-text-base:  var(--ant-color-text);
}
```

### Responsive breakpoints

Tailwind v4 breakpoints used across the admin panel (aligns with Ant Design's breakpoint names):

| Tailwind prefix | Min width | Matches AntD | Usage in admin |
|---|---|---|---|
| *(default)* | 0px | `xs` | Mobile: single column, sidebar hidden |
| `sm:` | 640px | `sm` | Large phone: sidebar as bottom drawer |
| `md:` | 768px | `md` | Tablet: sidebar collapses to icon-only |
| `lg:` | 1024px | `lg` | Laptop: sidebar fully visible |
| `xl:` | 1280px | `xl` | Desktop: wider content area |

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
    │   ├── layout/
    │   │   ├── AdminLayout.tsx            # Shell: collapsible sidebar, top bar, breadcrumb
    │   │   ├── Sidebar.tsx                # Ant Design Menu with grouped nav items
    │   │   └── TopBar.tsx                 # User dropdown, notifications badge
    │   ├── common/
    │   │   ├── StatusBadge.tsx            # Coloured badge for submission statuses
    │   │   ├── ConfirmModal.tsx           # Reusable confirm-before-action modal
    │   │   ├── RichTextEditor.tsx         # Wrapper around Tiptap/Quill for journal sections
    │   │   ├── FileUpload.tsx             # Ant Upload wrapper for PDFs and images
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
    ├── config/               # API base URL, route constants, AntD theme token overrides
    └── styles/               # global.css — CSS layer order, @theme token sync, global resets
```

---

## 4. Navigation & Layout

The admin shell is an Ant Design `Layout` with a collapsible `Sider` (sidebar). Menu items are grouped to mirror the FastAPI module structure:

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
- `< md` (mobile / tablet): sidebar hidden by default; opens as a full-height drawer via a hamburger button in the top bar. Ant Design `Drawer` component, triggered by Tailwind `md:hidden` toggle.
- `md` (tablet landscape): sidebar collapses to icon-only (`collapsedWidth={56}`), Ant Design `Sider` `breakpoint="md"` handles this automatically.
- `≥ lg` (laptop+): full sidebar always visible.

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
  └── SubmissionDetailDrawer (Ant Design Drawer, slides in from right)
       ├── Submission metadata (title, journal, author, dates)
       ├── File downloads (manuscript, supplementary)
       ├── Reviewer assignment section (search + assign)
       ├── Review reports (read-only when submitted)
       └── Editorial decision form
```

### Journal Edit (rich content)

The journal edit page handles many rich-text sections (About, Aims & Scope, Peer Review Process, Guidelines, Ethics, Policies, FAQs, Why Publish With Us). Each section is a separate tab inside `JournalForm` to keep the page manageable. The `RichTextEditor` component wraps a single editor instance; tab switching swaps the content buffer.

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
- Use Ant Design components for all interactive UI — never build a custom table, modal, or form from scratch.
- Never hardcode hex colour values. Colours come from Ant Design tokens (`config/antd-theme.ts`) and are available as Tailwind utilities via the `@theme` sync in `global.css`.
- Do not mix Ant Design `Row`/`Col` grid with Tailwind grid in the same layout — pick one per component. Tailwind is preferred for new layouts.

**Data & interaction rules:**
- All data tables are paginated server-side; the table component passes `page` and `pageSize` params to the API query.
- Destructive actions (delete, revoke, reject) always require an Ant Design `Popconfirm` or `ConfirmModal` — no single-click destructive operations.
- Rich text editor HTML is sanitised server-side by FastAPI using `bleach` before being stored — the admin panel trusts its own users but the API is the last line of sanitisation.
- All API calls go through typed wrappers in `lib/api/` — no raw fetch/axios calls in components or pages.
