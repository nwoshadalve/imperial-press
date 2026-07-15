import { apiClient } from './index';
import type { Journal, PaginatedResponse } from '@/types';

export async function fetchJournals(page = 1, pageSize = 20): Promise<PaginatedResponse<Journal>> {
  const { data } = await apiClient.get<PaginatedResponse<Journal>>('/api/v1/journals', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function fetchJournalBySlug(slug: string): Promise<Journal> {
  const { data } = await apiClient.get<Journal>(`/api/v1/journals/${slug}`);
  return data;
}
