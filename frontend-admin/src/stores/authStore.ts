/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { create } from 'zustand'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin'
}

interface AuthStore {
  user: AdminUser | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: AdminUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}))
