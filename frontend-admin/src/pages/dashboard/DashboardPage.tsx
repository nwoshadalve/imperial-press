import {
  BookOpen, Inbox, CreditCard, Award,
  TrendingUp, ArrowRight, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PageHeader } from '@/components/common/PageHeader'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils/cn'

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

function StatCard({ label, value, delta, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{value}</p>
          {delta && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-success)]">
              <TrendingUp className="h-3 w-3" />
              {delta}
            </p>
          )}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Quick action card ────────────────────────────────────────────────────────

interface ActionCardProps {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

function ActionCard({ title, description, href, icon: Icon, iconBg, iconColor }: ActionCardProps) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}

// ─── Placeholder submissions ──────────────────────────────────────────────────

const RECENT_SUBMISSIONS = [
  { id: 'S-2025-001', title: 'Advances in Quantum Error Correction', journal: 'IJQC', author: 'Dr. A. Patel', status: 'under_review' as const, date: '2025-07-10' },
  { id: 'S-2025-002', title: 'Deep Learning for Climate Prediction', journal: 'IJCS', author: 'Prof. L. Chen',  status: 'submitted'   as const, date: '2025-07-09' },
  { id: 'S-2025-003', title: 'CRISPR Therapeutic Applications',       journal: 'IJLB', author: 'Dr. M. Osei',  status: 'accepted'     as const, date: '2025-07-08' },
  { id: 'S-2025-004', title: 'Blockchain in Supply Chain Finance',    journal: 'IJFE', author: 'Dr. K. Müller',status: 'payment_pending' as const, date: '2025-07-07' },
  { id: 'S-2025-005', title: 'Microplastic Remediation Techniques',  journal: 'IJES', author: 'Dr. S. Torres',status: 'revision_requested' as const, date: '2025-07-06' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}${user ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="Here's an overview of Imperial Press activity today."
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Journals"
          value="24"
          delta="+2 this month"
          icon={BookOpen}
          iconBg="bg-primary-50 dark:bg-primary-950"
          iconColor="text-primary-600 dark:text-primary-400"
        />
        <StatCard
          label="Active Submissions"
          value="147"
          delta="+18 this week"
          icon={Inbox}
          iconBg="bg-orange-50 dark:bg-orange-950"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          label="Pending Payments"
          value="12"
          icon={CreditCard}
          iconBg="bg-yellow-50 dark:bg-yellow-950"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          label="Certificates Issued"
          value="832"
          delta="+34 this month"
          icon={Award}
          iconBg="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Quick actions + recent submissions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

        {/* Recent submissions table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Submissions</CardTitle>
              <a
                href="/editorial/submissions"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                View all
              </a>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-neutral-50 dark:bg-neutral-900">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Title</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Author</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {RECENT_SUBMISSIONS.map(s => (
                    <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[var(--color-text-muted)]">{s.id}</td>
                      <td className="px-5 py-3 max-w-[260px]">
                        <p className="truncate text-sm font-medium text-[var(--color-text)]">{s.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{s.journal}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-[var(--color-text-muted)]">{s.author}</td>
                      <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">{s.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="flex flex-col divide-y divide-[var(--color-border)] md:hidden">
              {RECENT_SUBMISSIONS.map(s => (
                <div key={s.id} className="flex flex-col gap-1.5 px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2">{s.title}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <span>{s.author}</span>
                    <span>·</span>
                    <span>{s.journal}</span>
                    <span>·</span>
                    <span>{s.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <ActionCard
              title="Review Submissions"
              description="14 submissions need attention"
              href="/editorial/submissions"
              icon={Inbox}
              iconBg="bg-orange-50 dark:bg-orange-950"
              iconColor="text-orange-600 dark:text-orange-400"
            />
            <ActionCard
              title="Confirm Payments"
              description="12 proofs awaiting review"
              href="/payments"
              icon={CreditCard}
              iconBg="bg-yellow-50 dark:bg-yellow-950"
              iconColor="text-yellow-600 dark:text-yellow-400"
            />
            <ActionCard
              title="Manage Journals"
              description="Create or edit journal entries"
              href="/content/journals"
              icon={BookOpen}
              iconBg="bg-primary-50 dark:bg-primary-950"
              iconColor="text-primary-600 dark:text-primary-400"
            />
            <ActionCard
              title="Issue Certificates"
              description="Generate pending certificates"
              href="/certificates"
              icon={Award}
              iconBg="bg-emerald-50 dark:bg-emerald-950"
              iconColor="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          {/* System status */}
          <Card className="mt-1">
            <CardHeader>
              <CardTitle className="text-sm">System Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 p-5 pt-0">
              {[
                { label: 'API',          ok: true  },
                { label: 'Database',     ok: true  },
                { label: 'File Storage', ok: true  },
                { label: 'Search Index', ok: true  },
                { label: 'Email Queue',  ok: false },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">{label}</span>
                  <span className={cn('flex items-center gap-1.5 text-xs font-medium', ok ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]')}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', ok ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]')} />
                    {ok ? 'Operational' : 'Degraded'}
                  </span>
                </div>
              ))}
              <p className="mt-1 flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                <Clock className="h-3 w-3" />
                Last checked: just now
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
