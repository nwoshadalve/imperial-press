/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';

import { config } from '@/config';
import { ThemeToggle } from './ThemeToggle';
import { NavLinks } from './NavLinks';
import { MobileNav } from './MobileNav';

/**
 * Server-rendered header shell. Interactivity is isolated in leaf client
 * components (NavLinks, ThemeToggle, MobileNav) so the shell ships no JS.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-bg)]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 text-lg font-bold tracking-tight text-[var(--color-text)] sm:text-xl"
          >
            {config.siteName}
          </Link>

          <NavLinks />

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden md:inline-flex items-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Sign in
            </Link>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
