/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

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
  // Optional — only used to build absolute OG/canonical URLs; empty when unset.
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "",
};

if (!process.env.PORT) {
  process.env.PORT = requireEnv("WEB_PORT");
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
