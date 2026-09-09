/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, Eye, Quote, FileText, BookMarked } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { OpenAccessBadge } from '@/components/shared/OpenAccessBadge';
import { DOILink } from '@/components/shared/DOILink';
import { Avatar } from '@/components/shared/Avatar';
import { papers, getPaper } from '@/lib/dummy/papers';
import { journals } from '@/lib/dummy/journals';
import { formatDate, formatInteger } from '@/lib/utils/format';
import type { Paper } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return papers.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const paper = getPaper(id);
  if (!paper) return { title: 'Paper' };
  return { title: paper.title, description: paper.abstract.slice(0, 155) };
}

/** APA-style citation string. */
function citation(paper: Paper): string {
  const authors = paper.authors.map((a) => a.name).join(', ');
  const year = new Date(paper.publishedAt).getFullYear();
  return `${authors} (${year}). ${paper.title}. ${paper.journalTitle}, ${paper.volume}(${paper.issueNumber}), ${paper.pageStart}–${paper.pageEnd}. https://doi.org/${paper.doi}`;
}

function Metric({ icon: Icon, value, label }: { icon: typeof Eye; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-[var(--color-muted)]" aria-hidden="true" />
      <span className="font-semibold text-[var(--color-text)]">{formatInteger(value)}</span>
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
    </div>
  );
}

export default async function PaperDetailPage({ params }: Props) {
  const { id } = await params;
  const paper = getPaper(id);
  if (!paper) notFound();

  const journal = journals.find((j) => j.id === paper.journalId);

  return (
    <article>
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Container className="py-10 lg:py-12">
          <nav className="mb-5 text-sm text-[var(--color-muted)]">
            <Link href="/journals" className="hover:text-[var(--color-primary)]">
              Journals
            </Link>
            <span className="mx-2">/</span>
            {journal && (
              <>
                <Link
                  href={`/journals/${journal.slug}`}
                  className="hover:text-[var(--color-primary)]"
                >
                  {journal.abbreviation}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-[var(--color-text)]">Article</span>
          </nav>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{paper.sectionType}</Badge>
            {paper.isOpenAccess && <OpenAccessBadge />}
          </div>

          <h1 className="max-w-4xl text-2xl font-bold leading-snug tracking-tight text-[var(--color-text)] sm:text-3xl">
            {paper.title}
          </h1>

          <p className="mt-4 text-sm text-[var(--color-muted)]">
            {journal && (
              <Link
                href={`/journals/${journal.slug}`}
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                {paper.journalTitle}
              </Link>
            )}{' '}
            · Vol. {paper.volume} No. {paper.issueNumber} · Pages {paper.pageStart}–{paper.pageEnd} ·
            Published {formatDate(paper.publishedAt)}
          </p>
        </Container>
      </div>

      {/* Body */}
      <Container className="py-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main */}
          <main className="min-w-0 space-y-10">
            {/* Authors */}
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                Authors
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {paper.authors.map((author) => (
                  <div key={author.id} className="flex items-center gap-3">
                    <Avatar name={author.name} className="h-10 w-10 text-xs" />
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--color-text)]">{author.name}</p>
                      <p className="truncate text-xs text-[var(--color-muted)]">
                        {author.affiliation}
                        {author.country ? `, ${author.country}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Abstract */}
            <section>
              <h2 className="mb-3 text-lg font-bold text-[var(--color-text)]">Abstract</h2>
              <p className="leading-relaxed text-[var(--color-text)]">{paper.abstract}</p>
            </section>

            {/* Keywords */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                Keywords
              </h2>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((kw) => (
                  <Link
                    key={kw}
                    href={`/search?q=${encodeURIComponent(kw)}`}
                    className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </section>

            {/* How to cite */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                <Quote size={15} aria-hidden="true" /> How to Cite
              </h2>
              <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-relaxed text-[var(--color-text)]">
                {citation(paper)}
              </p>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Download + metrics */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                <a
                  href={paper.pdfUrl ?? '#'}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)]"
                >
                  <Download size={18} aria-hidden="true" />
                  Download PDF
                </a>
                <div className="mt-4 space-y-2">
                  <Metric icon={Eye} value={paper.viewCount} label="views" />
                  <Metric icon={Download} value={paper.downloadCount} label="downloads" />
                  <Metric icon={Quote} value={paper.citationCount} label="citations" />
                </div>
              </div>

              {/* Article info */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  <FileText size={15} aria-hidden="true" /> Article Info
                </h3>
                <dl className="divide-y divide-[var(--color-border)] text-sm">
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-[var(--color-muted)]">DOI</dt>
                    <dd className="text-right">
                      <DOILink doi={paper.doi} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-[var(--color-muted)]">Published</dt>
                    <dd className="text-right font-medium text-[var(--color-text)]">
                      {formatDate(paper.publishedAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-[var(--color-muted)]">Section</dt>
                    <dd className="text-right font-medium text-[var(--color-text)]">
                      {paper.sectionType}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-[var(--color-muted)]">Licence</dt>
                    <dd className="text-right font-medium text-[var(--color-text)]">
                      {paper.licence}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Journal card */}
              {journal && (
                <Link
                  href={`/journals/${journal.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-primary)]">
                    <BookMarked size={18} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--color-muted)]">Published in</p>
                    <p className="truncate text-sm font-medium text-[var(--color-text)]">
                      {journal.abbreviation}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
