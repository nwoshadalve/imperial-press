/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in the repo-root .env (see .env.example).`,
    );
  }
  return value;
}

function optionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value === undefined || value === '' ? undefined : value;
}

export const config = {
  apiBaseUrl: requireEnv('NEXT_PUBLIC_API_BASE_URL'),
  meilisearchHost: requireEnv('NEXT_PUBLIC_MEILISEARCH_HOST'),
  meilisearchSearchKey: requireEnv('NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY'),
  // Public origin (e.g. https://imperialpress.com). Only used to build absolute
  // canonical/OG URLs; optional so local dev works without it.
  siteUrl: optionalEnv('NEXT_PUBLIC_SITE_URL'),
  siteName: 'Imperial Press',
  siteDescription: 'Academic publishing platform for peer-reviewed journals',
} as const;
