import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:opacity-90',
        outline: 'border border-border bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800',
        ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        destructive: 'bg-error text-white hover:opacity-90',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3 text-xs',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
