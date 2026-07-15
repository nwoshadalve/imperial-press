import { cn } from '@/lib/utils/cn';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: Props) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: Props) {
  return (
    <h3 className={cn('text-lg font-semibold text-[var(--color-text)]', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: Props) {
  return <div className={cn('text-[var(--color-muted)]', className)}>{children}</div>;
}
