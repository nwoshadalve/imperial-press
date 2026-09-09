/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import { resolve } from "path";
import { loadRepoEnv } from "../scripts/load-repo-env.mjs";
import {
  pick,
  resolveApiBaseUrl,
  resolveMeilisearchHost,
  resolveSiteUrl,
} from "../scripts/resolve-env-urls.mjs";

// Load global env from the monorepo root (not frontend-web/).
// forceReload: Next may have already cached an empty load from this app dir
// (no local .env), which would otherwise ignore the monorepo-root path.
const repoRoot = resolve(__dirname, "..");
loadEnvConfig(repoRoot, process.env.NODE_ENV !== "production", console, true);
const repoEnv = loadRepoEnv(repoRoot);

function requireFromEnv(
  env: Record<string, string>,
  key: string,
  label: string,
): string {
  const value = pick(env, key);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key} (${label}). Set it in the repo-root .env (see .env.example).`,
    );
  }
  return value;
}

// Inlined into the client/server bundles — Turbopack does not pick up parent-dir .env alone.
const publicEnv = {
  NEXT_PUBLIC_API_BASE_URL: resolveApiBaseUrl(repoEnv),
  NEXT_PUBLIC_MEILISEARCH_HOST: resolveMeilisearchHost(repoEnv),
  NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY: requireFromEnv(
    repoEnv,
    "MEILISEARCH_SEARCH_KEY",
    "MeiliSearch search-only key",
  ),
  NEXT_PUBLIC_SITE_URL: resolveSiteUrl(repoEnv),
};

if (!process.env.PORT) {
  process.env.PORT = requireFromEnv(repoEnv, "WEB_PORT", "public website dev port");
}

// The API host is allowed as a remote image source (covers presigned asset URLs).
const apiUrl = new URL(publicEnv.NEXT_PUBLIC_API_BASE_URL);

const nextConfig: NextConfig = {
  output: "standalone",
  env: publicEnv,
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  images: {
    // Serve modern formats first; smaller payloads on low-end mobile.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port || undefined,
      },
    ],
  },

  compiler: {
    // Strip console.* (except error/warn) from production bundles.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  experimental: {
    // Tree-shake barrel imports from icon/util packages → less client JS.
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default nextConfig;
