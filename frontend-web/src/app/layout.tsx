/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type { Metadata, Viewport } from 'next';

import '@/styles/globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Providers } from '@/components/providers/Providers';
import { config } from '@/config';

export const metadata: Metadata = {
  ...(config.siteUrl ? { metadataBase: new URL(config.siteUrl) } : {}),
  title: { default: config.siteName, template: `%s | ${config.siteName}` },
  description: config.siteDescription,
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: config.siteName,
    title: config.siteName,
    description: config.siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: config.siteName,
    description: config.siteDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script prevents a flash-of-wrong-theme before hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch{}`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        {/* Keyboard/screen-reader users can jump straight to content. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[var(--color-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-primary-fg)]"
        >
          Skip to content
        </a>

        <ThemeProvider>
          <Providers>
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
