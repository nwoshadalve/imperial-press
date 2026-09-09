/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'author' | 'reviewer' | 'editor' | 'admin';
  avatarUrl?: string;
}

export type Frequency = 'Monthly' | 'Quarterly' | 'Bi-annual' | 'Annual';

export type SectionType =
  | 'Research Article'
  | 'Review Article'
  | 'Book Review'
  | 'Discussion Note'
  | 'Translated Article';

export interface Subject {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Tailwind gradient stops used for subject-coded cover tiles. */
  gradient: [string, string];
}

export interface EditorialMember {
  id: string;
  name: string;
  role: 'Editor-in-Chief' | 'Associate Editor' | 'Editorial Board Member';
  designation: string;
  institution: string;
  country: string;
}

export interface IndexingEntry {
  name: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  body: string;
}

export interface Journal {
  id: string;
  slug: string;
  /** Short display title (e.g. abbreviation-friendly). */
  title: string;
  /** Full journal name. */
  fullTitle: string;
  abbreviation: string;
  /** Legacy single-ISSN field kept for existing components. */
  issn: string;
  eIssn: string;
  pIssn: string;
  doiPrefix: string;
  description: string;
  subjectId: string;
  /** Subject name — kept for existing JournalCard. */
  subjectArea: string;
  isOpenAccess: boolean;
  yearStarted: number;
  frequency: Frequency;
  languages: string[];
  apcStandard: number;
  apcFastTrack: number;
  impactFactor: number;
  acceptanceRate: number;
  ccLicence: string;
  aimsAndScope: string;
  about: string;
  editorInChief: EditorialMember;
  editorialTeam: EditorialMember[];
  indexing: IndexingEntry[];
  announcements: Announcement[];
  coverImageUrl?: string;
}

export interface Author {
  id: string;
  name: string;
  affiliation?: string;
  email?: string;
  orcid?: string;
  country?: string;
}

export interface Issue {
  id: string;
  journalId: string;
  volume: number;
  number: number;
  year: number;
  publishedAt: string;
  /** e.g. "Vol. 3 No. 7 (2026)" */
  label: string;
}

export interface Paper {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  keywords: string[];
  authors: Author[];
  journalId: string;
  journalTitle: string;
  issueId: string;
  sectionType: SectionType;
  volume: number;
  issueNumber: number;
  pageStart: number;
  pageEnd: number;
  doi: string;
  licence: string;
  publishedAt: string;
  viewCount: number;
  downloadCount: number;
  citationCount: number;
  pdfUrl?: string;
  isOpenAccess: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
}

export interface ServiceItem {
  slug: string;
  title: string;
  description: string;
  /** lucide-react icon name resolved by the component. */
  icon: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

export interface Submission {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'published';
  journalId: string;
  submittedAt?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
