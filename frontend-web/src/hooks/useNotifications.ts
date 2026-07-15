'use client';

import useSWR from 'swr';
import { apiClient } from '@/lib/api';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Notification } from '@/types';

async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<Notification[]>('/api/v1/notifications');
  return data;
}

export function useNotifications() {
  const { setNotifications } = useNotificationStore();

  return useSWR('/notifications', fetchNotifications, {
    onSuccess: setNotifications,
    revalidateOnFocus: true,
    refreshInterval: 30_000,
  });
}
