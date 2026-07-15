# Regression Testing

## Overview

Regression tests exist to catch broken behaviour when code changes. They are not about coverage metrics — they are about confidence that the features admins rely on still work.

Three layers run in order of speed. Slower layers only run when faster ones pass.

```
Static (tsc + lint) → Component (Vitest + RTL) → E2E (Playwright)
      ~5s                      ~30s                    ~2 min
```

MSW is the shared API layer across component and E2E tests. Write mock handlers once; every layer uses them.

---

## Testing Layers

| Layer | Tool | What it covers | Speed |
|---|---|---|---|
| Static | `tsc`, ESLint | Type errors, unused vars, rule violations | Instant |
| Component | Vitest + React Testing Library | One component or hook in isolation | Milliseconds |
| E2E | Playwright | Full admin flows in a real browser | Seconds–minutes |

---

## What to Test at Each Layer

### Static — already running

```bash
npm run typecheck
npm run lint
```

No new tests needed. Run these as the first CI gate.

---

### Component tests

Test **behaviour**, not implementation. Assert what the user sees or what the hook returns — not internal state or class names.

**Write a component test when:**
- A shared UI component (`StatusBadge`, `Button`, `ConfirmModal`) has meaningful prop variants
- A custom hook contains conditional logic (`useSubmissions`, `useReviewers`)
- A Zod schema validates boundary inputs (empty string, max length, invalid format)
- A pure utility function exists in `src/lib/utils/`

**File location:** co-locate with the file under test.

```
src/components/common/StatusBadge.tsx
src/components/common/StatusBadge.test.tsx   ← same folder
```

**Example — component:**

```tsx
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

it('shows error style for rejected status', () => {
  render(<StatusBadge status="rejected" />);
  expect(screen.getByText('Rejected')).toBeInTheDocument();
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
  const { result } = renderHook(() => useSubmissions({}), { wrapper: QueryWrapper });
  await waitFor(() => expect(result.current.isError).toBe(true));
});
```

---

### E2E tests

Cover **golden paths only** — the flows an admin must complete for the platform to function. Do not replicate component-level assertions here.

**Mandatory E2E flows:**

| Flow | Viewport |
|---|---|
| Admin login → redirect to dashboard | Desktop |
| Submissions list loads, status filter tabs work | Desktop |
| Open submission detail drawer, assign reviewer | Desktop |
| Accept / Reject submission with confirmation modal | Desktop |
| Payment proof — confirm flow | Desktop |
| Revoke certificate with confirmation | Desktop |
| Sidebar collapses to icon-only, expands again | Desktop |
| Mobile: hamburger opens sidebar drawer, nav item navigates | Mobile (375px) |
| Dark mode toggle persists on reload | Desktop |

**File location:**

```
e2e/
├── auth.spec.ts
├── submissions.spec.ts
├── payments.spec.ts
├── certificates.spec.ts
├── sidebar-navigation.spec.ts
└── dark-mode.spec.ts
```

**Example:**

```ts
import { test, expect } from '@playwright/test';

test('dark mode persists across reload', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /switch to dark/i }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
```

---

## MSW — Shared API Layer

All API mocking uses MSW. Never stub `fetch` or `axios` manually in tests.

```
src/mocks/
├── handlers.ts       # all /api/v1/* route handlers
├── server.ts         # node adapter (Vitest)
├── browser.ts        # browser worker (dev only, optional)
└── fixtures/         # typed static response data
```

**`server.ts`** (used by Vitest via `src/test-setup.ts`):

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**`test-setup.ts`** (referenced in `vitest.config.ts`):

```ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

`onUnhandledRequest: 'error'` fails the test immediately if a component fires an API call with no matching handler — this surfaces missing mocks early.

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Component test | Same name as file + `.test.tsx` | `StatusBadge.test.tsx` |
| Hook test | Same name as file + `.test.ts` | `useSubmissions.test.ts` |
| E2E spec | Describes the flow + `.spec.ts` | `submissions.spec.ts` |
| Test description | Plain sentence, no "should" | `'shows error style for rejected status'` |

---

## What Not to Test

- **Implementation details** — do not assert on internal state, refs, or class names that carry no semantic meaning
- **Third-party libraries** — do not test that TanStack Query fetches or that React Hook Form validates; test your logic around them
- **Static content** — do not assert on copy that changes frequently
- **Every prop combination** — test the meaningful variants (happy path, error, empty), not a matrix
- **Snapshots** — avoid snapshot tests; they break on any markup change and rarely catch real regressions

---

## Test Results

### Component tests (Vitest)

```bash
npm run test           # watch mode
npx vitest run         # single run (CI)
```

### E2E tests (Playwright)

```bash
npx playwright test --project=chromium
npx playwright show-report   # open HTML report after run
```

Traces are captured on first retry (`trace: 'on-first-retry'`). To capture a trace during development:

```bash
npx playwright test e2e/submissions.spec.ts --trace on
npx playwright show-report
```

---

## CI Order

```
1. npm run typecheck
2. npm run lint
3. npx vitest run
4. npx playwright test --project=chromium
```

Each gate must pass before the next starts. Add Firefox and WebKit to Playwright only after the Chromium suite is stable.
