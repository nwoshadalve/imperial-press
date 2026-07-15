import type { Metadata } from 'next';
import { fetchJournals } from '@/lib/api/journals';
import { JournalCard } from '@/components/journal/JournalCard';

export const metadata: Metadata = { title: 'Journals' };

export default async function JournalsPage() {
  const { items: journals } = await fetchJournals().catch(() => ({ items: [] }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8">Journals</h1>

      {journals.length === 0 ? (
        <p className="text-[var(--color-muted)]">No journals available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => (
            <JournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      )}
    </div>
  );
}
