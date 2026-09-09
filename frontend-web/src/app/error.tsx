/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Route-segment error boundary. Catches render/data errors below the root. */
export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // Surface for observability; replace with a real logger when wired up.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-[var(--color-error)]">
        Something went wrong
      </p>
      <h1 className="mt-2 text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
        We hit an unexpected error
      </h1>
      <p className="mt-3 max-w-md text-[var(--color-muted)]">
        Please try again. If the problem persists, come back in a little while.
      </p>
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </Container>
  );
}
