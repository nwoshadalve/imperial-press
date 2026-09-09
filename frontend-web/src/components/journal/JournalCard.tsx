/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { OpenAccessBadge } from '@/components/shared/OpenAccessBadge';
import { JournalCover } from '@/components/shared/JournalCover';
import { getSubject } from '@/lib/dummy/subjects';
import type { Journal } from '@/types';

interface Props {
  journal: Journal;
}

export function JournalCard({ journal }: Props) {
  const subject = getSubject(journal.subjectId);
  const gradient = subject?.gradient ?? ['#1e40af', '#0ea5e9'];

  return (
    <Link
      href={`/journals/${journal.slug}`}
      className="group relative flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-all hover:border-[var(--color-primary)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
    >
      <div className="flex items-start gap-4">
        <JournalCover
          abbreviation={journal.abbreviation}
          gradient={gradient}
          className="h-16 w-16 shrink-0"
          textClassName="text-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {journal.isOpenAccess && <OpenAccessBadge />}
          </div>
          <h3 className="font-semibold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
            {journal.fullTitle}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-[var(--color-muted)]">
            e-ISSN {journal.eIssn}
          </p>
        </div>
        <ArrowUpRight
          size={18}
          className="shrink-0 text-[var(--color-muted)] opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-[var(--color-muted)]">
        {journal.description}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-4 text-center">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
            Impact
          </dt>
          <dd className="text-sm font-semibold text-[var(--color-text)]">
            {journal.impactFactor.toFixed(1)}
          </dd>
        </div>
        <div className="border-x border-[var(--color-border)]">
          <dt className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
            APC
          </dt>
          <dd className="text-sm font-semibold text-[var(--color-text)]">
            ${journal.apcStandard}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
            Issues
          </dt>
          <dd className="text-sm font-semibold text-[var(--color-text)]">
            {journal.frequency}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
