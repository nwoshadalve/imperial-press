/**
 * Resolve public client URLs into process.env when not explicitly set.
 * Used by compose scripts before Docker builds that need NEXT_PUBLIC_* build args.
 */
import { loadRepoEnv } from "./load-repo-env.mjs";
import {
  resolveApiBaseUrl,
  resolveMeilisearchHost,
} from "./resolve-env-urls.mjs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = loadRepoEnv(repoRoot);

if (!env.NEXT_PUBLIC_API_BASE_URL && !env.VITE_API_BASE_URL) {
  const apiBaseUrl = resolveApiBaseUrl(env);
  process.env.NEXT_PUBLIC_API_BASE_URL = apiBaseUrl;
  process.env.VITE_API_BASE_URL = apiBaseUrl;
}

if (!env.NEXT_PUBLIC_MEILISEARCH_HOST) {
  process.env.NEXT_PUBLIC_MEILISEARCH_HOST = resolveMeilisearchHost(env);
}

if (env.MEILISEARCH_SEARCH_KEY && !env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY) {
  process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY = env.MEILISEARCH_SEARCH_KEY;
}
