/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type { Subject } from '@/types';

export const subjects: Subject[] = [
  {
    id: 'sub-ai',
    slug: 'artificial-intelligence-and-computing',
    name: 'Artificial Intelligence & Computing',
    description:
      'Machine learning, data science, computer systems, and the theory and application of intelligent computation.',
    gradient: ['#4f46e5', '#0ea5e9'],
  },
  {
    id: 'sub-lang',
    slug: 'language-literature-and-translation',
    name: 'Language, Literature & Translation',
    description:
      'Linguistics, literary studies, applied language teaching, and translation and interpreting research.',
    gradient: ['#db2777', '#f97316'],
  },
  {
    id: 'sub-med',
    slug: 'medicine-and-health-sciences',
    name: 'Medicine & Health Sciences',
    description:
      'Clinical medicine, public health, nursing, and biomedical research across the health disciplines.',
    gradient: ['#059669', '#14b8a6'],
  },
  {
    id: 'sub-bus',
    slug: 'business-economics-and-management',
    name: 'Business, Economics & Management',
    description:
      'Economics, finance, management science, entrepreneurship, and organisational research.',
    gradient: ['#0891b2', '#6366f1'],
  },
  {
    id: 'sub-env',
    slug: 'environmental-and-earth-sciences',
    name: 'Environmental & Earth Sciences',
    description:
      'Sustainability, climate science, ecology, and the earth and environmental systems.',
    gradient: ['#16a34a', '#65a30d'],
  },
  {
    id: 'sub-soc',
    slug: 'social-sciences-and-education',
    name: 'Social Sciences & Education',
    description:
      'Education, sociology, psychology, and the humanities and social sciences broadly.',
    gradient: ['#7c3aed', '#db2777'],
  },
];

export function getSubject(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}
