/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { cn } from '@/lib/utils/cn';

interface Props {
  className?: string;
}

/**
 * Content placeholder shown while data loads. Pure CSS pulse (no JS), and the
 * animation is disabled automatically under prefers-reduced-motion.
 */
export function Skeleton({ className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-[var(--color-surface)]',
        className,
      )}
    />
  );
}
