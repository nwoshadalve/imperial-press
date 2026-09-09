/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { LucideIcon } from '@/components/shared/LucideIcon';
import { whyPublishReasons } from '@/lib/dummy/content';

export function WhyPublish() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container className="py-16">
        <SectionHeading
          eyebrow="Why Imperial Press"
          title="Everything authors need to publish with confidence"
          align="center"
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyPublishReasons.map((reason) => (
            <div
              key={reason.title}
              className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <LucideIcon name={reason.icon} size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)]">{reason.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
