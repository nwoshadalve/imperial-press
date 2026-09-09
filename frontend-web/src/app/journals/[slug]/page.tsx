/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Globe, Mail, Megaphone } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { OpenAccessBadge } from '@/components/shared/OpenAccessBadge';
import { JournalCover } from '@/components/shared/JournalCover';
import { EditorialTeam } from '@/components/journal/EditorialTeam';
import { IssueArticleList } from '@/components/journal/IssueArticleList';
import { JournalQuickFacts } from '@/components/journal/JournalQuickFacts';
import { JournalSideNav, type NavSection } from '@/components/journal/JournalSideNav';
import { journals, getJournal } from '@/lib/dummy/journals';
import { getSubject } from '@/lib/dummy/subjects';
import { latestIssue, issuesForJournal, papersInIssue } from '@/lib/dummy/papers';
import { formatDate } from '@/lib/utils/format';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return journals.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const journal = getJournal(slug);
  if (!journal) return { title: 'Journal' };
  return {
    title: journal.fullTitle,
    description: journal.description,
  };
}

const sections: NavSection[] = [
  { id: 'about', label: 'About Journal' },
  { id: 'aims-scope', label: 'Aims & Scope' },
  { id: 'editorial-team', label: 'Editorial Team' },
  { id: 'indexing', label: 'Abstracting & Indexing' },
  { id: 'latest-issue', label: 'Latest Issue' },
  { id: 'all-issues', label: 'All Issues' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'contact', label: 'Contact' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-xl font-bold tracking-tight text-[var(--color-text)] sm:text-2xl">
      {children}
    </h2>
  );
}

export default async function JournalDetailPage({ params }: Props) {
  const { slug } = await params;
  const journal = getJournal(slug);
  if (!journal) notFound();

  const subject = getSubject(journal.subjectId);
  const gradient = subject?.gradient ?? ['#1e40af', '#0ea5e9'];
  const issue = latestIssue(slug);
  const issuePapers = issue ? papersInIssue(issue.id) : [];
  const allIssues = issuesForJournal(slug);

  return (
    <div>
      {/* Hero */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Container className="py-10 lg:py-12">
          <nav className="mb-6 text-sm text-[var(--color-muted)]">
            <Link href="/journals" className="hover:text-[var(--color-primary)]">
              Journals
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--color-text)]">{journal.abbreviation}</span>
          </nav>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <JournalCover
              abbreviation={journal.abbreviation}
              gradient={gradient}
              className="h-24 w-24 shrink-0"
              textClassName="text-lg"
            />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <OpenAccessBadge />
                <Badge variant="outline">{journal.subjectArea}</Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                {journal.fullTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-[var(--color-muted)]">{journal.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--color-muted)]">
                <span>
                  Impact Factor{' '}
                  <strong className="text-[var(--color-text)]">
                    {journal.impactFactor.toFixed(1)}
                  </strong>
                </span>
                <span>
                  Acceptance{' '}
                  <strong className="text-[var(--color-text)]">{journal.acceptanceRate}%</strong>
                </span>
                <span>
                  Since <strong className="text-[var(--color-text)]">{journal.yearStarted}</strong>
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Body: nav / content / facts */}
      <Container className="py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)_280px]">
          {/* Left in-page nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <JournalSideNav sections={sections} />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 space-y-14">
            <section id="about" className="scroll-mt-24">
              <SectionTitle>About the Journal</SectionTitle>
              <p className="leading-relaxed text-[var(--color-text)]">{journal.about}</p>
            </section>

            <section id="aims-scope" className="scroll-mt-24">
              <SectionTitle>Aims &amp; Scope</SectionTitle>
              <p className="leading-relaxed text-[var(--color-text)]">{journal.aimsAndScope}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {journal.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </section>

            <section id="editorial-team" className="scroll-mt-24">
              <SectionTitle>Editorial Team</SectionTitle>
              <EditorialTeam members={journal.editorialTeam} />
            </section>

            <section id="indexing" className="scroll-mt-24">
              <SectionTitle>Abstracting &amp; Indexing</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                {journal.indexing.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-primary)]">
                      <Globe size={18} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{entry.name}</p>
                      <p className="text-sm text-[var(--color-muted)]">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="latest-issue" className="scroll-mt-24">
              <SectionTitle>Latest Issue</SectionTitle>
              {issue && (
                <p className="mb-5 text-sm text-[var(--color-muted)]">
                  <strong className="text-[var(--color-text)]">{issue.label}</strong> · published{' '}
                  {formatDate(issue.publishedAt)}
                </p>
              )}
              <IssueArticleList papers={issuePapers} />
            </section>

            <section id="all-issues" className="scroll-mt-24">
              <SectionTitle>All Issues</SectionTitle>
              <ul className="grid gap-2 sm:grid-cols-2">
                {allIssues.map((iss) => (
                  <li key={iss.id}>
                    <span className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)]">
                      {iss.label}
                      <span className="text-xs text-[var(--color-muted)]">
                        {formatDate(iss.publishedAt)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="announcements" className="scroll-mt-24">
              <SectionTitle>Announcements</SectionTitle>
              <div className="space-y-4">
                {journal.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <Megaphone size={18} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{ann.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        {formatDate(ann.date)}
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">{ann.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="contact" className="scroll-mt-24">
              <SectionTitle>Contact</SectionTitle>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                <p className="flex items-center gap-2 text-[var(--color-text)]">
                  <Mail size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
                  <a
                    href={`mailto:${journal.slug}@imperialpress.com`}
                    className="hover:text-[var(--color-primary)]"
                  >
                    {journal.slug}@imperialpress.com
                  </a>
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Editorial office typically responds within 3–5 business days. Editor-in-Chief:{' '}
                  {journal.editorInChief.name}, {journal.editorInChief.institution}.
                </p>
              </div>
            </section>
          </main>

          {/* Right facts / CTA */}
          <aside>
            <div className="sticky top-24">
              <JournalQuickFacts journal={journal} />
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
