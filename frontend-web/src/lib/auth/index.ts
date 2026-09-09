/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { refreshToken } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';

export async function initAuth(): Promise<void> {
  try {
    const { access_token } = await refreshToken();
    useAuthStore.getState().setTokens(access_token);
  } catch {
    useAuthStore.getState().logout();
  }
}
