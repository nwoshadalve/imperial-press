# State & Data Management

## Quick Reference

| What | Tool |
|---|---|
| UI toggle (open/closed, tab, input value) | `useState` |
| Derived value (computed from other state) | Plain variable or `useMemo` |
| Side effects (DOM sync, subscriptions) | `useEffect` |
| Server data (fetching, caching, mutations) | TanStack Query |
| Form state and validation | React Hook Form + Zod |
| Global client state (auth, sidebar, notifications) | Zustand |

---

## Local State

Use `useState` for anything that lives and dies with the component.

```tsx
const [isOpen, setIsOpen] = useState(false);
const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
```

Do not put server data in `useState`. Let TanStack Query manage it.

---

## Server Data (TanStack Query)

Every API call goes through a query or mutation. Wrap the query in a named hook — the component just reads the result.

```tsx
// src/hooks/useSubmissions.ts
export function useSubmissions(filters: SubmissionFilters) {
  return useQuery({
    queryKey: ['submissions', filters],
    queryFn: () => fetchSubmissions(filters),
  });
}

// Page component stays clean
function SubmissionsPage() {
  const { data, isLoading, isError } = useSubmissions(filters);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage />;
  return <SubmissionsTable data={data} />;
}
```

### Rules for queries

- Always handle `isLoading` and `isError` — never assume data is ready
- Use meaningful `queryKey` arrays: `['submissions', filters]`, `['journal', slug]`
- Put query logic in a hook in `src/hooks/` — not directly in the component
- Use `useMutation` for writes (POST, PUT, DELETE); invalidate related queries on success via `queryClient.invalidateQueries`

### Stale time

Default `staleTime` is 30 seconds (set in `App.tsx` `QueryClient`). Adjust per query when needed:

```tsx
useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  staleTime: 10_000, // notifications refresh more aggressively
})
```

---

## Forms (React Hook Form + Zod)

Define the schema with Zod, wire it to the form with `useForm`.

```ts
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  apc: z.number().min(0, 'APC must be a positive number'),
});

type FormValues = z.infer<typeof schema>;
```

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

- Schema lives next to the form component or in `src/types/`
- Do not manage form field state with `useState` — let React Hook Form own it
- Show validation errors from `formState.errors`, not custom state
- Map FastAPI 422 field errors back to form fields via the axios response interceptor in `lib/api/`

---

## Global Client State (Zustand)

Use Zustand for state that needs to persist across components and routes but is **not** server data.

| Store | Contents |
|---|---|
| `authStore` | Admin user object, access token, role |
| `uiStore` | Sidebar collapsed, theme (light/dark), active drawer |
| `notificationStore` | Unread notification count, notification list |

```ts
// Reading from a store
const theme = useUiStore(s => s.theme);
const toggleTheme = useUiStore(s => s.toggleTheme);

// Writing to a store
toggleTheme();
```

**Do not** use React Context for global state — this project uses Zustand. Context is reserved for React ecosystem integrations (e.g. passing a QueryClient to `QueryClientProvider`).

---

## useEffect

Only use `useEffect` for things that truly need to sync with something outside React:
- DOM manipulation (focus, scroll position)
- Subscriptions (websockets, event listeners)
- Syncing a value to an external API (`document.documentElement.classList`)

**Do not** use `useEffect` to fetch data — that is what TanStack Query is for.
**Do not** use `useEffect` to compute derived values — use a plain variable or `useMemo`.

```tsx
// Bad — fetching in useEffect
useEffect(() => {
  fetch('/api/submissions').then(res => setSubmissions(res.json()));
}, []);

// Good — TanStack Query handles this
const { data: submissions } = useQuery({ queryKey: ['submissions'], queryFn: fetchSubmissions });
```

---

## Derived Values

If a value can be calculated from existing state or props, calculate it inline — do not store it in state.

```tsx
// Bad — redundant state
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${firstName} ${lastName}`), [firstName, lastName]);

// Good — just derive it
const fullName = `${firstName} ${lastName}`;
```

Use `useMemo` only when the calculation is genuinely expensive (rare in admin UI).
