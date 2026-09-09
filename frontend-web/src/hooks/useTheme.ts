/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useUIStore } from '@/stores/uiStore';
import type { Theme } from '@/stores/uiStore';

/**
 * Thin selector over the UI store. The store is the single source of truth for
 * theme; the blocking head script sets the initial `.dark` class before paint
 * and `ThemeProvider` hydrates the store from it.
 */
export function useTheme() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return { theme, setTheme, toggleTheme } as {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
  };
}
