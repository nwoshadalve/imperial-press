# Product Requirements Document — Imperial Press
**Version:** 1.0
**Date:** 2026-07-04
**Status:** Consolidated from prd_v0.1 through prd_v0.4

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Infrastructure](#3-infrastructure)
4. [Application Architecture](#4-application-architecture)
5. [Public Website Pages](#5-public-website-pages)
6. [Individual Journal Page](#6-individual-journal-page)
7. [Journal & Paper Data Model](#7-journal--paper-data-model)
8. [User Accounts & Authentication](#8-user-accounts--authentication)
9. [Author Dashboard](#9-author-dashboard)
10. [Reviewer System](#10-reviewer-system)
11. [Paper Submission System](#11-paper-submission-system)
12. [Peer Review Workflow](#12-peer-review-workflow)
13. [APC & Payment Flow](#13-apc--payment-flow)
14. [Certificate System](#14-certificate-system)
15. [Admin Panel](#15-admin-panel)
16. [Search](#16-search)
17. [Email Notifications](#17-email-notifications)
18. [Non-Functional Requirements](#18-non-functional-requirements)
19. [Out of Scope](#19-out-of-scope)

---

## 1. Project Overview

Imperial Press is an open-access academic publishing platform where researchers can browse, read, and submit journal and conference papers. The platform serves four audiences:

| Audience | Description |
|---|---|
| **Reader** | Anyone browsing and reading papers — no login required |
| **Author** | Registered user who submits papers to journals |
| **Reviewer** | Registered academic who evaluates submissions via peer review |
| **Admin** | Staff who manage all content, submissions, and settings via the private admin panel |

---

## 2. Technology Stack

All components are open-source and self-hosted on a single VM. No external paid services are used.

| Layer | Technology | Reason |
|---|---|---|
| Public website | **Next.js v15** (App Router) | SSR/SSG for SEO; academic content must rank in Google Scholar and search engines |
| Admin panel | **React + Vite** | Private SPA with no SEO requirement; faster and lighter than Next.js for internal tooling |
| Admin UI components | **Ant Design** | Pre-built tables, forms, file upload, date pickers — saves development time on data-heavy screens |
| Backend API | **FastAPI** (Python) | High-performance REST API; auto-generates Swagger docs; excellent for data-heavy applications |
| ORM | **SQLAlchemy** | Industry-standard Python ORM; mature and battle-tested |
| Database | **PostgreSQL** | Reliable relational database for all structured academic data |
| Search engine | **MeiliSearch** | Open-source, self-hosted; instant full-text search with typeahead |
| File storage | **Local filesystem** (VM disk) | FastAPI serves PDFs and images directly to disk; zero-cost; migratable to object storage later |
| Styling (public) | **Tailwind CSS** | Built-in dark/light mode; mobile-first responsive utilities |
| Infrastructure | **Docker Compose** | Single `docker-compose.yml` manages all services on the VM |

---

## 3. Infrastructure

### 3.1 VM Layout

All services run on one VM (Contabo or Hostinger) managed by Docker Compose:

```
┌────────────────────────────────────────────────────┐
│                        VM                          │
│                                                    │
│  ┌──────────────────────────┐                      │
│  │  Next.js v15             │  Port 3000 (internal) │
│  │  Public website          │                      │
│  └──────────────────────────┘                      │
│                                                    │
│  ┌──────────────────────────┐                      │
│  │  React + Vite            │  Port 3001 (internal) │
│  │  Admin panel (SPA)       │                      │
│  └──────────────────────────┘                      │
│                                                    │
│  ┌──────────────────────────┐                      │
│  │  FastAPI                 │  Port 8000 (internal) │
│  │  REST API backend        │                      │
│  └──────────────────────────┘                      │
│                                                    │
│  ┌──────────────────────────┐                      │
│  │  PostgreSQL              │  Internal only        │
│  └──────────────────────────┘                      │
│                                                    │
│  ┌──────────────────────────┐                      │
│  │  MeiliSearch             │  Internal only        │
│  └──────────────────────────┘                      │
│                                                    │
│  ┌──────────────────────────┐                      │
│  │  Nginx                   │  Port 80 / 443        │
│  │  Reverse proxy + SSL     │                      │
│  └──────────────────────────┘                      │
└────────────────────────────────────────────────────┘
```

### 3.2 Domain Routing via Nginx

Nginx handles SSL termination (Let's Encrypt / Certbot) and routes by subdomain:

| Subdomain | Routes to | Audience |
|---|---|---|
| `imperialpress.com` | Next.js — port 3000 | Public readers, authors, reviewers |
| `admin.imperialpress.com` | React + Vite — port 3001 | Admin staff only |
| `api.imperialpress.com` | FastAPI — port 8000 | Called by both frontends |

PostgreSQL and MeiliSearch are not exposed to the public internet.

### 3.3 File Storage

Uploaded PDFs, images, and certificates are stored in a persistent Docker volume mapped to `/data/` on the VM disk. Sub-directories:

- `/data/uploads/` — manuscript files and images
- `/data/certificates/` — generated certificate PDFs

The volume persists across container restarts and redeployments.

---

## 4. Application Architecture

### 4.1 System Diagram

```
Public / Author / Reviewer          Admin Staff
          │                               │
          ▼                               ▼
  Next.js (public site)         React + Vite (admin panel)
          │                               │
          └──────────────┬────────────────┘
                         │  HTTP / REST
                         ▼
                  FastAPI (REST API)
                  JWT authentication
                  File handling
                  Search indexing
                  Certificate generation
                  Email dispatch
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         PostgreSQL            MeiliSearch
         (all data)            (search index)
```

### 4.2 FastAPI Responsibilities

- All CRUD operations for every content type
- JWT authentication and role management
- File upload and serving (PDFs, images, certificates)
- View and download count tracking
- MeiliSearch index updates on content publish/update
- Certificate PDF generation
- Email dispatch (all system notifications)
- API documentation at `api.imperialpress.com/docs` (Swagger UI, built-in)

---

## 5. Public Website Pages

### 5.1 Home Page (`/`)

Sections displayed in order:

1. **Hero / Landing** — headline, sub-headline, primary CTA ("Explore Journals")
2. **Stats Bar** — live counts pulled from PostgreSQL: Total Authors, Total Citations, Countries of Origin, Reviewers, Journal Views, Total Downloads
3. **About Snapshot** — brief "Who we are", "Our Mission", "Our Vision" — links to the full About Us page
4. **Author Services** — English Language Editing, Academic Translation, Plagiarism Check, Manuscript Formatting — each links to its service subpage
5. **Our Open Access Journals** — 3 featured journals (configurable by admin); links to All Journals page
6. **Why Publish with Imperial Press?** — key selling points section
7. **Latest from Imperial Press** — most recent blog posts or announcements
8. **Search Bar** — interactive full-text search powered by MeiliSearch (see Section 16)

### 5.2 Journal Listing Page (`/journals`)

- All journals grouped by Subject (e.g. "Artificial Intelligence and Computing")
- Each journal card: title, E-ISSN, P-ISSN, Impact Factor, APC, Frequency
- Filters: by Subject, by Language, by APC range, by Frequency
- Search within the journal listing

### 5.3 Individual Journal Page (`/journals/[slug]`)

See Section 6 for full navigation and content specification.

### 5.4 About Us Page (`/about`)

Content: Who We Are, Mission, Vision, History. Managed via admin panel rich text editor.

### 5.5 Partners Page (`/partners`)

Partner logos and links. Managed via admin panel.

### 5.6 Services Page (`/services`)

Overview of all services. Each service has a subpage at `/services/[slug]` created by admin through the block-based page builder — no developer involvement required. Available blocks: Rich Text, Image + Text, FAQ, CTA Button, Icon Grid.

### 5.7 Blog (`/blog`, `/blog/[slug]`)

Post listing and individual post pages. Fully managed via admin panel.

### 5.8 Certificate Verification Page (`/verify`)

Public page — no login required. Allows universities and employers to verify Imperial Press certificates.

- Visitor enters a Certificate ID (e.g. `CERT-IJLLT-2026-00142-P1`)
- System checks PostgreSQL; if valid, displays:

```
Certificate Verified ✓
──────────────────────────────────
Issued to:    Dr. Nafingatul Mustafidah
Type:         Publication Certificate
Paper:        Title of the Paper...
Journal:      IJLLT
Volume/Issue: Vol. 9, No. 7
DOI:          https://doi.org/10.32996/ijllt.2026.9.7.1
Published:    2026-06-29
Status:       Valid
```

- If not found or revoked: "Certificate not found or invalid."
- No sensitive personal data shown (no email, no institution)

### 5.9 Other Pages

| Page | Route |
|---|---|
| Careers | `/careers` |
| Contact Us | `/contact` |
| Our Awards | `/awards` |
| Publishing Partners | `/publishing-partners` |
| Propose a Special Issue | `/propose-special-issue` |
| Publication Ethics (global) | `/publication-ethics` |
| Article Processing Charges (global) | `/apc` |

---

## 6. Individual Journal Page

### 6.1 Navigation Structure

**Left sidebar (desktop) / tab navigation (mobile):**

1. **Journal Overview** *(collapsible group)*
   - About Journal
   - Aims & Scope
   - Peer Review Process
   - Author's Guidelines
   - Article Processing Charges
   - Publication Ethics
   - Policies
   - Frequently Asked Questions (FAQs)
2. **Why Publish With Us?**
3. **Editorial Team**
4. **Abstracting & Indexing**
5. **Latest Issue**
6. **All Issues**
7. **Call for Papers**
8. **Publishing Packages**
9. **Google Scholar Citations**
10. **Announcements**
11. **Contact Us**

**Quick Links sidebar** (always visible, right side of page):
- Aims & Scope
- Call for Papers
- Article Processing Charges
- Publication Ethics
- Google Scholar Citations
- Publishing Packages
- **Submit Your Paper** *(prominent CTA button)*

### 6.2 About Journal

General introduction: history, editor-in-chief name, editorial board overview, open access statement, CC licence type, LOCKSS archiving note, OAI-PMH availability. Managed via admin rich text editor per journal.

### 6.3 Aims & Scope

Covers:
- Journal's academic purpose and focus
- Research areas and topics accepted
- Accepted contribution types (configurable per journal): Research Article, Review Article, Book Review, Discussion Note, Translated Article
- Target readership
- Languages accepted for submissions
- Subject exclusions or focus boundaries

Managed via admin rich text editor per journal.

### 6.4 Peer Review Process

Describes the peer review model (double-blind by default), typical review timeline, reviewer selection criteria, and what authors can expect at each stage. Managed via admin rich text editor per journal.

### 6.5 Author's Guidelines

**File requirements:**
- Format: Microsoft Word (.docx) only
- Authors must use the journal's downloadable manuscript template
- Template download button on this page

**Manuscript structure (in order):**
1. Title — maximum 12 words
2. Author names, institutional affiliations, ORCID identifiers
3. Keywords — 4 to 6 terms
4. Abstract — maximum 350 words
5. Introduction
6. Literature Review
7. Methodology
8. Results / Findings
9. Conclusion
10. Statements & Declarations (funding, conflicts of interest, acknowledgements)
11. References — APA 7th edition; include DOIs as full links; list all authors up to 20, then "et al."

**Ethics:** Research on human subjects must comply with the Declaration of Helsinki, include ethics committee approval, and obtain informed consent.

**Authorship changes:** Require a signed letter from all original authors following submission.

**Copyright:** Authors sign a Copyright Assignment form upon acceptance before publication.

Managed via admin rich text editor per journal.

### 6.6 Article Processing Charges (Per Journal)

**Standard APC:**
- Amount: defined per journal (e.g. $150 USD)
- Charged upon acceptance, before publication
- No submission fee, no page charges, no colour charges

**What the APC covers:**
1. Editorial and peer review services
2. Online hosting and maintenance
3. DOI assignment
4. Formal acceptance letter
5. Publication certificate
6. Indexing in academic databases
7. Plagiarism screening with report
8. Open access provision
9. Long-term archiving
10. Marketing and promotional activities

**Fast Track option:**
- Amount: $250 USD
- Accelerated peer review and priority handling
- Acceptance is not guaranteed

**Refund policy:** Defined by admin and displayed here.

**Payment methods:** Defined by admin and displayed here.

### 6.7 Publication Ethics

Covers: plagiarism policy, authorship criteria, conflict of interest, data fabrication, retraction policy. Managed via admin rich text editor per journal.

### 6.8 Policies

Covers: open access policy, self-archiving policy, data sharing policy, corrections and retractions. Managed via admin rich text editor per journal.

### 6.9 Frequently Asked Questions

Q&A pairs specific to this journal. Admin can add, edit, reorder, and delete FAQ items per journal.

### 6.10 Why Publish With Us?

Key reasons for authors to choose this journal: fast review turnaround, global visibility, indexing coverage, author support, open access reach. Managed via admin rich text editor or icon-grid block per journal.

### 6.11 Editorial Team

Displayed in groups:
- **Editor-in-Chief** — photo, name, designation, institution, country
- **Associate Editors** — same fields
- **Editorial Board Members** — same fields

**Become a Reviewer section** (appended at the bottom of this page):

> We welcome qualified researchers to join our reviewer community. To apply, download the Reviewer Application Form, complete it, and send it to the journal email address.
> **[Download Application Form]**

The form is a downloadable Word/PDF file uploaded by admin per journal. Applicants email it to the journal. Admin reviews the application and creates the reviewer account manually. No online form — recruitment is fully admin-controlled.

### 6.12 Abstracting & Indexing

Lists all databases the journal is indexed in. Each entry: database logo, name, brief description, link to journal's profile. Managed via admin panel per journal.

### 6.13 Latest Issue

**Header:** Vol. X No. Y — published date

**Article list per article:**
- Title (linked to paper page)
- Author name(s)
- Page range (e.g. `01–11`)
- PDF download link
- DOI link

**Grouping:** Articles grouped by section type (Research Article, Book Review, etc.)

**Right sidebar:** E-ISSN, P-ISSN, DOI prefix, founded year, frequency, impact factor — and "Submit Your Article" CTA button.

### 6.14 All Issues

Archive grouped by year (most recent first). Each year lists issues in descending order as clickable links (e.g. "Vol. 9 No. 7"). Simple list format — no thumbnails.

### 6.15 Call for Papers

Active submission calls per journal: topic, deadline, description, guest editor details (if applicable). Admin manages per journal. If no active call, a default invitation to submit is shown.

### 6.16 Publishing Packages

Bundled or institutional packages offered for this journal. Admin defines name, price, and inclusions. Packages can be published or unpublished individually.

### 6.17 Google Scholar Citations

Displays journal's Google Scholar profile link and metrics (h-index, citations). Admin inputs the Google Scholar profile URL per journal and updates manually when metrics change.

### 6.18 Announcements

Per-journal announcements (new issues, editorial changes, special calls). Each has: title, date, body. Managed via admin panel per journal.

### 6.19 Contact Us

Journal contact details: editor email, editorial office address, response time note. Includes a contact form that sends to the journal's editorial email. Managed via admin per journal.

---

## 7. Journal & Paper Data Model

### 7.1 Content Hierarchy

```
Subject
  └── Journal
        └── Volume  (one per calendar year)
              └── Issue  (Vol X, No. Y — one per month)
                    └── Paper
```

### 7.2 Issue Numbering Rule

- Volume = (current year − year journal started) + 1
- Issue No. = calendar month (1–12)
- Example: started 2024, July 2026 → **Vol 3, No. 7**
- Admin creates issues manually — the system does not auto-generate them

### 7.3 Journal Metadata Fields

| Field | Type |
|---|---|
| Title (full) | Text |
| Slug | Text (URL-safe, auto-generated) |
| Subject | Relation → Subject |
| Cover image | File upload |
| E-ISSN | Text |
| P-ISSN | Text |
| DOI Prefix | Text |
| Year started | Integer |
| Frequency | Select: Monthly / Quarterly / Bi-annual / Annual |
| Languages accepted | Multi-select |
| Standard APC (USD) | Integer |
| Fast Track APC (USD) | Integer |
| Impact Factor | Decimal |
| Open Access | Boolean |
| CC Licence type | Select: CC BY 4.0 / CC BY-NC 4.0 / etc. |
| Google Scholar profile URL | URL |
| Manuscript template file | File upload |
| All sidebar content sections | Rich text per section |

### 7.4 Paper Metadata Fields

| Field | Type |
|---|---|
| Title | Text |
| Authors | Ordered relation → Author (with affiliation per paper) |
| Abstract | Long text |
| Keywords | Tag list |
| Section type | Select: Research Article / Review Article / Book Review / Discussion Note / Translated Article |
| Issue | Relation → Issue |
| Page range start | Integer |
| Page range end | Integer |
| DOI | Text (generated from DOI prefix + volume + issue + sequence) |
| Published date | Date |
| PDF file | File upload |
| Copyright holder | Text |
| Licence | Select |
| View count | Integer (auto-incremented) |
| Download count | Integer (auto-incremented) |
| Submission | Relation → Submission (if submitted via the platform) |

### 7.5 View and Download Tracking

- Paper page loads → view count +1 via FastAPI (stored in PostgreSQL)
- PDF download button clicked → download count +1 via FastAPI endpoint (PDF is not a direct file URL — requests go through the API so counts are accurate)
- Aggregate totals feed the home page Stats Bar

---

## 8. User Accounts & Authentication

### 8.1 Roles

| Role | Login | Dashboard |
|---|---|---|
| Reader | No login needed | None |
| Author | `imperialpress.com/login` | Author dashboard |
| Reviewer | `imperialpress.com/login` | Reviewer dashboard |
| Author + Reviewer | `imperialpress.com/login` | Both dashboards (tabbed) |
| Admin | `admin.imperialpress.com` | Admin panel |

A single account can hold both `author` and `reviewer` roles simultaneously. The JWT includes all role claims.

### 8.2 JWT Authentication

- Login issues a short-lived **access token** + long-lived **refresh token**
- All protected FastAPI endpoints validate the JWT and check the role claim
- Admin endpoints require an `admin` role claim
- Author submission endpoints require an `author` role claim
- Review endpoints require a `reviewer` role claim

### 8.3 Author Registration Fields

- Full name
- Email (unique, verified via confirmation email)
- Password (hashed with bcrypt)
- Institutional affiliation
- Country
- ORCID (optional)

### 8.4 Author Profile Sections

| Section | Fields |
|---|---|
| Personal Information | Full name, email, profile photo |
| Contact | Secondary email, phone (optional), website, ORCID |
| Role | Author / Reviewer / both |
| Public Profile | Short bio, research interests, social links |
| Change Password | Current password, new password, confirm |
| Notification Preferences | Toggle email notifications per event type |
| Language Preference | UI language switcher |

### 8.5 Logged-In Navigation Bar

When any user is logged in, the top navigation shows:
- **Notification bell** — badge with unread count; click opens dropdown
- **User avatar / name** — dropdown: Dashboard, View Profile, Logout

### 8.6 Reviewer Account Fields

| Field | Type |
|---|---|
| Full name | Text |
| Email | Text (login credential) |
| Password | Hashed |
| Institution | Text |
| Country | Select |
| ORCID | Text (optional) |
| Bio | Short text |
| Expertise / Subject areas | Multi-select from predefined list |
| Assigned journals | Multi-select |
| Availability | Toggle: Available / Temporarily Unavailable |

Reviewer accounts are created by admin only. The system sends a welcome email with a temporary password and a link to set a permanent password.

---

## 9. Author Dashboard

Accessible at `/dashboard` after login.

### 9.1 My Submissions

Table columns: Submission title, Journal, Date submitted, Status badge, Actions

**Status badges:**

| Status | Meaning |
|---|---|
| Draft | Started but not yet submitted |
| Submitted | Completed and awaiting editor |
| Under Review | Peer review in progress |
| Revision Requested | Author must revise and resubmit |
| Accepted | Passed peer review; APC invoice pending |
| Payment Pending | APC invoice sent; awaiting payment |
| Payment Confirmed | Payment received; pending publication |
| Published | Paper is live |
| Rejected | Not accepted |

**Actions per row:** View Details / Continue (if Draft) / Upload Revision (if Revision Requested) / Pay (if Payment Pending)

### 9.2 My Certificates

Table columns: Paper title, Journal, Certificate type, Issued date, Certificate ID, Download PDF

- Acceptance and Publication certificates appear here for each paper
- Authors share the Certificate ID with institutions for verification at `imperialpress.com/verify`

### 9.3 Notifications Panel

- Recent in-app notifications (status changes, payment confirmations, editor messages)
- Mark as read / Mark all as read

### 9.4 Quick Actions

- New Submission button
- Link to Author's Guidelines

---

## 10. Reviewer System

### 10.1 Reviewer Dashboard (`/reviewer-dashboard`)

**Pending Invitations**
Cards showing: manuscript reference (anonymised), journal, abstract (author names hidden), deadline, Accept / Decline buttons. Declining allows the reviewer to suggest an alternative.

**Active Reviews**
Accepted reviews not yet submitted: manuscript reference, journal, days remaining, progress indicator, Continue Review button.

**Completed Reviews**
History: manuscript reference, journal, date completed, recommendation given.

**My Certificates**
All Peer Review Certificates: journal, date, Certificate ID, Download PDF.

**My Profile**
Edit bio, subject areas, availability. Email changes require admin.

### 10.2 Review Form

**Read-only header:**
- Manuscript reference number
- Abstract
- Anonymised manuscript PDF download (author names and affiliations removed)
- Submission date and review deadline

**Form fields:**

| Field | Required | Visible to |
|---|---|---|
| Overall Recommendation | Yes — Accept / Minor Revision / Major Revision / Reject | Editor only |
| Comments to the Editor | No — rich text, confidential | Editor only |
| Comments to the Author | Yes — rich text, the main review feedback | Editor + Author |
| Annotated manuscript | No — .docx file upload with tracked changes | Editor + Author |
| Conflict of interest declaration | Yes — checkbox | Editor only |

Save Draft and Submit Review buttons. Submitting locks the form. A Peer Review Certificate is auto-generated and emailed to the reviewer immediately.

---

## 11. Paper Submission System

### 11.1 APC Payment Model

**Pay after acceptance, before publication** — the industry-standard model used by MDPI, Frontiers, and Springer.

- Submission is free
- APC is invoiced only if the paper passes peer review
- This builds trust: authors pay only for accepted work

### 11.2 Pre-Submission Eligibility

- Author must be registered and logged in
- Author must not have a pending unpaid APC invoice (admin-configurable enforcement)

### 11.3 Entry Points

- "Submit Your Paper" button on any individual journal page (journal pre-selected)
- "New Submission" button on the author dashboard

### 11.4 Pre-Check Screen

Shown before Step 1:

- Journal name (pre-selected, changeable)
- Section selection (required): Research Article / Review Article / Book Review / Discussion Note / Translated Article
- Submission checklist — all must be checked:
  - Submission is not previously published or under review elsewhere
  - URLs for all references provided where available
  - Text adheres to Author's Guidelines
  - Illustrations and tables placed within text, not at the end
  - File is in Microsoft Word (.docx) format only
- Privacy consent checkbox (required)
- **Begin Submission** button → creates a Draft and moves to Step 1

### 11.5 Submission Wizard

A persistent progress bar shows all steps. Completed steps are marked. Authors can return to any completed step. Every step has a **Save for Later** button. Auto-saves every 30 seconds with a "Last saved X seconds ago" indicator.

---

**Step 1 — Details**

| Field | Required |
|---|---|
| Title | Yes |
| Keywords | No |
| Abstract | Yes |

---

**Step 2 — Upload Files**

- Main manuscript (.docx only, max 20MB) — validated on upload, non-.docx rejected with clear error
- Supplementary files (any format, max 10MB each, optional)
- Each file shows: filename, type label, Remove button

---

**Step 3 — Contributors**

- Submitting author pre-populated from profile (marked Primary Contact)
- Add co-authors: name, email, institution, country, ORCID (optional), role
- Co-authors receive an email notification summarising the submission
- Drag-and-drop reordering to reflect author order in the paper

---

**Step 4 — For the Editors**

| Field | Required |
|---|---|
| Comments to the Editor | No |
| Suggested Reviewers (name, email, institution) | No |
| Opposed Reviewers (name + reason) | No |

---

**Step 5 — Review & Submit**

Read-only summary of all steps with Edit links per section. Clicking **Submit**:
1. Status changes: Draft → Submitted
2. Confirmation email sent to author and all co-authors
3. Notification email sent to journal editorial address
4. Redirects to Submission Complete screen

---

**Submission Complete Screen**

- Submission ID (e.g. `IJLLT-2026-00142`)
- Message: "Your submission has been received. The editorial team will contact you once a decision has been made."
- Links: Review this submission | Create a new submission | Return to dashboard

### 11.6 Revision Resubmission

When status is "Revision Requested":
- Author receives email with editor's revision comments (reviewer comments included, anonymised)
- Dashboard shows "Upload Revision" action
- Author uploads revised .docx and writes a response to the editor
- Status returns to Submitted

---

## 12. Peer Review Workflow

### 12.1 Review Model

**Double-blind peer review** (default): reviewer identities hidden from authors; author names and affiliations hidden from reviewers. Only editors see both sides. Configurable per journal (can switch to single-blind in admin settings).

### 12.2 Settings (Configurable Per Journal)

| Setting | Default |
|---|---|
| Review model | Double-blind |
| Minimum reviewers per paper | 2 (range 1–5) |
| Review deadline | 21 days from invitation acceptance |

### 12.3 Full Workflow

```
Submission received  (status: Submitted)
            │
            ▼
  Editor reviews for scope
            │
     ┌──────┴──────┐
    Yes             No ──→ Desk Reject → Author notified
     │                     Status: Rejected
     ▼
  Editor selects 2+ reviewers
  (filtered by expertise, availability, journal, workload)
  Sets review deadline
            │
            ▼
  Invitation emails sent
  Status: Under Review
            │
     ┌──────┴──────┐
  Accept          Decline ──→ Editor assigns replacement
     │
     ▼
  Reviewer downloads anonymised manuscript
  Reviewer completes and submits review form
  Peer Review Certificate auto-generated for reviewer
            │
            ▼
  All reports received (or deadline passed)
            │
            ▼
  Editor reads all reports → makes decision
            │
     ┌──────┼──────────────┐
  Accept  Revision      Reject
     │    Requested         │
     │        │             └──→ Author notified with comments
     │        │                  Status: Rejected
     │        ▼
     │   Anonymised reviewer comments sent to author
     │   Author revises → resubmits
     │   Status: Revision Requested → back to decision
     │
     ▼
  Status: Accepted
  → Acceptance Certificate auto-generated for each author
  → APC payment flow triggered (Section 13)
```

### 12.4 Reviewer Selection

When assigning reviewers, the editor sees a filtered list by:
- Subject area (matched to the submission's journal subject)
- Availability (Available shown by default)
- Journal assignment
- Current workload (active review count)

Each reviewer card shows: name, institution, country, expertise tags, active review count, total past reviews.

### 12.5 Automatic Reminders to Reviewers

- 7 days before deadline
- 1 day before deadline
- Day deadline passes: overdue notice to reviewer + alert to editor

Admin can also send a manual reminder from the admin panel.

### 12.6 Sharing Review Comments with Authors

- "Comments to the Author" from all reviewers are combined and sent to the author with the editorial decision (reviewer names not revealed)
- "Comments to the Editor" are never shared with the author

---

## 13. APC & Payment Flow

### 13.1 Trigger

When admin marks a submission as Accepted:
1. Status changes to **Payment Pending**
2. FastAPI sends in-app notification + email to the author containing:
   - Acceptance congratulations
   - APC amount (standard or Fast Track, per journal)
   - Unique payment reference number (e.g. `PAY-IJLLT-2026-00142`)
   - Payment instructions (bank transfer, PayPal, or other — defined by admin in site settings)
   - Payment deadline (configurable, default 30 days)

### 13.2 Author Payment Steps

1. Author logs in → sees "Payment Pending" badge on submission
2. Clicks Pay → payment details page shows: amount, reference number, step-by-step instructions per payment method
3. Author pays outside the platform
4. Author uploads **payment proof** (PDF or image of receipt)
5. Status shows: "Payment Proof Submitted — awaiting admin confirmation"

### 13.3 Admin Confirmation

1. Admin sees "Payment Proof Submitted" flag in admin panel
2. Admin reviews proof → marks Confirmed or Rejected (with reason if rejected)
3. If confirmed: status → **Payment Confirmed**; author notified
4. If rejected: author notified with reason, asked to resubmit proof

### 13.4 Publication

After payment confirmed:
1. Admin assigns paper to appropriate issue
2. Admin uploads final formatted PDF
3. Admin publishes paper → status → **Published**
4. Author and co-authors receive publication email with DOI and public URL
5. Publication Certificates auto-generated for each author

---

## 14. Certificate System

### 14.1 Certificate Types

| Type | Issued to | Trigger |
|---|---|---|
| Acceptance Certificate | Each author and co-author | Admin marks submission as Accepted |
| Publication Certificate | Each author and co-author | Admin publishes the paper |
| Peer Review Certificate | Reviewer | Reviewer submits completed review report |

### 14.2 Generation

Certificates are auto-generated as PDFs by FastAPI using an HTML template stored per journal. One certificate is generated per person — a paper with 3 authors produces 3 separate certificates, each addressed to one author by name.

**Certificate ID formats:**

| Type | Format | Example |
|---|---|---|
| Publication | `CERT-[JOURNAL]-[YEAR]-[ID]-P[N]` | `CERT-IJLLT-2026-00142-P1` |
| Acceptance | `CERT-[JOURNAL]-[YEAR]-[ID]-A[N]` | `CERT-IJLLT-2026-00142-A1` |
| Peer Review | `CERT-REV-[JOURNAL]-[YEAR]-R[N]` | `CERT-REV-IJLLT-2026-R042` |

### 14.3 Publication Certificate Content

| Field | Value |
|---|---|
| Heading | CERTIFICATE OF PUBLICATION |
| Recipient name | Author's full name |
| Paper title | Full title |
| Journal | Full journal name |
| Volume, Issue | e.g. Volume 9, Issue 7 |
| DOI | Full DOI URL |
| Page range | e.g. 01–11 |
| Published date | e.g. June 29, 2026 |
| E-ISSN / P-ISSN | Both shown |
| Impact Factor | Current IF |
| Licence | e.g. Open Access — CC BY 4.0 |
| Certificate ID | Unique ID |
| Verification URL | `imperialpress.com/verify/[CERT-ID]` |
| Editor-in-Chief signature | Image uploaded per journal |
| Journal seal / stamp | Image uploaded per journal |
| Imperial Press logo | Global branding logo |

### 14.4 Acceptance Certificate Content

Same as Publication Certificate except:
- Heading: **CERTIFICATE OF ACCEPTANCE**
- Volume, Issue, DOI, Pages, Published date replaced with: "Accepted for publication on [date]"
- Additional statement: "This manuscript has been accepted following double-blind peer review and is pending publication."

### 14.5 Peer Review Certificate Content

| Field | Value |
|---|---|
| Heading | CERTIFICATE OF PEER REVIEW |
| Recipient name | Reviewer's full name |
| Journal | Full journal name |
| Review completed date | Date report was submitted |
| Statement | "…served as a peer reviewer and contributed to maintaining the quality of scholarly publishing." |
| Certificate ID | Unique ID |
| Verification URL | `imperialpress.com/verify/[CERT-ID]` |
| Editor-in-Chief signature | Image per journal |
| Note | Manuscript title omitted — preserves double-blind confidentiality |

### 14.6 Delivery

1. PDF saved to `/data/certificates/`
2. Record saved in PostgreSQL (ID, type, recipient, issued date, journal, linked submission or review)
3. Emailed to recipient as PDF attachment
4. Available for download anytime from the recipient's dashboard under "My Certificates"

### 14.7 Revocation

Admin can revoke a certificate (e.g. on paper retraction). The record remains in PostgreSQL but is marked revoked. The verification page shows "This certificate has been revoked." for revoked IDs.

---

## 15. Admin Panel

Accessible at `admin.imperialpress.com`. React + Vite SPA. All data operations go through FastAPI.

### 15.1 Content Management

| Section | Actions |
|---|---|
| Subjects | Create, edit, delete |
| Journals | Create, edit, delete, set featured |
| Volumes & Issues | Create, edit, delete |
| Papers | Create, edit, publish, unpublish |
| Authors | Create, edit, merge duplicates |
| Editorial Team Members | Create, edit, reorder, delete per journal |
| Blog Posts | Create, edit, publish, unpublish |
| Service Pages | Create, edit, delete via block builder |
| Static Pages | Edit About, Ethics, APC, etc. |
| Announcements | Create, edit, delete per journal |
| Call for Papers | Create, edit, publish, unpublish per journal |
| Publishing Packages | Create, edit, publish, unpublish per journal |
| Partners / Indexing logos | Upload, reorder, delete |
| Site Settings | Featured journals, stats overrides, navigation |

### 15.2 Submission & Editorial Management

| Section | Actions |
|---|---|
| Submission Management | View all submissions, filter by status, assign editors, change status, add editor notes |
| Reviewer Accounts | Create, edit, deactivate; view review history and workload |
| Reviewer Assignment | Search by expertise/availability/journal/workload; assign to submission; set deadline |
| Review Monitoring | View pending invitations, active reviews, overdue reviews |
| Manual Reminder | Trigger reminder email to a specific reviewer |
| View Submitted Review | Read full report before making editorial decision |
| Editorial Decision | Accept / Minor Revision / Major Revision / Reject with editor comments |

### 15.3 Payment & Financial Management

| Section | Actions |
|---|---|
| Payment Management | View payment proofs, confirm or reject, view payment history per submission |
| Payment Instructions | Set bank details, PayPal, or other methods shown to authors |
| Payment Settings | Set standard APC per journal, Fast Track APC per journal, payment deadline (days) |

### 15.4 Certificate Management

| Section | Actions |
|---|---|
| Certificate Templates | Upload HTML template per journal per certificate type |
| Signatures | Upload Editor-in-Chief signature image per journal |
| Journal Seal / Stamp | Upload seal image per journal |
| View Certificates | Filterable by journal, type, date range |
| Regenerate Certificate | If original was lost or template was updated |
| Revoke Certificate | With reason; certificate ID remains in DB, marked revoked |
| Download Certificate | Admin can download any PDF |

### 15.5 System Settings

| Section | Actions |
|---|---|
| User Accounts | View all registered users, deactivate accounts |
| Reviewer Application Form | Upload/replace the downloadable application form per journal |
| Manuscript Templates | Upload/replace manuscript template file per journal |
| Google Scholar Links | Add/update Google Scholar profile URL per journal |
| Email Templates | Edit body of each system notification email |
| Review Model Setting | Double-blind / Single-blind per journal |
| Minimum Reviewers Setting | Integer per journal, default 2 |
| Review Deadline Setting | Days per journal, default 21 |

### 15.6 Service Page Builder

Admin creates service subpages without developer involvement:
1. Admin Panel → Services → Add New
2. Enter title and slug (e.g. `english-language-editing`)
3. Add content blocks: Rich Text, Image + Text, FAQ, CTA Button, Icon Grid
4. Reorder blocks by drag-and-drop
5. Publish → page live at `/services/english-language-editing`

---

## 16. Search

### 16.1 Solution

MeiliSearch runs as a self-hosted Docker container on the VM. FastAPI automatically updates the MeiliSearch index whenever a paper, journal, or blog post is published or updated.

### 16.2 Indexed Content

| Content | Indexed fields |
|---|---|
| Papers | Title, abstract, keywords, author names, journal name |
| Journals | Title, subject name, ISSN |
| Blog posts | Title, excerpt |

### 16.3 Search Behaviour

- Search bars on the home page and journal listing page query MeiliSearch as the user types (instant typeahead results)
- Results grouped by type: Papers, Journals
- Each result shows: title, journal name, volume/issue, publish date
- Clicking a result navigates to the paper or journal page
- Keyword tags on paper pages link to a search results page pre-filtered by that keyword

---

## 17. Email Notifications

All emails are sent by FastAPI. Email infrastructure (SMTP provider) to be decided. Email templates are editable by admin in the admin panel.

### 17.1 Author / Co-Author Emails

| Event | Recipient |
|---|---|
| Registration — email verification | New user |
| Submission received | Author + co-authors + journal editorial email |
| Submission assigned to editor | Author |
| Peer review started | Author |
| Revision requested (includes anonymised reviewer comments) | Author |
| Resubmission received | Author |
| Submission accepted (includes APC invoice + payment instructions) | Author + co-authors |
| Acceptance Certificate issued | Each author / co-author (PDF attached) |
| Payment proof received — confirmation | Author |
| Payment confirmed | Author |
| Paper published (includes DOI + public URL) | Author + co-authors |
| Publication Certificate issued | Each author / co-author (PDF attached) |
| Submission rejected (includes editor comments) | Author |
| Password reset | Requesting user |

### 17.2 Reviewer Emails

| Event | Recipient |
|---|---|
| Account created — welcome email with temporary password | Reviewer |
| Review invitation (includes abstract, deadline, accept/decline links) | Reviewer |
| Review reminder — 7 days before deadline | Reviewer |
| Review reminder — 1 day before deadline | Reviewer |
| Review overdue notice | Reviewer |
| Review submitted — confirmation | Reviewer |
| Peer Review Certificate issued (PDF attached) | Reviewer |

### 17.3 Admin / Editor Emails

| Event | Recipient |
|---|---|
| New submission received | Journal editorial email |
| Reviewer accepted invitation | Editor (internal alert) |
| Reviewer declined invitation | Editor (internal alert — prompts to assign replacement) |
| Reviewer submitted report | Editor |
| Review overdue | Editor alert |
| Payment proof uploaded | Admin notification |

---

## 18. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Responsive design | Mobile-first; fully usable from 375px wide |
| Dark / light theme | User-toggleable on public site; preference saved in local storage |
| SEO | SSR or SSG for all public pages; Open Graph tags, canonical URLs, JSON-LD structured data for articles |
| Performance | Static generation for journal and paper pages; revalidation triggered by FastAPI after content updates |
| Accessibility | WCAG 2.1 AA minimum |
| SSL | Nginx + Let's Encrypt (Certbot) for all three subdomains |
| API documentation | Swagger UI auto-generated at `api.imperialpress.com/docs` |
| File validation | Manuscript uploads validated as .docx on upload; rejected immediately if wrong format |
| Password security | bcrypt hashing; minimum password strength enforced on registration |
| Data integrity | PostgreSQL foreign key constraints enforce all content relationships |

---

## 19. Out of Scope

The following are explicitly deferred for future versions:

| Feature | Notes |
|---|---|
| Email SMTP infrastructure | Provider and setup to be decided |
| Payment gateway integration | Stripe / PayPal API — manual process used for now |
| DOI auto-registration | Crossref API integration deferred |
| Plagiarism check integration | iThenticate / Turnitin API deferred |
| Admin analytics dashboard | Stats and reporting dashboard deferred |
| Multi-language UI | Platform UI is English only; paper content can be multilingual |
| Conference paper features | Specific conference paper workflow deferred |
| Mobile application | Web only for now |
| Peer review anonymisation automation | Stripping author info from PDF automatically — manual for now |
