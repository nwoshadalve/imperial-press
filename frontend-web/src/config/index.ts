/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

function missingEnv(key: string): never {
  throw new Error(
    `Missing required environment variable: ${key}. Set it in the repo-root .env (see .env.example).`,
  );
}

// Static process.env.NEXT_PUBLIC_* access is required — Next inlines these at build
// time from next.config.ts / the dev launcher. Dynamic process.env[key] is not replaced.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!apiBaseUrl) missingEnv('NEXT_PUBLIC_API_BASE_URL');

const meilisearchHost = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
if (!meilisearchHost) missingEnv('NEXT_PUBLIC_MEILISEARCH_HOST');

const meilisearchSearchKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY;
if (!meilisearchSearchKey) missingEnv('NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY');

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || undefined;

export const config = {
  apiBaseUrl,
  meilisearchHost,
  meilisearchSearchKey,
  // Public origin (e.g. https://imperialpress.com). Only used to build absolute
  // canonical/OG URLs; optional so local dev works without it.
  siteUrl,
  siteName: 'Imperial Press',
  siteDescription: 'Academic publishing platform for peer-reviewed journals',
} as const;
