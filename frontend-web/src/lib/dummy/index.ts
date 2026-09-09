/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

export * from './subjects';
export * from './journals';
export * from './papers';
export * from './content';

import { subjects } from './subjects';
import type { Subject } from '@/types';

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}
