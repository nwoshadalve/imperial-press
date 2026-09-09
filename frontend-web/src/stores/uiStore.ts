/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'theme';

interface UIState {
  /** Current resolved theme. Kept in sync with the `.dark` class on <html>. */
  theme: Theme;
  /** Whether the mobile navigation drawer is open. */
  mobileNavOpen: boolean;

  /** Apply a theme: update state, persist to localStorage, toggle the DOM class. */
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /**
   * Read the theme already applied to <html> by the blocking head script and
   * mirror it into the store — without touching the DOM (avoids a flash).
   */
  hydrateTheme: () => void;

  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

function applyThemeClass(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',
  mobileNavOpen: false,

  setTheme: (theme) => {
    applyThemeClass(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage may be unavailable (private mode / blocked cookies).
    }
    set({ theme });
  },

  toggleTheme: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark');
  },

  hydrateTheme: () => {
    if (typeof document === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');
    set({ theme: isDark ? 'dark' : 'light' });
  },

  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
}));
