import { cn } from '@/lib/utils/cn';

interface Props {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
  children: React.ReactNode;
}

const variants: Record<NonNullable<Props['variant']>, string> = {
  default: 'bg-[var(--color-primary)] text-white',
  success: 'bg-[var(--color-success)] text-white',
  warning: 'bg-[var(--color-warning)] text-white',
  error: 'bg-[var(--color-error)] text-white',
  outline: 'border border-[var(--color-border)] text-[var(--color-muted)]',
};

export function Badge({ variant = 'default', className, children }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
