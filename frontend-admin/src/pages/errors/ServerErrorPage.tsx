import { useNavigate } from 'react-router-dom'
import { ServerCrash, RefreshCw, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onRetry?: () => void
}

export default function ServerErrorPage({ onRetry }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
      <ServerCrash className="mb-6 h-16 w-16 text-[var(--color-error)]" strokeWidth={1.25} />
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Error 500</p>
      <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)]">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--color-text-muted)]">
        An unexpected server error occurred. The team has been notified. Please try again or return to the dashboard.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onRetry ?? (() => window.location.reload())}
          className="cursor-pointer gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button onClick={() => navigate('/dashboard')} className="cursor-pointer gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </div>
  )
}
