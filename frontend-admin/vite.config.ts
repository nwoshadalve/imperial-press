/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { loadRepoEnv } from '../scripts/load-repo-env.mjs'
import { pick, resolveApiBaseUrl } from '../scripts/resolve-env-urls.mjs'

const repoRoot = resolve(__dirname, '..')

/** Prefer repo-root .env; fall back to process.env (Docker build args). */
function envValue(
  fileEnv: Record<string, string>,
  key: string,
): string | undefined {
  return pick(fileEnv, key)
}

/** Normalize to "/admin" style (leading slash, no trailing slash). */
function normalizeBasePath(raw: string): string {
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  return withSlash.replace(/\/+$/, '') || ''
}

export default defineConfig(({ mode }) => {
  const fileEnv = {
    ...loadRepoEnv(repoRoot),
    ...loadEnv(mode, repoRoot, ''),
  }

  const apiBaseUrl = resolveApiBaseUrl(fileEnv)

  const port = Number(envValue(fileEnv, 'ADMIN_PORT'))
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(
      'ADMIN_PORT is required — set it in the repo-root .env (see .env.example).',
    )
  }

  const adminBasePath = normalizeBasePath(
    envValue(fileEnv, 'ADMIN_BASE_PATH') ?? '/admin',
  )
  // Vite `base` must end with "/"
  const base = `${adminBasePath}/`

  return {
    base,
    envDir: repoRoot,
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port,
      open: base,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port,
      open: base,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
