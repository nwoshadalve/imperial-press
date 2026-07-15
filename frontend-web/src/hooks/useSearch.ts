'use client';

import { useState, useCallback } from 'react';
import { Meilisearch } from 'meilisearch';
import { config } from '@/config';
import type { Paper } from '@/types';

const client = new Meilisearch({
  host: config.meilisearchHost,
  apiKey: config.meilisearchSearchKey,
});

export function useSearch() {
  const [results, setResults] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await client.index('papers').search<Paper>(query, { limit: 20 });
      setResults(res.hits);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, isLoading, error, search };
}
