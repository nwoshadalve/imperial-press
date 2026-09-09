/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type { Metadata } from 'next';

import { Container } from '@/components/ui/Container';
import { JournalsExplorer } from '@/components/journal/JournalsExplorer';
import { journals } from '@/lib/dummy/journals';
import { subjects } from '@/lib/dummy/subjects';

export const metadata: Metadata = {
  title: 'Journals',
  description: 'Browse all open-access, peer-reviewed journals published by Imperial Press.',
};

export default function JournalsPage() {
  return (
    <div className="border-b border-[var(--color-border)]">
      <Container className="py-12 lg:py-16">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            Our Journals
          </h1>
          <p className="mt-3 text-lg text-[var(--color-muted)]">
            {journals.length} open-access, peer-reviewed journals across {subjects.length} subject
            areas. Every article is freely available and DOI-registered.
          </p>
        </header>

        <div className="mt-10">
          <JournalsExplorer journals={journals} subjects={subjects} />
        </div>
      </Container>
    </div>
  );
}
