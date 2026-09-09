/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils/cn';
import { primaryNav } from './navItems';

/** Desktop primary navigation with active-route highlighting. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden md:flex items-center gap-1 text-sm font-medium"
      aria-label="Primary"
    >
      {primaryNav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-2 transition-colors',
              active
                ? 'text-[var(--color-text)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
