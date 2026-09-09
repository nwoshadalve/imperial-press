/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils/cn';

export interface NavSection {
  id: string;
  label: string;
}

interface Props {
  sections: NavSection[];
}

/** Sticky in-page navigation with scroll-spy highlighting the active section. */
export function JournalSideNav({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Trigger when a section's heading nears the top under the sticky navbar.
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="space-y-1">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={cn(
            'block rounded-lg border-l-2 px-3 py-1.5 text-sm transition-colors',
            active === s.id
              ? 'border-[var(--color-primary)] bg-[var(--color-surface)] font-medium text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]',
          )}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
