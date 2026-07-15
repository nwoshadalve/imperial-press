'use client';

import useSWR from 'swr';
import { fetchSubmissions } from '@/lib/api/submissions';

export function useSubmissions(page = 1, pageSize = 20) {
  return useSWR(
    ['/submissions', page, pageSize],
    () => fetchSubmissions(page, pageSize),
    { revalidateOnFocus: false },
  );
}
