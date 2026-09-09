/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { Container } from '@/components/ui/Container';

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-primary)]">
      <Container className="py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-primary-fg)] sm:text-3xl">
          Search across every article and journal
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[var(--color-primary-fg)]/80">
          Full-text search over titles, abstracts, keywords, and authors — results as you type.
        </p>

        <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search papers, journals, authors…"
              aria-label="Search"
              className="w-full rounded-lg border border-transparent bg-[var(--color-bg)] py-3 pl-10 pr-4 text-[var(--color-text)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus-visible:ring-2 focus-visible:ring-white/70"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-bg)] px-5 py-3 font-medium text-[var(--color-primary)] transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </form>
      </Container>
    </section>
  );
}
