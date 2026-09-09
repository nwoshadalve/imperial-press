/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { MapPin } from 'lucide-react';

import { Avatar } from '@/components/shared/Avatar';
import type { EditorialMember } from '@/types';

interface Props {
  members: EditorialMember[];
}

const order: EditorialMember['role'][] = [
  'Editor-in-Chief',
  'Associate Editor',
  'Editorial Board Member',
];

export function EditorialTeam({ members }: Props) {
  const groups = order
    .map((role) => ({ role, people: members.filter((m) => m.role === role) }))
    .filter((g) => g.people.length > 0);

  return (
    <div className="space-y-8">
      {groups.map(({ role, people }) => (
        <div key={role}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {role}
            {people.length > 1 ? 's' : ''}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {people.map((m) => (
              <div
                key={m.id}
                className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
              >
                <Avatar name={m.name} className="h-12 w-12 text-sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-text)]">{m.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">{m.designation}</p>
                  <p className="mt-1 text-sm text-[var(--color-text)]">{m.institution}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                    <MapPin size={12} aria-hidden="true" />
                    {m.country}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
