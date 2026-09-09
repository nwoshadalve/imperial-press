/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';
import { Download, FileText } from 'lucide-react';

import type { Paper } from '@/types';

interface Props {
  papers: Paper[];
}

/** Groups an issue's papers by section type, as on a standard journal issue page. */
export function IssueArticleList({ papers }: Props) {
  if (papers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted)]">
        Articles for this issue will appear here once published.
      </p>
    );
  }

  const sections = [...new Set(papers.map((p) => p.sectionType))];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section}>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {section}
          </h4>
          <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
            {papers
              .filter((p) => p.sectionType === section)
              .map((p) => (
                <li key={p.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/papers/${p.slug}`}
                        className="font-medium leading-snug text-[var(--color-text)] hover:text-[var(--color-primary)]"
                      >
                        {p.title}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {p.authors.map((a) => a.name).join(', ')}
                      </p>
                      <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                        Pages {String(p.pageStart).padStart(2, '0')}–{String(p.pageEnd).padStart(2, '0')} ·
                        DOI: {p.doi}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/papers/${p.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                      >
                        <FileText size={14} aria-hidden="true" />
                        Abstract
                      </Link>
                      <Link
                        href={`/papers/${p.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)]"
                      >
                        <Download size={14} aria-hidden="true" />
                        PDF
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
