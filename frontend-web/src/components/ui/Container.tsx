/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { cn } from '@/lib/utils/cn';

interface Props {
  className?: string;
  /** Render as a different element (e.g. "section", "main"). Defaults to div. */
  as?: React.ElementType;
  children: React.ReactNode;
}

/**
 * Standard page width wrapper — the single place the content max-width and
 * responsive gutters are defined. Use around every page section.
 */
export function Container({ className, as: Tag = 'div', children }: Props) {
  return (
    <Tag className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </Tag>
  );
}
