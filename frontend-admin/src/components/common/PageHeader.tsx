import { type ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text)] md:text-2xl">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      {actions && <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">{actions}</div>}
    </div>
  )
}
