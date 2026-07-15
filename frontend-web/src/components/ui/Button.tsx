import { cn } from '@/lib/utils/cn';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variants: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:opacity-90',
  secondary:
    'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-border)]',
  ghost:
    'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]',
  destructive: 'bg-[var(--color-error)] text-white hover:opacity-90',
};

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled ?? isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}
