/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';
import { FileUp } from 'lucide-react';

import type { Journal } from '@/types';

interface Props {
  journal: Journal;
}

const quickLinks = [
  { label: 'Aims & Scope', href: '#aims-scope' },
  { label: 'Editorial Team', href: '#editorial-team' },
  { label: 'Abstracting & Indexing', href: '#indexing' },
  { label: 'Latest Issue', href: '#latest-issue' },
  { label: 'Announcements', href: '#announcements' },
];

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="text-right font-medium text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

export function JournalQuickFacts({ journal }: Props) {
  return (
    <div className="space-y-6">
      {/* Submit CTA */}
      <Link
        href={`/dashboard/submissions?journal=${journal.slug}`}
        className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        <FileUp size={18} aria-hidden="true" />
        Submit Your Paper
      </Link>

      {/* Journal facts */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Journal Facts
        </h3>
        <dl className="divide-y divide-[var(--color-border)]">
          <Fact label="e-ISSN" value={journal.eIssn} />
          <Fact label="p-ISSN" value={journal.pIssn} />
          <Fact label="DOI Prefix" value={journal.doiPrefix} />
          <Fact label="Founded" value={String(journal.yearStarted)} />
          <Fact label="Frequency" value={journal.frequency} />
          <Fact label="Impact Factor" value={journal.impactFactor.toFixed(1)} />
          <Fact label="Acceptance Rate" value={`${journal.acceptanceRate}%`} />
          <Fact label="Standard APC" value={`$${journal.apcStandard}`} />
          <Fact label="Fast Track APC" value={`$${journal.apcFastTrack}`} />
          <Fact label="Licence" value={journal.ccLicence} />
        </dl>
      </div>

      {/* Quick links */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Quick Links
        </h3>
        <ul className="space-y-1">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block rounded-md px-2 py-1.5 text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
