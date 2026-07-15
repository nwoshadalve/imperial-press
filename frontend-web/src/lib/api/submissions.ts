import { apiClient } from './index';
import type { Submission, PaginatedResponse } from '@/types';

export async function fetchSubmissions(page = 1, pageSize = 20): Promise<PaginatedResponse<Submission>> {
  const { data } = await apiClient.get<PaginatedResponse<Submission>>('/api/v1/submissions', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function fetchSubmissionDraft(): Promise<Partial<Submission>> {
  const { data } = await apiClient.get<Partial<Submission>>('/api/v1/submissions/draft');
  return data;
}

export async function saveDraft(draft: Partial<Submission>): Promise<void> {
  await apiClient.put('/api/v1/submissions/draft', draft);
}
