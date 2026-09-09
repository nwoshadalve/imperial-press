/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { JournalCard } from '@/components/journal/JournalCard';
import { getFeaturedJournals } from '@/lib/dummy/journals';

export function FeaturedJournals() {
  const featured = getFeaturedJournals();

  return (
    <section>
      <Container className="py-16">
        <SectionHeading
          eyebrow="Our Journals"
          title="Featured open-access journals"
          description="Explore some of our most active titles, spanning AI, medicine, and the humanities."
          action={{ label: 'View all journals', href: '/journals' }}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((journal) => (
            <JournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      </Container>
    </section>
  );
}
