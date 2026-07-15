import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { config } from '@/config';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--color-text)]">
            {config.siteName}
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/journals"
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Journals
            </Link>
            <Link
              href="/search"
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Search
            </Link>
            <Link
              href="/dashboard"
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
