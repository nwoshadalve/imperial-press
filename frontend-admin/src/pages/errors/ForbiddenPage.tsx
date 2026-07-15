import { useNavigate } from 'react-router-dom'
import { ShieldOff, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
      <ShieldOff className="mb-6 h-16 w-16 text-[var(--color-warning)]" strokeWidth={1.25} />
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Error 403</p>
      <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)]">Access forbidden</h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--color-text-muted)]">
        You don't have permission to view this page. Contact your system administrator if you believe this is a mistake.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="cursor-pointer gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Button>
        <Button onClick={() => navigate('/dashboard')} className="cursor-pointer gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </div>
  )
}
