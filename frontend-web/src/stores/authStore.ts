import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setTokens: (accessToken) => set({ accessToken, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
