/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';
import { ArrowRight, BadgeCheck, BookOpen } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { journals } from '@/lib/dummy/journals';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      {/* Decorative gradient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] dark:opacity-20"
        style={{
          background:
            'radial-gradient(60% 60% at 20% 0%, var(--color-primary) 0%, transparent 60%), radial-gradient(50% 50% at 100% 20%, #0ea5e9 0%, transparent 55%)',
        }}
      />

      <Container className="py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
            <BadgeCheck size={14} className="text-[var(--color-success)]" aria-hidden="true" />
            Fully open access · {journals.length} peer-reviewed journals
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
            Advancing knowledge through{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-sky-500 bg-clip-text text-transparent">
              open science
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted)]">
            Imperial Press publishes rigorous, peer-reviewed research across the sciences,
            humanities, and health. Submit your work to fast, fair, and freely readable journals.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/journals"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-base font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              <BookOpen size={18} aria-hidden="true" />
              Explore Journals
            </Link>
            <Link
              href="/dashboard/submissions"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-3 text-base font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]"
            >
              Submit a Paper
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
