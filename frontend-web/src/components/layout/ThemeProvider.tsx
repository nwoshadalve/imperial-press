'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const t = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (t === 'dark' || (!t && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  return <>{children}</>;
}
