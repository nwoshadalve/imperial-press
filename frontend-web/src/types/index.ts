export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'author' | 'reviewer' | 'editor' | 'admin';
  avatarUrl?: string;
}

export interface Journal {
  id: string;
  slug: string;
  title: string;
  issn: string;
  description: string;
  coverImageUrl?: string;
  isOpenAccess: boolean;
  subjectArea: string;
}

export interface Author {
  id: string;
  name: string;
  affiliation?: string;
  email?: string;
  orcid?: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authors: Author[];
  journalId: string;
  journalTitle: string;
  doi: string;
  publishedAt: string;
  viewCount: number;
  downloadCount: number;
  pdfUrl?: string;
  isOpenAccess: boolean;
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
