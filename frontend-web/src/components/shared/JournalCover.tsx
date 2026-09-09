/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { cn } from '@/lib/utils/cn';

interface Props {
  abbreviation: string;
  gradient: [string, string];
  className?: string;
  /** Tailwind text-size class for the abbreviation. */
  textClassName?: string;
}

/**
 * Subject-coded cover tile used in place of a cover image. Renders the journal
 * abbreviation over a diagonal gradient — crisp at any size, zero asset weight.
 */
export function JournalCover({ abbreviation, gradient, className, textClassName }: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg text-white shadow-sm ring-1 ring-black/5 select-none',
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
      aria-hidden="true"
    >
      <span className={cn('font-bold tracking-tight drop-shadow-sm', textClassName)}>
        {abbreviation}
      </span>
    </div>
  );
}
