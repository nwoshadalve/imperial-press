/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

/**
 * Mirrors the pre-paint theme (applied by the blocking script in <head>) into
 * the UI store, and keeps the app in sync with the OS preference for visitors
 * who have not made an explicit choice. Renders nothing of its own.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrateTheme = useUIStore((s) => s.hydrateTheme);
  const setTheme = useUIStore((s) => s.setTheme);

  useEffect(() => {
    hydrateTheme();

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      // Only auto-follow the OS while the user hasn't picked a theme themselves.
      let hasExplicit = false;
      try {
        hasExplicit = localStorage.getItem('theme') !== null;
      } catch {
        // ignore
      }
      if (!hasExplicit) setTheme(e.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [hydrateTheme, setTheme]);

  return <>{children}</>;
}
