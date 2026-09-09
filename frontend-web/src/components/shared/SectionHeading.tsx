/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional "view all" link shown to the right on larger screens. */
  action?: { label: string; href: string };
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-[var(--color-muted)]">{description}</p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:gap-2.5 transition-all"
        >
          {action.label}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
