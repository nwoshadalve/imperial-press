/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

import { JournalCard } from '@/components/journal/JournalCard';
import { cn } from '@/lib/utils/cn';
import type { Frequency, Journal, Subject } from '@/types';

interface Props {
  journals: Journal[];
  subjects: Subject[];
}

const frequencies: (Frequency | 'All')[] = ['All', 'Monthly', 'Quarterly', 'Bi-annual', 'Annual'];

export function JournalsExplorer({ journals, subjects }: Props) {
  const [query, setQuery] = useState('');
  const [subjectId, setSubjectId] = useState<string>('all');
  const [frequency, setFrequency] = useState<Frequency | 'All'>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return journals.filter((j) => {
      if (subjectId !== 'all' && j.subjectId !== subjectId) return false;
      if (frequency !== 'All' && j.frequency !== frequency) return false;
      if (!q) return true;
      return (
        j.fullTitle.toLowerCase().includes(q) ||
        j.abbreviation.toLowerCase().includes(q) ||
        j.subjectArea.toLowerCase().includes(q) ||
        j.eIssn.includes(q)
      );
    });
  }, [journals, query, subjectId, frequency]);

  const groups = useMemo(() => {
    return subjects
      .map((s) => ({ subject: s, items: filtered.filter((j) => j.subjectId === s.id) }))
      .filter((g) => g.items.length > 0);
  }, [subjects, filtered]);

  const hasFilters = query !== '' || subjectId !== 'all' || frequency !== 'All';
  const reset = () => {
    setQuery('');
    setSubjectId('all');
    setFrequency('All');
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search journals by name, ISSN, or subject…"
              aria-label="Search journals"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
          </div>

          <label className="sr-only" htmlFor="subject-filter">
            Filter by subject
          </label>
          <select
            id="subject-filter"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="frequency-filter">
            Filter by frequency
          </label>
          <select
            id="frequency-filter"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency | 'All')}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          >
            {frequencies.map((f) => (
              <option key={f} value={f}>
                {f === 'All' ? 'Any frequency' : f}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-[var(--color-muted)]">
          <span>
            {filtered.length} journal{filtered.length === 1 ? '' : 's'}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
            >
              <X size={14} aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {groups.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-muted)]">
          No journals match your filters.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {groups.map(({ subject, items }) => (
            <section key={subject.id}>
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${subject.gradient[0]}, ${subject.gradient[1]})`,
                  }}
                  aria-hidden="true"
                />
                <h2 className="text-lg font-semibold text-[var(--color-text)]">{subject.name}</h2>
                <span className={cn('text-sm text-[var(--color-muted)]')}>({items.length})</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((j) => (
                  <JournalCard key={j.id} journal={j} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
