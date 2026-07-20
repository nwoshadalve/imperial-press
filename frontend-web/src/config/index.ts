function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in the repo-root .env (see .env.example).`,
    );
  }
  return value;
}

export const config = {
  apiBaseUrl: requireEnv('NEXT_PUBLIC_API_BASE_URL'),
  meilisearchHost: requireEnv('NEXT_PUBLIC_MEILISEARCH_HOST'),
  meilisearchSearchKey: requireEnv('NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY'),
  siteName: 'Imperial Press',
  siteDescription: 'Academic publishing platform for peer-reviewed journals',
} as const;
