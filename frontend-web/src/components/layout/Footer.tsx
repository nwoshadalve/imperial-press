import Link from 'next/link';
import { config } from '@/config';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-[var(--color-text)] mb-3">{config.siteName}</h3>
            <p className="text-sm text-[var(--color-muted)]">{config.siteDescription}</p>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-3 text-sm">Publish</h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link href="/dashboard/submissions" className="hover:text-[var(--color-text)] transition-colors">
                  Submit a Paper
                </Link>
              </li>
              <li>
                <Link href="/apc" className="hover:text-[var(--color-text)] transition-colors">
                  Publication Fees
                </Link>
              </li>
              <li>
                <Link href="/publication-ethics" className="hover:text-[var(--color-text)] transition-colors">
                  Publication Ethics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link href="/journals" className="hover:text-[var(--color-text)] transition-colors">
                  Journals
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[var(--color-text)] transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[var(--color-text)] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link href="/about" className="hover:text-[var(--color-text)] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-text)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[var(--color-text)] transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-muted)]">
          © {new Date().getFullYear()} {config.siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
