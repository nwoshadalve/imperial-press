/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useEffect } from 'react';
import '@/styles/globals.css';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Last-resort boundary for errors thrown in the root layout itself. It replaces
 * the entire document, so it renders its own <html>/<body>.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">Something went wrong</h1>
          <p className="mt-3 max-w-md text-[var(--color-muted)]">
            The application ran into a critical error. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
