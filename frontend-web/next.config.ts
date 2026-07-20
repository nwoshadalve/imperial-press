import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import { resolve } from "path";

// Load global env from the monorepo root (not frontend-web/).
// forceReload: Next may have already cached an empty load from this app dir
// (no local .env), which would otherwise ignore the monorepo-root path.
const repoRoot = resolve(__dirname, "..");
loadEnvConfig(repoRoot, process.env.NODE_ENV !== "production", console, true);

function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in the repo-root .env (see .env.example).`,
    );
  }
  return value;
}

// Inlined into the client/server bundles — Turbopack does not pick up parent-dir .env alone.
const publicEnv = {
  NEXT_PUBLIC_API_BASE_URL: requireEnv("NEXT_PUBLIC_API_BASE_URL"),
  NEXT_PUBLIC_MEILISEARCH_HOST: requireEnv("NEXT_PUBLIC_MEILISEARCH_HOST"),
  NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY: requireEnv("NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY"),
};

if (!process.env.PORT) {
  process.env.PORT = requireEnv("WEB_PORT");
}

const nextConfig: NextConfig = {
  output: "standalone",
  env: publicEnv,
};

export default nextConfig;
