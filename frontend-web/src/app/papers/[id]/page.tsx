import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPaperById } from '@/lib/api/papers';
import { OpenAccessBadge } from '@/components/shared/OpenAccessBadge';
import { DOILink } from '@/components/shared/DOILink';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const paper = await fetchPaperById(id).catch(() => null);
  return { title: paper?.title ?? 'Paper' };
}

export default async function PaperDetailPage({ params }: Props) {
  const { id } = await params;
  const paper = await fetchPaperById(id).catch(() => null);

  if (!paper) notFound();

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-prose">
        <div className="flex flex-wrap gap-3 items-start mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] leading-snug">
            {paper.title}
          </h1>
          {paper.isOpenAccess && <OpenAccessBadge />}
        </div>

        <p className="text-sm text-[var(--color-muted)] mb-2">
          {paper.authors.map((a) => a.name).join(', ')}
        </p>

        {paper.doi && <DOILink doi={paper.doi} />}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Abstract</h2>
          <p className="text-[var(--color-text)] leading-relaxed max-w-prose">{paper.abstract}</p>
        </section>

        {paper.keywords.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">
              Keywords
            </h2>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-muted)]"
                >
                  {kw}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
