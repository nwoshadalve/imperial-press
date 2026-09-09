/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { useUIStore } from '@/stores/uiStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cn } from '@/lib/utils/cn';
import { primaryNav } from './navItems';

/**
 * Accessible mobile navigation: a hamburger trigger (< md) and a slide-in
 * drawer. Handles Escape-to-close, background scroll lock, a focus trap,
 * focus restoration, and auto-close on route change.
 */
export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const openNav = useUIStore((s) => s.openMobileNav);
  const closeNav = useUIStore((s) => s.closeMobileNav);
  const pathname = usePathname();

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(open);

  // Close whenever the route changes (link tapped, back/forward).
  useEffect(() => {
    closeNav();
  }, [pathname, closeNav]);

  // Escape to close + focus trap while open; restore focus to trigger on close.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Focus the first focusable element in the panel.
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeNav();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, closeNav]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openNav}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-colors"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] md:hidden" role="presentation">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeNav}
            className="absolute inset-0 bg-black/50 animate-fade-in"
            tabIndex={-1}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="absolute right-0 top-0 h-full w-[85%] max-w-xs bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-xl animate-slide-in-right flex flex-col"
          >
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
              <span className="text-base font-semibold text-[var(--color-text)]">
                Menu
              </span>
              <button
                type="button"
                onClick={closeNav}
                aria-label="Close menu"
                className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-colors"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2" aria-label="Primary">
              <ul className="flex flex-col gap-1">
                {primaryNav.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                          active
                            ? 'bg-[var(--color-surface)] text-[var(--color-text)]'
                            : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-[var(--color-border)] p-4">
              <Link
                href="/login"
                className="block rounded-lg bg-[var(--color-primary)] px-4 py-3 text-center text-base font-medium text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
