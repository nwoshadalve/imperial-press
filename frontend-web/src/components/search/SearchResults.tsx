'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { Paper } from '@/types';

interface Props {
  results: Paper[];
  isLoading: boolean;
  error: string | null;
}

export function SearchResults({ results, isLoading, error }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-[var(--color-error)]">{error}</p>;
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {results.map((paper) => (
        <Link key={paper.id} href={`/papers/${paper.id}`} className="block">
          <Card className="hover:shadow-md transition-shadow">
            <h2 className="font-semibold text-[var(--color-text)] mb-1">{paper.title}</h2>
            <p className="text-sm text-[var(--color-muted)] line-clamp-2">{paper.abstract}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
