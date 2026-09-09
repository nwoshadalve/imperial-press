/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { Container } from '@/components/ui/Container';
import { stats } from '@/lib/dummy/content';
import { formatCount } from '@/lib/utils/format';

export function StatsBar() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container className="py-10">
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                {formatCount(stat.value)}
                {stat.suffix ?? ''}
              </dd>
              <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)] sm:text-sm">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
