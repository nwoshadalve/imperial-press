import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { OpenAccessBadge } from '@/components/shared/OpenAccessBadge';
import type { Journal } from '@/types';

interface Props {
  journal: Journal;
}

export function JournalCard({ journal }: Props) {
  return (
    <Link href={`/journals/${journal.slug}`} className="block">
      <Card className="h-full hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2 className="font-semibold text-[var(--color-text)] leading-snug">{journal.title}</h2>
          {journal.isOpenAccess && <OpenAccessBadge />}
        </div>
        <p className="text-sm text-[var(--color-muted)] mb-3 line-clamp-3">{journal.description}</p>
        <p className="text-xs text-[var(--color-muted)] font-mono">ISSN: {journal.issn}</p>
      </Card>
    </Link>
  );
}
