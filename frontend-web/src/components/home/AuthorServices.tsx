/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { LucideIcon } from '@/components/shared/LucideIcon';
import { services } from '@/lib/dummy/content';

export function AuthorServices() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container className="py-16">
        <SectionHeading
          eyebrow="Author Services"
          title="Support at every stage of your manuscript"
          description="Optional services that help your research meet the highest editorial standards."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 transition-all hover:border-[var(--color-primary)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <LucideIcon name={service.icon} size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{service.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
