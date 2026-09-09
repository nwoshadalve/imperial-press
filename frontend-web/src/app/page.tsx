/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';
import { AboutSnapshot } from '@/components/home/AboutSnapshot';
import { AuthorServices } from '@/components/home/AuthorServices';
import { FeaturedJournals } from '@/components/home/FeaturedJournals';
import { WhyPublish } from '@/components/home/WhyPublish';
import { LatestPosts } from '@/components/home/LatestPosts';
import { HomeSearch } from '@/components/home/HomeSearch';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <AboutSnapshot />
      <AuthorServices />
      <FeaturedJournals />
      <WhyPublish />
      <LatestPosts />
      <HomeSearch />
    </>
  );
}
