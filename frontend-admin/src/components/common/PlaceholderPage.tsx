import { Construction } from 'lucide-react'
import { PageHeader } from './PageHeader'

interface Props {
  title: string
  description?: string
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] py-20 text-center">
        <Construction className="h-10 w-10 text-[var(--color-text-muted)]" />
        <p className="text-sm font-medium text-[var(--color-text-muted)]">This page is under construction.</p>
      </div>
    </div>
  )
}
