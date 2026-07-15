# Regression Testing — frontend-web

## Overview

Three layers, same philosophy as the admin panel — run faster layers first; E2E covers golden paths only.

```
Static (tsc + lint) → Unit / Component (Vitest + RTL) → E2E (Playwright)
        ~5s                        ~30s                        ~3 min
```

Next.js App Router changes component testing: **Server Components are async functions that cannot be rendered by React Testing Library in a jsdom environment.** Test their rendered output through Playwright instead, and test their data-layer logic (API wrappers, Zod schemas, utility functions) in unit tests.

---

## Testing Layers

| Layer | Tool | What it covers |
|---|---|---|
| Static | `tsc`, ESLint | Type errors, unused vars, lint violations |
| Unit / Component | Vitest + RTL | Client Components, hooks, Zod schemas, utility functions |
| E2E | Playwright | Full user journeys in a real browser against the dev server |

---

## Server Components

Do **not** try to render async Server Components in Vitest. Instead:
- Test their rendered output via Playwright (E2E) against a running Next.js dev server
- Test the data-fetching functions they call (`lib/api/`) in unit tests
- Test the Zod schemas they rely on (`lib/validation/`) in unit tests

---

## Component Tests (Vitest + RTL)

Write component tests for `"use client"` components and hooks with meaningful conditional logic.

**Write a component test when:**
- A Client Component has meaningful prop variants (`OpenAccessBadge`, `DownloadButton`, `CertVerifyResult`)
- A custom hook contains conditional logic (`useAuth`, `useSubmission`, `useNotifications`)
- A Zod schema validates boundary inputs (forms in `lib/validation/`)
- A utility function exists in `src/lib/utils/`

Co-locate tests with the file under test:

```
src/components/shared/OpenAccessBadge.tsx
src/components/shared/OpenAccessBadge.test.tsx   ← same folder
```

**Example — component:**

```tsx
import { render, screen } from '@testing-library/react';
import { OpenAccessBadge } from './OpenAccessBadge';

it('shows open access label when isOA is true', () => {
  render(<OpenAccessBadge isOA />);
  expect(screen.getByText('Open Access')).toBeInTheDocument();
});
```

**Example — hook:**

```ts
import { renderHook, waitFor } from '@testing-library/react';
import { useSubmissions } from './useSubmissions';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

it('returns error state when API fails', async () => {
  server.use(http.get('/api/v1/submissions', () => HttpResponse.error()));
  const { result } = renderHook(() => useSubmissions(), { wrapper: SWRWrapper });
  await waitFor(() => expect(result.current.error).toBeDefined());
});
```

---

## E2E Tests (Playwright)

Cover **golden paths only** — the flows a reader, author, or reviewer must complete for the platform to work.

**Mandatory E2E flows:**

| Flow | Viewport |
|---|---|
| Home page loads, hero section and stats bar visible | Desktop |
| Journal listing → journal detail page navigation | Desktop |
| Paper detail page shows abstract and download button | Desktop |
| `/verify/[certId]` shows valid certificate result | Desktop |
| Search bar returns relevant results for a keyword | Desktop |
| Author login → redirects to dashboard, submissions list loads | Desktop |
| Submission wizard: complete step 1, advance to step 2, draft saves | Desktop |
| Reviewer dashboard shows pending review invitation | Desktop |
| Dark mode toggle persists on page reload | Desktop |
| Mobile: hamburger opens nav drawer, tapping link navigates | Mobile (375px) |

**File location:**

```
e2e/
├── home.spec.ts
├── journal.spec.ts
├── paper.spec.ts
├── certificate-verify.spec.ts
├── search.spec.ts
├── auth.spec.ts
├── submission-wizard.spec.ts
├── reviewer-dashboard.spec.ts
├── dark-mode.spec.ts
└── mobile-nav.spec.ts
```

**Example:**

```ts
import { test, expect } from '@playwright/test';

test('dark mode persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /toggle theme/i }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
```

---

## MSW — Shared API Layer

All API mocking in component tests uses MSW. Never stub `fetch` manually.

```
src/mocks/
├── handlers.ts       # all /api/v1/* route handlers
├── server.ts         # node adapter (Vitest)
└── fixtures/         # typed static response data
```

```ts
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

```ts
// src/test-setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

`onUnhandledRequest: 'error'` fails the test immediately if a component fires an unmatched API call — surfaces missing mocks early.

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Component test | Same file name + `.test.tsx` | `OpenAccessBadge.test.tsx` |
| Hook test | Same file name + `.test.ts` | `useAuth.test.ts` |
| Schema test | Same file name + `.test.ts` | `submissionSchema.test.ts` |
| E2E spec | Flow name + `.spec.ts` | `submission-wizard.spec.ts` |
| Test description | Plain sentence, no "should" | `'shows open access label when isOA is true'` |

---

## What Not to Test

- Server Components — test via E2E or test the data functions they call
- Third-party library behaviour (Next.js routing, SWR cache logic)
- Static copy that changes frequently
- Every prop variant — test meaningful edge cases only (happy path, error, empty)
- Snapshot tests — avoid them; they break on any markup change and rarely catch real regressions

---

## Commands

```bash
# Static checks
npm run typecheck
npm run lint

# Component tests
npx vitest run

# E2E
npx playwright test --project=chromium
npx playwright show-report
```

## CI Order

```
1. npm run typecheck
2. npm run lint
3. npx vitest run
4. npx playwright test --project=chromium
```
