import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchJournalBySlug } from '@/lib/api/journals';
import { OpenAccessBadge } from '@/components/shared/OpenAccessBadge';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const journal = await fetchJournalBySlug(slug).catch(() => null);
  return { title: journal?.title ?? 'Journal' };
}

export default async function JournalDetailPage({ params }: Props) {
  const { slug } = await params;
  const journal = await fetchJournalBySlug(slug).catch(() => null);

  if (!journal) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-prose">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">{journal.title}</h1>
          {journal.isOpenAccess && <OpenAccessBadge />}
        </div>
        <p className="text-sm text-[var(--color-muted)] font-mono mb-6">ISSN: {journal.issn}</p>
        <p className="text-[var(--color-text)] leading-relaxed">{journal.description}</p>
      </div>
    </div>
  );
}
