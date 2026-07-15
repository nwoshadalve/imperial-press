'use client';

import useSWR from 'swr';
import { getMe } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const { isLoading } = useSWR(isAuthenticated ? '/auth/me' : null, getMe, {
    onSuccess: (data) => useAuthStore.getState().setUser(data),
    onError: logout,
    revalidateOnFocus: false,
  });

  return { user, isAuthenticated, isLoading };
}
