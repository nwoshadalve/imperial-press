'use client';

import { useSearch } from '@/hooks/useSearch';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';

export function SearchPageClient() {
  const { results, isLoading, error, search } = useSearch();

  return (
    <>
      <SearchBar onSearch={search} />
      <SearchResults results={results} isLoading={isLoading} error={error} />
    </>
  );
}
