/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { cn } from '@/lib/utils/cn';
import { initials } from '@/lib/utils/format';

interface Props {
  name: string;
  className?: string;
}

/** Initials avatar with a deterministic hue derived from the name. */
export function Avatar({ name, className }: Props) {
  const hue = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none',
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 55% 40%))` }}
    >
      {initials(name)}
    </div>
  );
}
