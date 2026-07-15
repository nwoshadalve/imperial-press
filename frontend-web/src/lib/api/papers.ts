import { apiClient } from './index';
import type { Paper, PaginatedResponse } from '@/types';

export async function fetchPapers(page = 1, pageSize = 20): Promise<PaginatedResponse<Paper>> {
  const { data } = await apiClient.get<PaginatedResponse<Paper>>('/api/v1/papers', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function fetchPaperById(id: string): Promise<Paper> {
  const { data } = await apiClient.get<Paper>(`/api/v1/papers/${id}`);
  return data;
}

export async function trackPaperView(id: string): Promise<void> {
  await apiClient.post(`/api/v1/papers/${id}/view`).catch(() => {});
}

export async function getPaperDownloadUrl(id: string): Promise<string> {
  const { data } = await apiClient.get<{ url: string }>(`/api/v1/papers/${id}/download`);
  return data.url;
}
