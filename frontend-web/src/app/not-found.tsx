/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';

import { Container } from '@/components/ui/Container';

/** Root 404 page. */
export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-[var(--color-primary)]">404</p>
      <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-[var(--color-muted)]">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        Back to home
      </Link>
    </Container>
  );
}
