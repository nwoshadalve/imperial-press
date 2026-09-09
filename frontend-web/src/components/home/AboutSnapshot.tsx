/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';
import { Building2, Target, Eye, ArrowRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';

const items = [
  {
    icon: Building2,
    title: 'Who We Are',
    body: 'An independent, open-access publisher connecting researchers across 90+ countries through rigorously reviewed scholarship.',
  },
  {
    icon: Target,
    title: 'Our Mission',
    body: 'To make high-quality research freely available to everyone, and to give every author a fast, fair, and transparent path to publication.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    body: 'A scholarly record without paywalls — where knowledge is a public good and discovery is never gated by cost.',
  },
];

export function AboutSnapshot() {
  return (
    <section>
      <Container className="py-16">
        <SectionHeading
          eyebrow="About Imperial Press"
          title="Open scholarship, built on trust"
          description="We pair academic rigour with a modern, author-friendly publishing experience."
          action={{ label: 'Read our story', href: '/about' }}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-primary)]">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-[var(--color-text)]">{title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)]"
          >
            Read our story <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
