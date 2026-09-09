/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type { BlogPost, ServiceItem, Stat } from '@/types';

export const stats: Stat[] = [
  { label: 'Published Authors', value: 12480 },
  { label: 'Total Citations', value: 86200, suffix: '+' },
  { label: 'Countries', value: 92 },
  { label: 'Peer Reviewers', value: 3140 },
  { label: 'Article Views', value: 2100000, suffix: '+' },
  { label: 'Total Downloads', value: 940000, suffix: '+' },
];

export const services: ServiceItem[] = [
  {
    slug: 'english-language-editing',
    title: 'English Language Editing',
    description:
      'Native-speaker editors refine grammar, clarity, and academic tone so reviewers focus on your science.',
    icon: 'SpellCheck',
  },
  {
    slug: 'academic-translation',
    title: 'Academic Translation',
    description:
      'Discipline-aware translation that preserves technical meaning across the languages we support.',
    icon: 'Languages',
  },
  {
    slug: 'plagiarism-check',
    title: 'Plagiarism Check',
    description:
      'Similarity screening with a detailed report before submission, so you can publish with confidence.',
    icon: 'ShieldCheck',
  },
  {
    slug: 'manuscript-formatting',
    title: 'Manuscript Formatting',
    description:
      'We format your manuscript, tables, and references to match each journal’s template and style.',
    icon: 'FileText',
  },
];

export const posts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'open-access-week-2026',
    title: 'Imperial Press Joins Open Access Week 2026',
    excerpt:
      'This year we reaffirm our commitment to barrier-free scholarship with new author waivers and expanded indexing across all journals.',
    category: 'Announcements',
    author: 'Editorial Office',
    publishedAt: '2026-07-10',
    readingMinutes: 4,
  },
  {
    id: 'post-2',
    slug: 'how-double-blind-review-works',
    title: 'How Double-Blind Peer Review Works at Imperial Press',
    excerpt:
      'A behind-the-scenes look at how manuscripts are anonymised, matched to reviewers, and moved from submission to decision.',
    category: 'Peer Review',
    author: 'Dr. Nadia El-Amin',
    publishedAt: '2026-06-22',
    readingMinutes: 7,
  },
  {
    id: 'post-3',
    slug: 'writing-a-strong-abstract',
    title: 'Writing a Strong Abstract: A Practical Checklist',
    excerpt:
      'The abstract is the most-read part of your paper. Here is how to make yours clear, complete, and compelling in 350 words.',
    category: 'Author Resources',
    author: 'Editorial Office',
    publishedAt: '2026-06-05',
    readingMinutes: 6,
  },
  {
    id: 'post-4',
    slug: 'new-journal-ijess-launch',
    title: 'Introducing the International Journal of Environmental Studies & Sustainability',
    excerpt:
      'Our newest title welcomes interdisciplinary, solutions-oriented research on climate, biodiversity, and sustainable development.',
    category: 'Announcements',
    author: 'Editorial Office',
    publishedAt: '2026-05-18',
    readingMinutes: 3,
  },
];

export const whyPublishReasons: { title: string; description: string; icon: string }[] = [
  {
    title: 'Rigorous, Fast Peer Review',
    description:
      'Double-blind review with a median first decision in 28 days — rigour without the wait.',
    icon: 'Gauge',
  },
  {
    title: 'Global Visibility',
    description:
      'Every article is open access, DOI-registered, and indexed in major scholarly databases.',
    icon: 'Globe',
  },
  {
    title: 'You Keep Your Copyright',
    description:
      'Authors retain copyright under a CC BY 4.0 licence. Your work stays yours, freely readable by all.',
    icon: 'Copyright',
  },
  {
    title: 'Certificates & Recognition',
    description:
      'Verifiable acceptance, publication, and peer-review certificates for every contributor.',
    icon: 'Award',
  },
  {
    title: 'Author Support',
    description:
      'Editing, translation, and formatting services help your manuscript put its best foot forward.',
    icon: 'LifeBuoy',
  },
  {
    title: 'Long-Term Archiving',
    description:
      'Content is preserved for the long term so the scholarly record remains permanent and citable.',
    icon: 'Archive',
  },
];
