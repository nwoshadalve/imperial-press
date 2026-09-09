/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { posts } from '@/lib/dummy/content';
import { formatDate } from '@/lib/utils/format';

export function LatestPosts() {
  return (
    <section>
      <Container className="py-16">
        <SectionHeading
          eyebrow="From the Blog"
          title="Latest from Imperial Press"
          description="News, author resources, and updates from our editorial team."
          action={{ label: 'Visit the blog', href: '/blog' }}
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-all hover:border-[var(--color-primary)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            >
              <Badge variant="outline" className="w-fit">
                {post.category}
              </Badge>
              <h3 className="mt-3 flex-1 font-semibold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
                {post.excerpt}
              </p>
              <p className="mt-4 text-xs text-[var(--color-muted)]">
                {formatDate(post.publishedAt)} · {post.readingMinutes} min read
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
