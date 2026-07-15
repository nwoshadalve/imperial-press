import type { Metadata } from 'next';
import { SearchPageClient } from './SearchPageClient';

export const metadata: Metadata = { title: 'Search' };

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8">Search</h1>
      <SearchPageClient />
    </div>
  );
}
