import { Loader2 } from 'lucide-react'

/** Shown while lazy route modules load on the initial render (React Router 7). */
export function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
      <Loader2
        className="h-6 w-6 animate-spin text-[var(--color-primary)]"
        aria-label="Loading"
      />
    </div>
  )
}
