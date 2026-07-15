export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000',
  meilisearchHost: process.env.NEXT_PUBLIC_MEILISEARCH_HOST ?? 'http://localhost:7700',
  meilisearchSearchKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY ?? '',
  siteName: 'Imperial Press',
  siteDescription: 'Academic publishing platform for peer-reviewed journals',
} as const;
