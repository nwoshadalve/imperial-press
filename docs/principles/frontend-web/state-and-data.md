# State & Data — frontend-web

## Rendering Strategy Reference

Choose rendering strategy at the **route level**, not the component level. This table is the source of truth.

| Route | Strategy | Data pattern |
|---|---|---|
| Home, About, Blog listing, all `(marketing)` pages | **SSG** | `fetch()` in Server Component with `cache: 'force-cache'` |
| `/journals/[slug]`, `/papers/[id]`, blog post detail | **ISR** | `fetch()` in Server Component with `next: { tags: [...] }` |
| `/verify/[certId]` | **SSR** | `fetch()` in Server Component with `cache: 'no-store'` |
| Login, register, verify-email, reset-password | **CSR** | Interactive forms; no server data needed at render time |
| Dashboard, reviewer-dashboard, submissions | **CSR** | SWR or React Query + JWT in `Authorization` header |
| `/search` | **CSR** | MeiliSearch client-side with search-only API key |

---

## Server Component Data Fetching

Use `fetch()` in a Server Component with the appropriate cache option. Never use a Client Component just to fetch data that could be fetched server-side.

```tsx
// ISR — cached until FastAPI webhook triggers revalidation
async function JournalPage({ params }: { params: { slug: string } }) {
  const journal = await fetch(`${process.env.API_URL}/api/v1/journals/${params.slug}`, {
    next: { tags: [`journal-${params.slug}`] },
  }).then(r => r.json());

  return <JournalDetail journal={journal} />;
}

// SSR — never cached; always fresh
async function CertVerifyPage({ params }: { params: { certId: string } }) {
  const result = await fetch(`${process.env.API_URL}/api/v1/certificates/${params.certId}/verify`, {
    cache: 'no-store',
  }).then(r => r.json());

  return <CertVerifyResult result={result} />;
}
```

ISR cache tags are invalidated by FastAPI calling Next.js's `revalidateTag()` webhook whenever a journal or paper is published or updated.

---

## Client Component Data Fetching

Use **SWR or React Query** for all data fetching in Client Components. Wrap in a named hook — the component reads the result only.

```ts
// src/hooks/useSubmissions.ts
import useSWR from 'swr';
import { fetchSubmissions } from '@/lib/api/submissions';

export function useSubmissions() {
  return useSWR('/submissions', fetchSubmissions, {
    revalidateOnFocus: false,
  });
}
```

```tsx
function DashboardPage() {
  const { data, isLoading, error } = useSubmissions();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;
  return <SubmissionTable rows={data} />;
}
```

Never call `fetch` directly in a component. Never use `useEffect` to fetch data.

---

## Authentication State (Zustand)

| Store | Contents |
|---|---|
| `authStore` | `user`, `accessToken` (memory only), `setTokens()`, `logout()` |
| `submissionDraftStore` | Active wizard step, draft field values, `isDirty` flag |
| `notificationStore` | Unread count, notification list |

The access token lives **in Zustand memory only**. On page reload:
1. `lib/auth/` calls `POST /api/v1/auth/refresh`
2. The HttpOnly refresh cookie is sent automatically by the browser
3. A new access token is written back to `authStore`

Never store the access token in `localStorage` or any JS-readable cookie.

---

## Forms (Zod + React Hook Form)

All forms in Client Components use Zod for schema definition and React Hook Form for field management.

```ts
// src/lib/validation/loginSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});
```

- Schema in `src/lib/validation/` — not inline in the component
- Never manage form field state with `useState` — React Hook Form owns it
- Show validation errors from `formState.errors`; map FastAPI 422 field errors back to form fields via the axios interceptor in `lib/api/`

---

## Submission Wizard Draft State

The 5-step wizard autosaves to FastAPI every 30 seconds via `submissionDraftStore`:

```ts
// in SubmissionWizard.tsx (simplified)
useEffect(() => {
  const id = setInterval(() => {
    if (draft.isDirty) void saveDraft(draft);
  }, 30_000);
  return () => clearInterval(id);
}, [draft]);
```

On page reload the draft is fetched from `GET /api/v1/submissions/draft` — **not from localStorage**. This means progress survives browser restarts and device switches.

---

## MeiliSearch (Search Page)

The `/search` page calls MeiliSearch directly from the browser using a **search-only, read-only API key**:

```ts
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST!,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY!, // read-only, scoped
});
```

The master key never appears in `NEXT_PUBLIC_*` variables.

---

## View / Download Count Tracking

Paper view counts are incremented client-side via a fire-and-forget fetch after hydration — this avoids making ISR pages SSR just for counters.

```tsx
useEffect(() => {
  void fetch(`/api/v1/papers/${id}/view`, { method: 'POST' }).catch(() => {});
}, [id]);
```

PDF download links route through `GET /api/v1/papers/{id}/download` (FastAPI), which increments `download_count` and returns a presigned Garage URL. PDFs are never served as direct static links.

---

## useEffect Rules

Use `useEffect` only for:
- DOM sync (theme class on `<html>`, focus management)
- Subscriptions (event listeners, WebSockets)
- Fire-and-forget tracking calls (view count, draft autosave timer)

Do not use `useEffect` to fetch data. Do not use it to compute derived values.
